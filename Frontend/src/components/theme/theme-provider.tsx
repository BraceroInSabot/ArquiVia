import { createContext, useContext, useEffect } from "react"

type ThemeProviderProps = {
  children: React.ReactNode
}

type ThemeProviderState = {
  theme: "dark"
  setTheme: (theme: "dark") => void
}

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: "dark",
  setTheme: () => {},
})

export function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light")
    root.classList.add("dark")
    localStorage.setItem("vite-ui-theme", "dark")
  }, [])

  const value: ThemeProviderState = {
    theme: "dark",
    setTheme: () => {}, 
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {[children]}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  return useContext(ThemeProviderContext)
}
