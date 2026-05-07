'use client'

import { useState } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { themes, ThemeName } from '@/lib/themes/themes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sun, Moon, Palette, Check, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { updateUserTheme } from '@/actions/theme'
import { toast } from 'sonner'

interface ThemePreviewProps {
  themeName: ThemeName
  isSelected: boolean
  onSelect: () => void
}

function ThemePreview({ themeName, isSelected, onSelect }: ThemePreviewProps) {
  const theme = themes[themeName]
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light')
  const colors = theme[previewMode]

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{theme.label}</CardTitle>
          {isSelected && <Check className="h-4 w-4 text-primary" />}
        </div>
        <p className="text-xs text-muted-foreground">{theme.description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Color palette preview */}
        <div className="flex gap-1">
          <div
            className="w-6 h-6 rounded-full border"
            style={{ backgroundColor: colors.primary }}
            title="Primary"
          />
          <div
            className="w-6 h-6 rounded-full border"
            style={{ backgroundColor: colors.secondary }}
            title="Secondary"
          />
          <div
            className="w-6 h-6 rounded-full border"
            style={{ backgroundColor: colors.accent }}
            title="Accent"
          />
          <div
            className="w-6 h-6 rounded-full border"
            style={{ backgroundColor: colors.success }}
            title="Success"
          />
        </div>

        {/* Mini preview */}
        <div
          className="rounded-lg border p-3 space-y-2"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border
          }}
        >
          {/* Header */}
          <div
            className="h-3 rounded"
            style={{ backgroundColor: colors.navbar }}
          />

          {/* Content */}
          <div className="space-y-1">
            <div
              className="h-2 rounded w-3/4"
              style={{ backgroundColor: colors.muted }}
            />
            <div
              className="h-2 rounded w-1/2"
              style={{ backgroundColor: colors.muted }}
            />
          </div>

          {/* Button */}
          <div
            className="h-6 rounded w-16"
            style={{ backgroundColor: colors.primary }}
          />
        </div>

        {/* Mode toggle */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setPreviewMode(previewMode === 'light' ? 'dark' : 'light')
            }}
            className="h-6 px-2"
          >
            {previewMode === 'light' ? (
              <Moon className="h-3 w-3" />
            ) : (
              <Sun className="h-3 w-3" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function ThemeCustomizer() {
  const { theme, mode, setTheme, setMode, toggleMode } = useTheme()
  const [tempTheme, setTempTheme] = useState<ThemeName>(theme)
  const [isSaving, setIsSaving] = useState(false)

  const handleThemeSelect = (selectedTheme: ThemeName) => {
    setTempTheme(selectedTheme)
    setTheme(selectedTheme)
  }

  const handleSaveTheme = async () => {
    setIsSaving(true)
    try {
      await updateUserTheme(tempTheme)
      toast.success('Tema guardado exitosamente')
    } catch (error) {
      toast.error('Error al guardar el tema')
    } finally {
      setIsSaving(false)
    }
  }

  const handleModeToggle = () => {
    toggleMode()
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="h-6 w-6" />
            Theme Customizer
          </h1>
          <p className="text-muted-foreground">
            Personaliza la apariencia de VetyCare con temas premium
          </p>
        </div>

        <Button
          onClick={handleModeToggle}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          {mode === 'light' ? (
            <>
              <Moon className="h-4 w-4" />
              Dark Mode
            </>
          ) : (
            <>
              <Sun className="h-4 w-4" />
              Light Mode
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="themes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="themes">Temas</TabsTrigger>
          <TabsTrigger value="preview">Vista Previa</TabsTrigger>
        </TabsList>

        <TabsContent value="themes" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(themes) as ThemeName[]).map((themeName) => (
              <ThemePreview
                key={themeName}
                themeName={themeName}
                isSelected={theme === themeName}
                onSelect={() => handleThemeSelect(themeName)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sidebar Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sidebar Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="w-full h-64 rounded-lg border p-4 space-y-3"
                  style={{
                    backgroundColor: 'var(--sidebar)',
                    borderColor: 'var(--border)'
                  }}
                >
                  <div
                    className="h-8 rounded"
                    style={{ backgroundColor: 'var(--navbar)' }}
                  />
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-6 rounded"
                        style={{ backgroundColor: 'var(--muted)' }}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Components Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Components Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Buttons */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Botones</h4>
                  <div className="flex gap-2">
                    <Button size="sm">Primary</Button>
                    <Button variant="secondary" size="sm">Secondary</Button>
                    <Button variant="outline" size="sm">Outline</Button>
                  </div>
                </div>

                {/* Badges */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Badges</h4>
                  <div className="flex gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                  </div>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Cards</h4>
                  <Card className="p-3">
                    <p className="text-sm">Esta es una card de ejemplo con el tema actual.</p>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3">
        <Button variant="outline">
          Restaurar Default
        </Button>
        <Button onClick={handleSaveTheme} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>
    </div>
  )
}