export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

// Must equal --bg in app/globals.css; tests/unit/lib/theme.test.ts checks it.
export const THEME_COLORS: Record<Theme, string> = {
  light: "#f5f4f0",
  dark: "#1a1a1c",
};

// Runs in <head> before first paint, so it can't import anything and sticks to
// ES5 syntax. The empty `catch` is deliberate: reading localStorage throws when
// storage is blocked, and the handling is to keep the `"light"` default.
export const themeScript = `(function () {
  var theme = "light";
  try {
    var saved = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    if (saved === "light" || saved === "dark") theme = saved;
  } catch (e) {}
  document.documentElement.dataset.theme = theme;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", ${JSON.stringify(THEME_COLORS)}[theme]);
})();`;
