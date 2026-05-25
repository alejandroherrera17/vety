'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Leaf, ShieldCheck } from 'lucide-react'

export function ThemeInfo() {
  return (
    <Card className="border-emerald-200/15 bg-emerald-300/10 text-foreground">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Leaf className="h-5 w-5 text-emerald-100" />
          Verde Veterinario
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-lg font-semibold">Tema unico de VettiPets</p>
            <p className="text-sm leading-6 text-muted-foreground">
              Interfaz fija, sobria y de alto contraste para uso clinico diario.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="h-4 w-4 rounded-full border border-emerald-50/20 bg-emerald-500" />
              <div className="h-4 w-4 rounded-full border border-emerald-50/20 bg-emerald-200" />
              <div className="h-4 w-4 rounded-full border border-emerald-50/20 bg-slate-950" />
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-emerald-100">
              <ShieldCheck className="h-4 w-4" />
              Contraste bloqueado
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
