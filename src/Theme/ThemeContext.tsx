import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeType = "light" | "dark";

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>("light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };
useEffect(() => {
  if (theme === "light") {
    document.documentElement.style.setProperty("--bg", "#F7F8FA");
    document.documentElement.style.setProperty("--text", "#000");  
    document.documentElement.style.setProperty("--card-bg", "#ffffff");
    document.documentElement.style.setProperty("--border-color", "#E5E5E5");
  } else {
    document.documentElement.style.setProperty("--bg", "#0D0D0D");
    document.documentElement.style.setProperty("--text", "#ffffff");
    document.documentElement.style.setProperty("--card-bg", "#1A1A1A");
    document.documentElement.style.setProperty("--border-color", "#333");
  }
}, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme === "light" ? "theme-light" : "theme-dark"}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
};
