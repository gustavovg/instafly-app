import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import SimpleHome from './SimpleHome.jsx'
import TestUI from './TestUI.jsx'
import TestAPI from './TestAPI.jsx'
import HomeWithoutAuth from './HomeWithoutAuth.jsx'

// Componente simples para outras páginas
function SimplePage({ title, description }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>{title}</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>{description}</p>
        <a 
          href="/" 
          style={{ 
            color: 'white', 
            textDecoration: 'underline',
            fontSize: '1rem',
            marginTop: '1rem',
            display: 'inline-block'
          }}
        >
          ← Voltar para Home
        </a>
      </div>
    </div>
  )
}

export default function SimplePages() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SimpleHome />} />
        <Route path="/home" element={<SimpleHome />} />
        <Route path="/ordertracking" element={
          <SimplePage 
            title="📦 Rastreamento" 
            description="Acompanhe seu pedido aqui" 
          />
        } />
        <Route path="/faq" element={
          <SimplePage 
            title="❓ FAQ" 
            description="Perguntas frequentes" 
          />
        } />
        <Route path="/admindashboard" element={
          <SimplePage 
            title="⚙️ Admin Dashboard" 
            description="Painel administrativo" 
          />
        } />
        <Route path="/testui" element={<TestUI />} />
        <Route path="/testapi" element={<TestAPI />} />
        <Route path="/homereal" element={<HomeWithoutAuth />} />
        <Route path="*" element={
          <SimplePage 
            title="🔍 Página não encontrada" 
            description="A página que você procura não existe" 
          />
        } />
      </Routes>
    </Router>
  )
}