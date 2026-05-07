import { useThemeStore } from '@/lib/themes/store'
import { ThemeName, ThemeMode } from '@/lib/themes/themes'

export function useTheme() {
  const {
    theme,
    mode,
    setTheme,
    setMode,
    toggleMode,
    getThemeColors
  } = useThemeStore()

  return {
    theme,
    mode,
    setTheme,
    setMode,
    toggleMode,
    getThemeColors,
    colors: getThemeColors()
  }
}

// Hook for theme actions
export function useThemeActions() {
  const { setTheme, setMode, toggleMode } = useThemeStore()

  return {
    setTheme,
    setMode,
    toggleMode
  }
}

// Hook for current theme data
export function useThemeData() {
  const { theme, mode, getThemeColors } = useThemeStore()

  return {
    theme,
    mode,
    colors: getThemeColors()
  }
}