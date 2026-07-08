import type { Configuration } from "electron-builder";

/**
 * electron-builder configuration for the Peephole desktop app.
 *
 * Packages the `electron-vite` output (`out/`) plus the compiled CLI sidecar
 * staged by `scripts/build-sidecar.ts` into distributable installers.
 *
 * The build ships UNSIGNED and un-notarized for now (`mac.notarize: false`, no
 * `CSC_LINK`/`APPLE_API_*` env). `hardenedRuntime` + entitlements are inert
 * without a signing identity, but are kept so a future signed build works with
 * no config change.
 *
 * Arch is NEVER pinned inside a target object. Per-arch output is driven solely
 * by the electron-builder CLI flag (`--arm64`/`--x64`), matched by the
 * `BUN_TARGET` the sidecar build cross-compiles for. Pinning `arch` here would
 * force both arches from a single leg's arch-specific bundled binary, producing
 * a mismatched-arch artifact (errno -86 / EBADARCH).
 */
const config: Configuration = {
  appId: "com.mark-life.peephole",
  productName: "Peephole",
  // biome-ignore lint/suspicious/noTemplateCurlyInString: electron-builder interpolates ${os}/${arch}/${ext} from this literal.
  artifactName: "peephole-desktop-${os}-${arch}.${ext}",

  directories: {
    output: "dist-app",
    buildResources: "build",
  },

  // electron-vite build output + manifest; the renderer is served by the sidecar.
  files: ["out/**/*", "package.json"],

  // The compiled CLI binary must live OUTSIDE the asar — asar-packed files can't
  // be exec'd. This lands it at Contents/Resources/peephole/peephole.
  extraResources: [
    {
      from: "resources/peephole/",
      to: "peephole/",
      filter: ["**/*"],
    },
  ],

  mac: {
    target: ["dmg", "zip"],
    category: "public.app-category.developer-tools",
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: "build/entitlements.mac.plist",
    entitlementsInherit: "build/entitlements.mac.plist",
    notarize: false,
  },

  win: {
    target: ["nsis"],
  },
  nsis: {
    oneClick: true,
    perMachine: false,
  },

  linux: {
    target: ["AppImage", "deb", "rpm"],
    category: "Development",
  },

  // Publishing is wired up later. electron-builder only publishes when
  // `--publish` is passed, so enabling this block is deferred:
  // publish: {
  //   provider: "github",
  //   owner: "Mark-Life",
  //   repo: "peephole",
  // },
};

export default config;
