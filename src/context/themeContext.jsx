import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

function getInitialTheme() {
  try {
    const saved = localStorage.getItem("Mahotsav-theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  return "dark"; // default to the Luma-style dark theme
}

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // Apply the theme as a class on <html> so Tailwind's `dark:` variant works
  // everywhere (including portals/toasts), and persist the choice.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("Mahotsav-theme", theme); } catch {}
  }, [theme]);

  const toggleTheme = (e) => {
    e?.preventDefault?.();
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
