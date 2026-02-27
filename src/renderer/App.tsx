import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BootSequence } from './components/boot/BootSequence'
import { TerminalPanel } from './components/terminal/TerminalPanel'
import { SystemMonitor } from './components/monitor/SystemMonitor'
import { CommandPalette } from './components/command-palette/CommandPalette'
import { HeaderBar } from './components/HeaderBar'
import { useCommandRegistry } from './hooks/useCommandRegistry'
import type { AppPhase, Command } from './types'

const TERMINAL_ID = 'main-terminal'

const DEFAULT_COMMANDS: Command[] = [
  {
    id: 'window.fullscreen',
    label: 'Toggle Fullscreen',
    description: 'Enter or exit fullscreen mode',
    keywords: ['fullscreen', 'maximize', 'window'],
    icon: '⛶',
    action: () => window.edex?.window.toggleFullscreen()
  },
  {
    id: 'window.minimize',
    label: 'Minimize Window',
    description: 'Minimize to taskbar',
    keywords: ['minimize', 'hide', 'window'],
    icon: '─',
    action: () => window.edex?.window.minimize()
  },
  {
    id: 'window.close',
    label: 'Close Application',
    description: 'Exit eDEX terminal',
    keywords: ['close', 'quit', 'exit'],
    icon: '✕',
    action: () => window.edex?.window.close()
  },
  {
    id: 'terminal.clear',
    label: 'Clear Terminal',
    description: 'Clear the terminal screen',
    keywords: ['clear', 'cls', 'clean'],
    icon: '⌫',
    action: () => window.edex?.terminal.write(TERMINAL_ID, 'clear\r')
  },
  {
    id: 'terminal.home',
    label: 'Go Home',
    description: 'Navigate to home directory',
    keywords: ['home', 'directory', 'cd'],
    icon: '🏠',
    action: () => window.edex?.terminal.write(TERMINAL_ID, 'cd ~\r')
  },
  {
    id: 'terminal.ls',
    label: 'List Files',
    description: 'List files in current directory',
    keywords: ['ls', 'dir', 'list', 'files'],
    icon: '📁',
    action: () => window.edex?.terminal.write(TERMINAL_ID, 'ls -la\r')
  }
]

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('boot')
  const [mainVisible, setMainVisible] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [hostname, setHostname] = useState('localhost')
  const [edexReady, setEdexReady] = useState(false)
  const { commands } = useCommandRegistry(DEFAULT_COMMANDS)

  // Wait for window.edex to be available (preload bridge)
  useEffect(() => {
    const check = () => {
      if (window.edex) {
        setEdexReady(true)
      } else {
        setTimeout(check, 50)
      }
    }
    check()
  }, [])

  // Fetch hostname once edex is ready
  useEffect(() => {
    if (!edexReady) return
    window.edex.system.getStats().then((stats) => {
      if (stats?.os?.hostname) setHostname(stats.os.hostname)
    }).catch(() => {/* non-fatal */})
  }, [edexReady])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setPaletteOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleBootComplete = useCallback(() => {
    setPhase('main')
    setTimeout(() => setMainVisible(true), 80)
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a0f', overflow: 'hidden', position: 'relative' }}>

      {/* Boot sequence */}
      {phase === 'boot' && (
        <BootSequence onComplete={handleBootComplete} />
      )}

      {/* Main UI */}
      {phase === 'main' && (
        <motion.div
          style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: mainVisible ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <HeaderBar
            hostname={hostname}
            onCommandPalette={() => setPaletteOpen(true)}
            onClose={() => window.edex?.window.close()}
            onMinimize={() => window.edex?.window.minimize()}
            onToggleFullscreen={() => window.edex?.window.toggleFullscreen()}
          />

          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Left monitor panel */}
            <motion.div
              style={{ width: '224px', flexShrink: 0, borderRight: '1px solid rgba(0,184,255,0.3)', background: 'rgba(13,17,23,0.5)', overflow: 'hidden' }}
              initial={{ x: -224, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <SystemMonitor />
            </motion.div>

            {/* Center terminal */}
            <motion.div
              style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', height: '28px', padding: '0 16px', background: '#0d1117', borderBottom: '1px solid rgba(0,255,159,0.15)', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff0055' }} />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffd700' }} />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff9f' }} />
                </div>
                <div style={{ marginLeft: '16px', color: '#485060', fontSize: '11px', fontFamily: 'monospace' }}>
                  TERMINAL — {hostname}
                </div>
                <div style={{ marginLeft: 'auto', color: '#485060', fontSize: '11px', fontFamily: 'monospace', opacity: 0.5 }}>
                  Ctrl+K for commands
                </div>
              </div>
              <div style={{ flex: 1, background: '#0a0a0f', overflow: 'hidden' }}>
                <TerminalPanel id={TERMINAL_ID} />
              </div>
            </motion.div>

            {/* Right info panel */}
            <motion.div
              style={{ width: '192px', flexShrink: 0, borderLeft: '1px solid rgba(0,255,159,0.2)', background: 'rgba(13,17,23,0.3)', overflow: 'hidden' }}
              initial={{ x: 192, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <RightPanel />
            </motion.div>
          </div>

          <StatusBar hostname={hostname} />
        </motion.div>
      )}

      {/* Command palette */}
      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        commands={commands}
      />
    </div>
  )
}

function RightPanel() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ padding: '12px', fontFamily: 'monospace', fontSize: '11px', color: '#485060', height: '100%', overflowY: 'auto' }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ color: '#00b8ff', letterSpacing: '3px', marginBottom: '8px', fontSize: '10px' }}>CLOCK</div>
        <div style={{ color: '#00ff9f', fontSize: '20px', fontWeight: 'bold', textShadow: '0 0 8px rgba(0,255,159,0.6)' }}>
          {now.toLocaleTimeString('en-US', { hour12: false })}
        </div>
        <div style={{ fontSize: '10px', marginTop: '4px' }}>
          {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(0,255,159,0.15)', margin: '12px 0' }} />

      <div style={{ marginBottom: '16px' }}>
        <div style={{ color: '#00b8ff', letterSpacing: '3px', marginBottom: '8px', fontSize: '10px' }}>SHORTCUTS</div>
        {[
          ['Ctrl+K', 'Commands'],
          ['Ctrl+L', 'Clear'],
          ['Ctrl+C', 'Interrupt'],
          ['↑↓', 'History'],
          ['Tab', 'Complete'],
        ].map(([key, desc]) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: '#00ff9f', background: 'rgba(0,255,159,0.1)', padding: '1px 4px', borderRadius: '2px', fontSize: '10px' }}>{key}</span>
            <span style={{ opacity: 0.6, fontSize: '10px' }}>{desc}</span>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid rgba(0,255,159,0.15)', margin: '12px 0' }} />

      <div>
        <div style={{ color: '#00b8ff', letterSpacing: '3px', marginBottom: '8px', fontSize: '10px' }}>STATUS</div>
        {['Terminal', 'Monitor', 'Security'].map((label) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff9f', boxShadow: '0 0 4px #00ff9f' }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusBar({ hostname }: { hostname: string }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', height: '24px', padding: '0 16px',
      fontFamily: 'monospace', fontSize: '11px', color: '#485060',
      borderTop: '1px solid rgba(0,255,159,0.15)', background: 'rgba(13,17,23,0.8)',
      flexShrink: 0
    }}>
      <span style={{ color: '#00ff9f', marginRight: '6px' }}>◆</span>
      <span>eDEX v1.0.0</span>
      <span style={{ margin: '0 12px', opacity: 0.3 }}>|</span>
      <span>{hostname}</span>
      <span style={{ margin: '0 12px', opacity: 0.3 }}>|</span>
      <span>Ctrl+K: Commands</span>
      <span style={{ marginLeft: 'auto' }}>{now.toISOString().slice(0, 19).replace('T', ' ')} UTC</span>
    </div>
  )
}
