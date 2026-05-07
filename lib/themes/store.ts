import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { ThemeName, ThemeMode, themes, defaultTheme } from './themes'

interface ThemeState {
  theme: ThemeName
  mode: ThemeMode
  setTheme: (theme: ThemeName) => void
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
  getThemeColors: () => themes[ThemeName]['light' | 'dark']
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: defaultTheme,
      mode: 'light',
      setTheme: (theme: ThemeName) => set({ theme }),
      setMode: (mode: ThemeMode) => set({ mode }),
      toggleMode: () => set((state) => ({
        mode: state.mode === 'light' ? 'dark' : 'light'
      })),
      getThemeColors: () => {
        const { theme, mode } = get()
        return themes[theme][mode]
      }
    }),
    {
      name: 'vety-theme-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme, mode: state.mode })
    }
  )
)