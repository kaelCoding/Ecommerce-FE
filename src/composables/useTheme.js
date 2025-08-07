import { ref, watchEffect, readonly } from "vue";

const initialTheme =
  localStorage.getItem("theme") ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light");

const theme = ref(initialTheme);

function toggleTheme() {
  theme.value = theme.value === "light" ? "dark" : "light";
}

watchEffect(() => {
  document.documentElement.setAttribute("data-theme", theme.value);
  localStorage.setItem("theme", theme.value);
});

export function useTheme() {
  return {
    theme: readonly(theme),
    toggleTheme,
  };
}
