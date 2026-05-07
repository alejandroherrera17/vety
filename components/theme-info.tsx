'use client'

import Link from 'next/link'
import { useTheme } from '@/hooks/useTheme'
import { themes } from '@/lib/themes/themes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Palette, Sun, Moon } from 'lucide-react'

export function ThemeInfo() {
  const { theme, mode } = useTheme()
  const themeData = themes[theme]

  return (
    <Card className="gradient-primary text-primary-foreground">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary-foreground">
          <Palette className="h-5 w-5" />
          Tema Actual
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="font-semibold text-lg">{themeData.label}</p>
            <p className="text-sm opacity-90">{themeData.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div
                className="w-4 h-4 rounded-full border border-primary-foreground/20"
                style={{ backgroundColor: themeData[mode].primary }}
              />
              <div
                className="w-4 h-4 rounded-full border border-primary-foreground/20"
                style={{ backgroundColor: themeData[mode].secondary }}
              />
              <div
                className="w-4 h-4 rounded-full border border-primary-foreground/20"
                style={{ backgroundColor: themeData[mode].accent }}
              />
            </div>
            <div className="flex items-center gap-1 text-sm">
              {mode === 'light' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              {mode === 'light' ? 'Light' : 'Dark'}
            </div>
          </div>

          <Link href="/theme">
            <Button variant="secondary" size="sm" className="w-full">
              <Palette className="h-4 w-4 mr-2" />
              Personalizar Tema
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}