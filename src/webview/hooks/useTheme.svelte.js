import { onMount } from "svelte";

export function useTheme() {
  let themePreference = $state(getTheme());

  function getTheme() {
    if (typeof document !== "undefined") {
      if (
        document.body.classList.contains("vscode-dark") ||
        document.body.classList.contains("vscode-high-contrast")
      ) {
        return "dark";
      }
    }
    return "light";
  }

  function updateTheme() {
    const newTheme = getTheme();
    if (themePreference !== newTheme) {
      console.log("[Webview] Theme changed to:", newTheme);
      themePreference = newTheme;
    }
  }

  onMount(() => {
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Initial check
    updateTheme();

    return () => observer.disconnect();
  });

  return {
    get preference() { return themePreference; }
  };
}
