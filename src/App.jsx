import React, { Suspense } from 'react'
import './App.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'Arial, sans-serif',
          padding: '2rem'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '600px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌ Erro na Aplicação</h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
              Algo deu errado ao carregar a aplicação.
            </p>
            <details style={{
              background: 'rgba(0,0,0,0.2)',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'left',
              marginTop: '1rem'
            }}>
              <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
                Ver detalhes do erro
              </summary>
              <pre style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: 'white',
                color: '#dc2626',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lazy load the Pages component to catch any loading errors
const Pages = React.lazy(() => import("@/pages/index.jsx"))
// const SimplePages = React.lazy(() => import("./SimplePages.jsx"))

function App() {
  console.log('App renderizando...')

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh' }}>
        <Suspense fallback={
          <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'Arial, sans-serif'
          }}>
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚀 Carregando InstaFLY...</h1>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid rgba(255,255,255,0.3)',
                borderTop: '4px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }}></div>
            </div>
          </div>
        }>
          <Pages />
        </Suspense>
      </div>
    </ErrorBoundary>
  )
}

export default App