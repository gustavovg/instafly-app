import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TestAPI() {
  const [apiStatus, setApiStatus] = useState('testing')
  const [results, setResults] = useState({})
  const [error, setError] = useState(null)

  const testBasicImports = async () => {
    try {
      // Test basic imports using ES modules
      const { Settings } = await import('@/api/entities')
      const { Service } = await import('@/api/entities')
      const { Order } = await import('@/api/entities')
      
      setResults(prev => ({
        ...prev,
        imports: '✅ Imports OK'
      }))
      return true
    } catch (err) {
      setResults(prev => ({
        ...prev,
        imports: `❌ Import Error: ${err.message}`
      }))
      return false
    }
  }

  const testAPIConnection = async () => {
    try {
      const { Settings } = await import('@/api/entities')
      
      setResults(prev => ({
        ...prev,
        connection: '🔄 Testando conexão...'
      }))

      // Try to fetch settings (simplest API call)
      const settings = await Settings.list()
      
      setResults(prev => ({
        ...prev,
        connection: '✅ Conexão OK',
        settingsCount: `📊 ${settings.length} configurações encontradas`
      }))
      
      return true
    } catch (err) {
      setResults(prev => ({
        ...prev,
        connection: `❌ Erro de conexão: ${err.message}`,
        errorDetails: err.toString()
      }))
      return false
    }
  }

  const testServices = async () => {
    try {
      const { Service } = await import('@/api/entities')
      
      setResults(prev => ({
        ...prev,
        services: '🔄 Testando serviços...'
      }))

      const services = await Service.filter({ show_in_homepage: true, is_active: true })
      
      setResults(prev => ({
        ...prev,
        services: '✅ Serviços OK',
        servicesCount: `📊 ${services.length} serviços encontrados`
      }))
      
      return true
    } catch (err) {
      setResults(prev => ({
        ...prev,
        services: `❌ Erro nos serviços: ${err.message}`
      }))
      return false
    }
  }

  const runTests = async () => {
    setApiStatus('testing')
    setError(null)
    setResults({})

    try {
      // Test 1: Basic imports
      const importsOK = await testBasicImports()
      
      if (importsOK) {
        // Test 2: API connection
        const connectionOK = await testAPIConnection()
        
        if (connectionOK) {
          // Test 3: Services
          await testServices()
          setApiStatus('success')
        } else {
          setApiStatus('error')
        }
      } else {
        setApiStatus('error')
      }
    } catch (err) {
      setError(err.message)
      setApiStatus('error')
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', background: '#f8fafc' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
          🔌 Teste da API Base44
        </h1>
        
        <Card style={{ marginBottom: '2rem' }}>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Status Geral: 
              {apiStatus === 'testing' && <Badge variant="secondary">🔄 Testando...</Badge>}
              {apiStatus === 'success' && <Badge style={{ background: '#10b981', color: 'white' }}>✅ Sucesso</Badge>}
              {apiStatus === 'error' && <Badge variant="destructive">❌ Erro</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {Object.entries(results).map(([key, value]) => (
                <div key={key} style={{ 
                  padding: '0.5rem', 
                  background: '#f1f5f9', 
                  borderRadius: '4px',
                  fontFamily: 'monospace'
                }}>
                  <strong>{key}:</strong> {value}
                </div>
              ))}
              
              {error && (
                <div style={{ 
                  padding: '1rem', 
                  background: '#fef2f2', 
                  border: '1px solid #fecaca',
                  borderRadius: '4px',
                  color: '#dc2626'
                }}>
                  <strong>Erro:</strong> {error}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
          <Button onClick={runTests}>🔄 Executar Testes Novamente</Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            ← Voltar para Home
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>💡 Diagnóstico</CardTitle>
          </CardHeader>
          <CardContent>
            {apiStatus === 'success' && (
              <p style={{ color: '#10b981' }}>
                ✅ <strong>API funcionando!</strong> O problema no componente Home original deve estar em outra parte da lógica complexa.
              </p>
            )}
            {apiStatus === 'error' && (
              <p style={{ color: '#dc2626' }}>
                ❌ <strong>Problema na API!</strong> Este é provavelmente o motivo da tela branca. Verifique a configuração do SDK Base44.
              </p>
            )}
            {apiStatus === 'testing' && (
              <p style={{ color: '#3b82f6' }}>
                🔄 <strong>Testando...</strong> Aguarde os resultados dos testes.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}