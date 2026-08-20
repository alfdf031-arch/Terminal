const STORAGE_KEY =
  "webkernel_terminal_theme";

const THEMES = {
  dark: {
    name: "dark",
    path: "./themes/dark.json"
  },

  light: {
    name: "light",
    path: "./themes/light.json"
  },

  matrix: {
    name: "matrix",
    path: "./themes/matrix.json"
  }
};

function getTerminal() {
  return document.documentElement;
}

function applyTheme(theme) {

  const root =
    getTerminal();

  for (
    const [key, value]
    of Object.entries(theme.variables)
  ) {

    root.style.setProperty(
      key,
      value
    );
  }

  localStorage.setItem(
    STORAGE_KEY,
    theme.name
  );

  return theme;
}

async function loadTheme(name) {

  const theme =
    THEMES[name];

  if (!theme) {

    throw new Error(
      `الثيم غير موجود: ${name}`
    );
  }

  const response =
    await fetch(theme.path);

  if (!response.ok) {

    throw new Error(
      `تعذر تحميل الثيم: ${name}`
    );
  }

  const data =
    await response.json();

  data.name =
    name;

  return data;
}

export async function useTheme(
  name
) {

  const theme =
    await loadTheme(name);

  return applyTheme(theme);
}

export function listThemes() {

  return Object.keys(
    THEMES
  );
}

export async function resetTheme() {

  const root =
    getTerminal();

  const variables = [
    "--bg",
    "--panel",
    "--panel-2",
    "--text",
    "--muted",
    "--accent",
    "--success",
    "--danger",
    "--warning",
    "--border"
  ];

  for (
    const variable
    of variables
  ) {

    root.style.removeProperty(
      variable
    );
  }

  localStorage.removeItem(
    STORAGE_KEY
  );
}

export async function restoreTheme() {

  const saved =
    localStorage.getItem(
      STORAGE_KEY
    );

  if (
    saved &&
    THEMES[saved]
  ) {

    try {

      await useTheme(saved);

    } catch {

      resetTheme();

    }

  }
}

export async function execute(
  args
) {

  const command =
    args.shift() || "";

  if (
    command === "use"
  ) {

    const name =
      args[0];

    if (!name) {

      throw new Error(
        "الاستخدام: theme use <name>"
      );
    }

    const theme =
      await useTheme(name);

    return [
      `تم تطبيق الثيم: ${theme.name}`,
      `الوصف: ${theme.description?.ar || ""}`
    ].join("\n");
  }

  if (
    command === "list"
  ) {

    return [
      "الثيمات المتوفرة:",
      "",
      ...listThemes()
    ].join("\n");
  }

  if (
    command === "reset"
  ) {

    await resetTheme();

    return "تمت إعادة المظهر الافتراضي.";
  }

  return [
    "Theme Manager",
    "",
    "theme use <name>",
    "theme list",
    "theme reset"
  ].join("\n");
}

export default {
  name: "theme",
  execute,
  useTheme,
  listThemes,
  resetTheme,
  restoreTheme
};
