'use client'

import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/button'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { mode, toggleMode } = useTheme()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleMode}
      className="h-8 w-8 p-0"
    >
      {mode === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  )
}