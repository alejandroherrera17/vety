'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/lib/themes/store'

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { getThemeColors } = useThemeStore()

  useEffect(() => {
    const colors = getThemeColors()

    // Apply CSS variables to :root
    const root = document.documentElement
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, String(value))
    })

    // Apply data-theme attribute for additional styling
    root.setAttribute('data-theme', useThemeStore.getState().theme)
    root.setAttribute('data-mode', useThemeStore.getState().mode)
  }, [getThemeColors])

  // Listen for theme changes
  useEffect(() => {
    const unsubscribe = useThemeStore.subscribe((state) => {
      const colors = state.getThemeColors()
      const root = document.documentElement

      Object.entries(colors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, String(value))
      })

      root.setAttribute('data-theme', state.theme)
      root.setAttribute('data-mode', state.mode)
    })

    return unsubscribe
  }, [])

  return <>{children}</>
}
