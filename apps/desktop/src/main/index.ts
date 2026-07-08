import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  type MenuItemConstructorOptions,
  nativeImage,
  shell,
} from "electron";
import log from "electron-log/main.js";
import windowStateKeeper from "electron-window-state";
import type { DesktopServerSettings } from "../shared/server-settings";
import { sidecarCrashHtml, startupWindowHtml } from "./crash-screen";
import { getServerSettings, updateServerSettings } from "./settings";
import {
  onUnexpectedSidecarExit,
  type SidecarConnection,
  SidecarPortInUseError,
  startSidecar,
  stopSidecar,
} from "./sidecar";

// Pin userData to an app-name-scoped dir BEFORE app.ready so every Electron-side
// consumer (electron-store, electron-log, window-state) lands at a predictable
// spot.
app.setName("Peephole");
app.setPath("userData", join(app.getPath("appData"), "Peephole"));

log.initialize({ preload: true });
log.transports.file.level = "info";

const WINDOW_DEFAULT_WIDTH = 1280;
const WINDOW_DEFAULT_HEIGHT = 800;
const WINDOW_MIN_WIDTH = 768;
const WINDOW_MIN_HEIGHT = 480;
const TRAFFIC_LIGHT_POSITION = { x: 16, y: 17 } as const;
const FATAL_DETAIL_MAX = 1800;

let mainWindow: BrowserWindow | null = null;
let connection: SidecarConnection | null = null;

const PRELOAD_PATH = fileURLToPath(
  new URL("../preload/index.js", import.meta.url)
);

/** The live main window, or null if it was destroyed. */
const liveMainWindow = (): BrowserWindow | null => {
  const window = mainWindow;
  if (!window) {
    return null;
  }
  if (window.isDestroyed()) {
    mainWindow = null;
    return null;
  }
  return window;
};

const destroyWindow = (window: BrowserWindow) => {
  if (mainWindow === window) {
    mainWindow = null;
  }
  if (!window.isDestroyed()) {
    window.destroy();
  }
};

const htmlDataUrl = (html: string): string =>
  `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;

/** On-disk path to the app icon (packaged resources, or build/ in dev). */
const resolveSourceIconPath = (): string =>
  app.isPackaged
    ? join(process.resourcesPath, "icon.png")
    : join(app.getAppPath(), "build", "icon.png");

const resolveLinuxIcon = (): string | undefined =>
  process.platform === "linux" ? resolveSourceIconPath() : undefined;

/**
 * Set the macOS dock icon at runtime. Packaged builds use the bundle's .icns;
 * this only matters in dev, and is a silent no-op when no icon asset ships yet.
 */
const installDockIcon = () => {
  if (process.platform !== "darwin" || app.isPackaged || !app.dock) {
    return;
  }
  const iconPath = resolveSourceIconPath();
  if (!existsSync(iconPath)) {
    return;
  }
  const image = nativeImage.createFromPath(iconPath);
  if (!image.isEmpty()) {
    app.dock.setIcon(image);
  }
};

const createMainBrowserWindow = (options: {
  readonly show: boolean;
}): BrowserWindow => {
  const windowState = windowStateKeeper({
    defaultWidth: WINDOW_DEFAULT_WIDTH,
    defaultHeight: WINDOW_DEFAULT_HEIGHT,
  });
  const linuxIcon = resolveLinuxIcon();

  const window = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    minWidth: WINDOW_MIN_WIDTH,
    minHeight: WINDOW_MIN_HEIGHT,
    show: options.show,
    backgroundColor: "#0a0a0a",
    autoHideMenuBar: true,
    ...(process.platform === "darwin"
      ? {
          titleBarStyle: "hidden" as const,
          trafficLightPosition: TRAFFIC_LIGHT_POSITION,
        }
      : {}),
    ...(linuxIcon ? { icon: linuxIcon } : {}),
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  mainWindow = window;
  windowState.manage(window);

  window.once("closed", () => {
    if (mainWindow === window) {
      mainWindow = null;
    }
  });
  window.once("ready-to-show", () => {
    if (!window.isDestroyed()) {
      window.show();
    }
  });
  // The MVP has no OAuth popups: route every navigation target to the user's
  // default browser and deny in-app child windows.
  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url).catch(() => undefined);
    return { action: "deny" };
  });

  return window;
};

const showStartupWindow = async (): Promise<void> => {
  const window = liveMainWindow() ?? createMainBrowserWindow({ show: true });
  if (window.isMinimized()) {
    window.restore();
  }
  if (!window.isVisible()) {
    window.show();
  }
  window.focus();
  try {
    await window.loadURL(htmlDataUrl(startupWindowHtml()));
  } catch (error) {
    log.warn("Failed to load startup window", error);
  }
};

const showCrashScreen = (
  window: BrowserWindow | null = liveMainWindow()
): void => {
  if (!window) {
    return;
  }
  window.loadURL(htmlDataUrl(sidecarCrashHtml())).catch(() => undefined);
};

/** Navigate the window to the sidecar's inspector, creating it if needed. */
const createWindow = async (conn: SidecarConnection): Promise<void> => {
  const existingWindow = liveMainWindow();
  const window = existingWindow ?? createMainBrowserWindow({ show: false });
  try {
    await window.loadURL(`http://${conn.hostname}:${conn.port}/`);
    if (!(window.isDestroyed() || window.isVisible())) {
      window.show();
    }
  } catch (error) {
    log.error("Failed to load Peephole web UI", error);
    if (!existingWindow) {
      destroyWindow(window);
    }
    throw error;
  }
};

const focusMainWindow = () => {
  const window = liveMainWindow();
  if (!window) {
    if (connection) {
      createWindow(connection).catch((error) =>
        log.error("Failed to reopen window", error)
      );
    }
    return;
  }
  if (window.isMinimized()) {
    window.restore();
  }
  if (!window.isVisible()) {
    window.show();
  }
  window.focus();
};

const ensureSingleInstance = (): boolean => {
  if (!app.requestSingleInstanceLock()) {
    app.quit();
    return false;
  }
  app.on("second-instance", focusMainWindow);
  return true;
};

const showPortInUseDialog = async (port: number) => {
  await dialog.showMessageBox({
    type: "error",
    title: "Peephole port in use",
    message: `Port ${port} is already taken.`,
    detail:
      "Another process is listening on that port. Quit it and relaunch Peephole.",
    buttons: ["OK"],
  });
};

// Last non-port-conflict startup failure, surfaced by boot() in a dialog instead
// of letting the app vanish without a window.
let lastSidecarStartError: unknown = null;

/** Start the sidecar, mapping a port conflict to a dialog and returning null. */
const startWithCurrentSettings =
  async (): Promise<SidecarConnection | null> => {
    try {
      return await startSidecar();
    } catch (error) {
      if (error instanceof SidecarPortInUseError) {
        await showPortInUseDialog(error.port);
        return null;
      }
      lastSidecarStartError = error;
      log.error("Failed to start Peephole sidecar", error);
      return null;
    }
  };

/** Stop the current sidecar, start a fresh one, and reload the window. */
const restartSidecarAndReload = async (): Promise<void> => {
  if (connection) {
    await stopSidecar(connection.child);
    connection = null;
  }
  const next = await startWithCurrentSettings();
  if (!next) {
    throw new Error("Sidecar failed to restart.");
  }
  connection = next;
  const window = liveMainWindow();
  if (window) {
    await window.loadURL(`http://${next.hostname}:${next.port}/`);
  }
};

const registerIpcHandlers = () => {
  ipcMain.handle("peephole:server:restart", () => restartSidecarAndReload());
  ipcMain.handle(
    "peephole:settings:get",
    (): DesktopServerSettings => getServerSettings()
  );
  ipcMain.handle(
    "peephole:settings:update",
    (_evt, patch: Partial<DesktopServerSettings>): DesktopServerSettings =>
      updateServerSettings(patch)
  );
  ipcMain.handle(
    "peephole:shell:open-external",
    async (_evt, rawUrl: unknown) => {
      if (typeof rawUrl !== "string") {
        return;
      }
      try {
        const parsed = new URL(rawUrl);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          return;
        }
        await shell.openExternal(parsed.toString());
      } catch {
        // Reject malformed URLs silently.
      }
    }
  );
};

const installApplicationMenu = () => {
  const isMac = process.platform === "darwin";
  const appMenu: MenuItemConstructorOptions = {
    label: app.name,
    submenu: [
      { role: "about" },
      {
        label: "Documentation",
        click: () => {
          shell
            .openExternal("https://github.com/Mark-Life/peephole")
            .catch(() => undefined);
        },
      },
      { type: "separator" },
      ...(isMac
        ? ([
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideOthers" },
            { role: "unhide" },
            { type: "separator" },
          ] as MenuItemConstructorOptions[])
        : []),
      { role: "quit" },
    ],
  };
  // Cmd/Ctrl+W binds through the `close` role, which only the File menu carries.
  const fileMenu: MenuItemConstructorOptions = {
    label: "File",
    submenu: [{ role: "close" }],
  };
  // The inspector navigates with browser history, but Electron binds no history
  // shortcuts by default and there is no browser chrome to fall back on.
  const navigateHistory = (direction: "back" | "forward") => {
    const nav = BrowserWindow.getFocusedWindow()?.webContents.navigationHistory;
    if (!nav) {
      return;
    }
    if (direction === "back") {
      if (nav.canGoBack()) {
        nav.goBack();
      }
    } else if (nav.canGoForward()) {
      nav.goForward();
    }
  };
  const historyMenu: MenuItemConstructorOptions = {
    label: "History",
    submenu: [
      {
        label: "Back",
        accelerator: "CmdOrCtrl+[",
        click: () => navigateHistory("back"),
      },
      {
        label: "Forward",
        accelerator: "CmdOrCtrl+]",
        click: () => navigateHistory("forward"),
      },
    ],
  };
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      appMenu,
      fileMenu,
      { role: "editMenu" },
      { role: "viewMenu" },
      historyMenu,
      { role: "windowMenu" },
    ])
  );
};

/** Surface a fatal startup failure in a dialog before quitting. */
const showFatalSidecarDialog = async (error: unknown) => {
  showCrashScreen();
  const detail =
    error instanceof Error ? (error.stack ?? error.message) : String(error);
  await dialog.showMessageBox({
    type: "error",
    title: "Peephole failed to start",
    message: "The local Peephole server crashed during startup.",
    detail: `${detail.slice(0, FATAL_DETAIL_MAX)}\n\nFull log: ${log.transports.file.getFile().path}`,
    buttons: ["Quit"],
  });
};

const boot = async () => {
  installDockIcon();
  installApplicationMenu();
  await showStartupWindow();
  registerIpcHandlers();
  // A sidecar dying under a live window leaves the web UI failing every request
  // with no explanation — swap in the crash screen whose Restart button drives
  // the preload bridge.
  onUnexpectedSidecarExit(() => showCrashScreen());

  connection = await startWithCurrentSettings();
  if (!connection) {
    if (lastSidecarStartError != null) {
      await showFatalSidecarDialog(lastSidecarStartError);
    }
    app.quit();
    return;
  }
  try {
    await createWindow(connection);
  } catch (error) {
    const failed = connection;
    connection = null;
    await stopSidecar(failed.child);
    await showFatalSidecarDialog(error);
    app.quit();
  }
};

if (ensureSingleInstance()) {
  app.whenReady().then(boot);

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", focusMainWindow);

  app.on("before-quit", async (event) => {
    if (!connection?.child) {
      return;
    }
    // Without preventDefault the child can be orphaned before SIGTERM lands.
    event.preventDefault();
    const child = connection.child;
    connection = null;
    await stopSidecar(child);
    app.exit(0);
  });
}
