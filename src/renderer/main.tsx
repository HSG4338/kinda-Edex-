import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Global error handler to catch anything React misses
window.addEventListener('error', (e) => {
  document.body.innerHTML = `
    <div style="background:#0a0a0f;color:#ff0055;font-family:monospace;padding:40px;height:100vh;overflow:auto;">
      <div style="color:#00ff9f;font-size:24px;margin-bottom:20px;">eDEX — RENDERER CRASH</div>
      <div style="color:#ff0055;margin-bottom:10px;">Error: ${e.message}</div>
      <div style="color:#485060;font-size:12px;white-space:pre-wrap;">${e.error?.stack ?? 'No stack trace'}</div>
    </div>
  `
})

window.addEventListener('unhandledrejection', (e) => {
  document.body.innerHTML = `
    <div style="background:#0a0a0f;color:#ff0055;font-family:monospace;padding:40px;height:100vh;overflow:auto;">
      <div style="color:#00ff9f;font-size:24px;margin-bottom:20px;">eDEX — UNHANDLED PROMISE REJECTION</div>
      <div style="color:#ff0055;margin-bottom:10px;">${String(e.reason)}</div>
      <div style="color:#485060;font-size:12px;white-space:pre-wrap;">${e.reason?.stack ?? 'No stack trace'}</div>
    </div>
  `
})

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('React error boundary caught:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          background: '#0a0a0f',
          color: '#ff0055',
          fontFamily: 'monospace',
          padding: '40px',
          height: '100vh',
          overflow: 'auto'
        }}>
          <div style={{ color: '#00ff9f', fontSize: '24px', marginBottom: '20px' }}>
            eDEX — REACT ERROR
          </div>
          <div style={{ color: '#ff0055', marginBottom: '10px' }}>
            {this.state.error.message}
          </div>
          <div style={{ color: '#485060', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
            {this.state.error.stack}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
