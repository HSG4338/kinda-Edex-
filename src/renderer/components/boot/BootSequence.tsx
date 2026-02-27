import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface BootSequenceProps {
  onComplete: () => void
}

const BOOT_LINES = [
  'EDEX TERMINAL v1.0.0',
  '----------------------------------------',
  'Initializing kernel modules...',
  'Loading system drivers...',
  'Mounting virtual filesystem...',
  'Establishing secure environment...',
  'Initializing terminal subsystem...',
  'Calibrating display matrix...',
  'Loading command registry...',
  'Starting system monitor...',
  'All systems nominal.',
  '----------------------------------------',
  'ACCESS GRANTED - WELCOME, OPERATOR'
]

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState<string[]>([])
  const [isDone, setIsDone] = useState(false)
  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    let lineIndex = 0
    let timeout: ReturnType<typeof setTimeout>

    const showNextLine = () => {
      if (lineIndex >= BOOT_LINES.length) {
        timeout = setTimeout(() => {
          setIsDone(true)
          setOpacity(0)
          setTimeout(() => onComplete(), 500)
        }, 600)
        return
      }

      const line = BOOT_LINES[lineIndex]
      if (line !== undefined) {
        setVisibleLines((prev) => [...prev, line])
      }
      lineIndex++

      const delay = lineIndex === 1 ? 150 : lineIndex === BOOT_LINES.length ? 300 : 110
      timeout = setTimeout(showNextLine, delay)
    }

    timeout = setTimeout(showNextLine, 300)
    return () => clearTimeout(timeout)
  }, [onComplete])

  const getLineStyle = (line: string): React.CSSProperties => {
    if (line.startsWith('-')) return { color: '#485060' }
    if (line === 'All systems nominal.' || line.startsWith('ACCESS GRANTED')) return { color: '#00ff9f', fontWeight: 'bold' }
    if (line.startsWith('EDEX')) return { color: '#00b8ff', fontWeight: 'bold' }
    return { color: '#c9d1d9' }
  }

  const progress = Math.round((visibleLines.length / BOOT_LINES.length) * 100)

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0a0a0f',
        zIndex: 50,
        opacity,
        transition: isDone ? 'opacity 0.5s ease' : 'none',
        pointerEvents: isDone ? 'none' : 'auto'
      }}
    >
      {/* Corner decorations */}
      <div style={{ position: 'absolute', top: 16, left: 16, width: 32, height: 32, borderLeft: '2px solid #00ff9f', borderTop: '2px solid #00ff9f', opacity: 0.6 }} />
      <div style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRight: '2px solid #00ff9f', borderTop: '2px solid #00ff9f', opacity: 0.6 }} />
      <div style={{ position: 'absolute', bottom: 16, left: 16, width: 32, height: 32, borderLeft: '2px solid #00ff9f', borderBottom: '2px solid #00ff9f', opacity: 0.6 }} />
      <div style={{ position: 'absolute', bottom: 16, right: 16, width: 32, height: 32, borderRight: '2px solid #00ff9f', borderBottom: '2px solid #00ff9f', opacity: 0.6 }} />

      <div style={{ width: '100%', maxWidth: '600px', padding: '0 32px' }}>
        {/* Logo */}
        <motion.div
          style={{ textAlign: 'center', marginBottom: '48px' }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div style={{
            fontSize: '64px', fontWeight: 'bold', color: '#00ff9f',
            fontFamily: 'monospace',
            textShadow: '0 0 20px rgba(0,255,159,0.8), 0 0 60px rgba(0,255,159,0.4)'
          }}>
            eDEX
          </div>
          <div style={{ color: '#485060', fontSize: '12px', marginTop: '8px', letterSpacing: '4px', fontFamily: 'monospace' }}>
            CYBER TERMINAL ENVIRONMENT
          </div>
        </motion.div>

        {/* Boot log */}
        <div style={{ fontFamily: 'monospace', fontSize: '13px', minHeight: '280px' }}>
          {visibleLines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.12 }}
              style={{ marginBottom: '4px', ...getLineStyle(line) }}
            >
              {!line.startsWith('-') && !line.startsWith('EDEX') && (
                <span style={{ color: '#00ff9f', marginRight: '8px' }}>{'>'}</span>
              )}
              {line}
            </motion.div>
          ))}

          {!isDone && visibleLines.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#00ff9f', marginRight: '8px' }}>{'>'}</span>
              <span style={{
                display: 'inline-block', width: '8px', height: '16px',
                background: '#00ff9f',
                animation: 'blink 1s step-end infinite'
              }} />
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: '32px' }}>
          <div style={{ height: '1px', background: 'rgba(72,80,96,0.3)', width: '100%', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: '#00ff9f',
              boxShadow: '0 0 8px rgba(0,255,159,0.8)',
              transition: 'width 0.1s ease'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#485060', fontSize: '11px', marginTop: '4px', fontFamily: 'monospace' }}>
            <span>BOOT SEQUENCE</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
