import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { ThemeName, ThemeMode, themes, defaultTheme } from './themes'

export const lockedTheme: ThemeName = 'emerald_care'
export const lockedMode: ThemeMode = 'dark'

interface ThemeState {
  theme: ThemeName
  mode: ThemeMode
  setTheme: (theme: ThemeName) => void
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
  getThemeColors: () => (typeof themes)[ThemeName]['light' | 'dark']
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: lockedTheme,
      mode: lockedMode,
      setTheme: () => set({ theme: lockedTheme, mode: lockedMode }),
      setMode: () => set({ theme: lockedTheme, mode: lockedMode }),
      toggleMode: () => set({ theme: lockedTheme, mode: lockedMode }),
      getThemeColors: () => {
        const { theme, mode } = get()
        return themes[theme ?? defaultTheme][mode ?? lockedMode]
      }
    }),
    {
      name: 'vety-theme-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: () => ({ theme: lockedTheme, mode: lockedMode }),
      onRehydrateStorage: () => (state) => {
        state?.setTheme(lockedTheme)
      },
    }
  )
)
