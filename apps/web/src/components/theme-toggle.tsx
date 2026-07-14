"use client";

import { Button } from "@workspace/ui/components/button";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/** Ordered theme cycle: system to light to dark and back. */
const CYCLE = ["system", "light", "dark"] as const;

type ThemeSetting = (typeof CYCLE)[number];

const ICON: Record<ThemeSetting, typeof Monitor> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

const NEXT_LABEL: Record<ThemeSetting, string> = {
  system: "Switch to light theme",
  light: "Switch to dark theme",
  dark: "Switch to system theme",
};

/**
 * Icon button that cycles the next-themes setting system to light to dark.
 * Renders a disabled placeholder of identical size until mounted so the SSR
 * and first client render agree and no layout shift occurs.
 */
export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        aria-hidden="true"
        disabled
        size="icon"
        tabIndex={-1}
        variant="ghost"
      >
        <Monitor className="size-4" />
      </Button>
    );
  }

  const current: ThemeSetting =
    theme === "light" || theme === "dark" ? theme : "system";
  const Icon = ICON[current];
  const next = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length] ?? "system";

  return (
    <Button
      aria-label={NEXT_LABEL[current]}
      onClick={() => setTheme(next)}
      size="icon"
      variant="ghost"
    >
      <Icon className="size-4" />
    </Button>
  );
};
