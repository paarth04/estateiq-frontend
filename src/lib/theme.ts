import { useCallback, useEffect, useState } from "react";

/**
 * Light / dark theme. The source of truth is `data-theme` on <html> (tokens.css scopes colours by
 * it). index.html sets it before first paint; this hook reads/updates it.
 * - Default: the user's system preference (prefers-color-scheme), and it keeps FOLLOWING the
 *   system until the user picks a theme explicitly.
 * - An explicit choice is persisted in localStorage (every access wrapped — storage can throw).
 */
export type Theme = "light" | "dark";
const KEY = "eq-theme";

function stored(): Theme | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

function system(): Theme {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function apply(t: Theme) {
  document.documentElement.setAttribute("data-theme", t);
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => (document.documentElement.getAttribute("data-theme") as Theme) || stored() || system());

  // Follow OS changes until the user has made an explicit choice.
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;
    const on = () => {
      if (stored()) return;
      const t = system();
      apply(t);
      setThemeState(t);
    };
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    apply(t);
    setThemeState(t);
    try {
      localStorage.setItem(KEY, t);
    } catch {
      /* private mode / blocked storage — the choice just won't persist */
    }
  }, []);

  const toggle = useCallback(() => setTheme(theme === "dark" ? "light" : "dark"), [theme, setTheme]);
  return { theme, setTheme, toggle };
}
