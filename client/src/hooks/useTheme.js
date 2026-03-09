import { useState, useEffect } from "react";

const useTheme = () => {
  const [dark, setDark] = useState(() => {
    // Restore from localStorage, fallback to system preference
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return [dark, () => setDark(d => !d)];
};

export default useTheme;
