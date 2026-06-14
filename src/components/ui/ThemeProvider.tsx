// Theme provider and switcher — implemented in Prompt 6
'use client'

import { createContext, useContext, useState } from 'react'

type Theme = 'neon' | 'minimal' | 'vegas'

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (t: Theme) => void
}>({ theme: 'neon', setTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('neon')

  const applyTheme = (t: Theme) => {
    document.documentElement.setAttribute('data-theme', t)
    setTheme(t)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: applyTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
