import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function TestUI() {
  return (
    <div style={{ minHeight: '100vh', padding: '2rem', background: '#f8fafc' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
          🧪 Teste dos Componentes UI
        </h1>
        
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
          <Card>
            <CardHeader>
              <CardTitle>Teste de Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Se você está vendo este card, os componentes UI estão funcionando!</p>
            </CardContent>
          </Card>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button>Botão Padrão</Button>
            <Button variant="outline">Botão Outline</Button>
            <Button variant="destructive">Botão Destructive</Button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Badge>Badge Padrão</Badge>
            <Badge variant="secondary">Badge Secondary</Badge>
            <Badge variant="destructive">Badge Destructive</Badge>
          </div>

          <Input placeholder="Teste de Input" />
        </div>

        <div style={{ 
          background: '#10b981', 
          color: 'white', 
          padding: '1rem', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          ✅ Componentes UI carregados com sucesso!
        </div>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <a href="/" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
            ← Voltar para Home
          </a>
        </div>
      </div>
    </div>
  )
}