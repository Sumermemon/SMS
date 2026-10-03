import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'
const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({ theme: 'light', toggleTheme: () => {} })

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => localStorage.getItem('edumanage-theme') as Theme || 'light')
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('edumanage-theme', theme) }, [theme])
  return <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(value => value === 'light' ? 'dark' : 'light') }}>{children}</ThemeContext.Provider>
}
export const useTheme = () => useContext(ThemeContext)
export default ThemeProvider
