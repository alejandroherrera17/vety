'use client'

import { useEffect } from 'react'
import { lockedMode, lockedTheme, useThemeStore } from '@/lib/themes/store'
import { themes } from '@/lib/themes/themes'

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const colors = themes[lockedTheme][lockedMode]

  useEffect(() => {
    const root = document.documentElement
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, String(value))
    })

    root.setAttribute('data-theme', lockedTheme)
    root.setAttribute('data-mode', lockedMode)
    useThemeStore.setState({ theme: lockedTheme, mode: lockedMode })
  }, [colors])

  useEffect(() => {
    const unsubscribe = useThemeStore.subscribe((state) => {
      const root = document.documentElement

      Object.entries(colors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, String(value))
      })

      if (state.theme !== lockedTheme || state.mode !== lockedMode) {
        useThemeStore.setState({ theme: lockedTheme, mode: lockedMode })
      }

      root.setAttribute('data-theme', lockedTheme)
      root.setAttribute('data-mode', lockedMode)
    })

    return unsubscribe
  }, [colors])

  return <>{children}</>
}
