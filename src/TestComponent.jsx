import React from 'react'

export default function TestComponent() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅ Teste OK!</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
          O problema está no componente Pages ou suas dependências.
        </p>
        <p style={{ fontSize: '1rem', opacity: 0.7, marginTop: '1rem' }}>
          Vamos investigar o erro específico...
        </p>
      </div>
    </div>
  )
}