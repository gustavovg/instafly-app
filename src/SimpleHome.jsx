import React from 'react'

export default function SimpleHome() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '800px', padding: '2rem' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1rem', fontWeight: 'bold' }}>
          🚀 InstaFLY
        </h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '2rem', opacity: 0.9 }}>
          Impulsione suas redes sociais com nossos serviços de alta qualidade
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '2rem'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '1.5rem',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>📱 Instagram</h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Seguidores, Curtidas, Views</p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '1.5rem',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>🎵 TikTok</h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Seguidores, Curtidas, Views</p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '1.5rem',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>📺 YouTube</h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Inscritos, Curtidas, Views</p>
          </div>
        </div>
        <div style={{ 
          fontSize: '1rem', 
          marginTop: '2rem', 
          opacity: 0.9,
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <a href="/testui" style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            textDecoration: 'none',
            backdropFilter: 'blur(10px)'
          }}>
            🧪 Testar UI
          </a>
          <a href="/testapi" style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            textDecoration: 'none',
            backdropFilter: 'blur(10px)'
          }}>
            🔌 Testar API
          </a>
          <a href="/homereal" style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            textDecoration: 'none',
            backdropFilter: 'blur(10px)'
          }}>
            🏠 Home Real
          </a>
          <a href="/ordertracking" style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            textDecoration: 'none',
            backdropFilter: 'blur(10px)'
          }}>
            📦 Rastreamento
          </a>
          <a href="/faq" style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            textDecoration: 'none',
            backdropFilter: 'blur(10px)'
          }}>
            ❓ FAQ
          </a>
        </div>
        
        <p style={{ 
          fontSize: '0.9rem', 
          marginTop: '2rem', 
          opacity: 0.7,
          background: 'rgba(0,255,0,0.2)',
          padding: '1rem',
          borderRadius: '8px'
        }}>
          ✅ Aplicação funcionando! Testando componentes gradualmente...
        </p>
      </div>
    </div>
  )
}