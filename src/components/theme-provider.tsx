import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" 

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDarkMode: boolean
  toggleTheme: () => void
}

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
  isDarkMode: false,
  toggleTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "diagramr-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(theme === "dark")

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")
    root.classList.add(theme)
    setIsDarkMode(theme === "dark")
  }, [theme])

  const toggleTheme = () => {
    setTheme(current => current === "dark" ? "light" : "dark")
  }

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    isDarkMode,
    toggleTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
