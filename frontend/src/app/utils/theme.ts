export type Theme = "light" | "dark";
const KEY = "medica-theme";

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem(KEY) as Theme) ?? "light";
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  localStorage.setItem(KEY, theme);
}
