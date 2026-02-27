import { useState, useEffect, useRef, useCallback, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TerminalLine {
  id: number
  type: 'output' | 'input' | 'info' | 'error'
  text: string
}

interface TerminalPanelProps {
  id: string
}

let lineIdCounter = 0
const nextId = () => ++lineIdCounter

const WELCOME_LINES: TerminalLine[] = [
  { id: nextId(), type: 'info', text: '╔══════════════════════════════════════╗' },
  { id: nextId(), type: 'info', text: '║       eDEX TERMINAL v1.0.0           ║' },
  { id: nextId(), type: 'info', text: '║       Cyber Terminal Environment     ║' },
  { id: nextId(), type: 'info', text: '╚══════════════════════════════════════╝' },
  { id: nextId(), type: 'info', text: '' },
  { id: nextId(), type: 'info', text: 'Shell session starting...' },
  { id: nextId(), type: 'info', text: 'Type commands below. Output streams live.' },
  { id: nextId(), type: 'info', text: '' },
]

export function TerminalPanel({ id }: TerminalPanelProps) {
  const [lines, setLines] = useState<TerminalLine[]>(WELCOME_LINES)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isReady, setIsReady] = useState(false)
  const [hasExited, setHasExited] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const outputBufferRef = useRef('')
  const flushTimerRef = useRef<NodeJS.Timeout | null>(null)

  const addLine = useCallback((text: string, type: TerminalLine['type'] = 'output') => {
    setLines((prev) => [...prev, { id: nextId(), type, text }])
  }, [])

  // Flush buffered output as lines
  const flushBuffer = useCallback(() => {
    const raw = outputBufferRef.current
    if (!raw) return
    outputBufferRef.current = ''

    // Strip ANSI escape codes for clean display
    const clean = raw.replace(
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><~]/g,
      ''
    )

    const newLines = clean.split(/\r?\n/)
    setLines((prev) => {
      const last = prev[prev.length - 1]
      const updated = [...prev]

      for (let i = 0; i < newLines.length; i++) {
        const chunk = newLines[i]
        if (i === 0 && last && last.type === 'output' && !last.text.endsWith('\n')) {
          // Append to last line if it's incomplete
          updated[updated.length - 1] = { ...last, text: last.text + chunk }
        } else if (chunk !== '' || i < newLines.length - 1) {
          updated.push({ id: nextId(), type: 'output', text: chunk })
        }
      }
      return updated
    })
  }, [])

  // Buffer incoming data and flush in batches for performance
  const handleData = useCallback((data: string) => {
    outputBufferRef.current += data
    if (flushTimerRef.current) clearTimeout(flushTimerRef.current)
    flushTimerRef.current = setTimeout(flushBuffer, 16)
  }, [flushBuffer])

  useEffect(() => {
    let removeListener: (() => void) | null = null

    window.edex.terminal.create(id).then((result) => {
      if (result.success) {
        setIsReady(true)
        addLine('Shell ready. Enter commands.', 'info')
        addLine('', 'info')
      } else {
        addLine(`Failed to start shell: ${result.error ?? 'unknown error'}`, 'error')
      }
    })

    removeListener = window.edex.terminal.onData(id, handleData)

    // Listen for shell exit
    const origOnData = removeListener
    const exitCleanup = window.edex.terminal.onData(id, () => {})

    return () => {
      origOnData?.()
      exitCleanup?.()
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current)
      window.edex.terminal.destroy(id)
    }
  }, [id, addLine, handleData])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  const submitCommand = useCallback(async () => {
    const cmd = input.trim()
    if (!cmd) {
      window.edex.terminal.write(id, '\r\n')
      return
    }

    addLine(`> ${cmd}`, 'input')
    setHistory((prev) => [cmd, ...prev.slice(0, 99)])
    setHistoryIndex(-1)
    setInput('')

    await window.edex.terminal.write(id, cmd + '\n')
  }, [input, id, addLine])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        submitCommand()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHistoryIndex((prev) => {
          const next = Math.min(prev + 1, history.length - 1)
          if (history[next] !== undefined) setInput(history[next])
          return next
        })
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHistoryIndex((prev) => {
          const next = Math.max(prev - 1, -1)
          setInput(next === -1 ? '' : history[next] ?? '')
          return next
        })
      } else if (e.key === 'c' && e.ctrlKey) {
        e.preventDefault()
        window.edex.terminal.write(id, '\x03')
        addLine('^C', 'info')
        setInput('')
      } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault()
        setLines([])
      } else if (e.key === 'd' && e.ctrlKey) {
        e.preventDefault()
        window.edex.terminal.write(id, '\x04')
      } else if (e.key === 'Tab') {
        e.preventDefault()
        window.edex.terminal.write(id, '\t')
      }
    },
    [submitCommand, history, id, addLine]
  )

  const focusInput = () => inputRef.current?.focus()

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return 'text-cyber-accent'
      case 'info': return 'text-cyber-accent2'
      case 'error': return 'text-cyber-accent3'
      default: return 'text-cyber-text'
    }
  }

  return (
    <div
      className="w-full h-full flex flex-col bg-cyber-bg font-mono text-sm cursor-text overflow-hidden"
      onClick={focusInput}
    >
      {/* Output area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5">
        <AnimatePresence initial={false}>
          {lines.map((line) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.08 }}
              className={`leading-5 whitespace-pre-wrap break-all select-text ${getLineColor(line.type)}`}
            >
              {line.text || '\u00A0'}
            </motion.div>
          ))}
        </AnimatePresence>

        {hasExited && (
          <div className="text-cyber-accent3 mt-2">
            [Shell process exited]
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div
        className="flex items-center gap-2 px-4 py-2 border-t shrink-0"
        style={{ borderColor: 'rgba(0,255,159,0.2)', background: 'rgba(0,255,159,0.03)' }}
      >
        <span
          className="text-cyber-accent shrink-0 select-none"
          style={{ textShadow: '0 0 6px rgba(0,255,159,0.8)' }}
        >
          {isReady ? '❯' : '⟳'}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!isReady || hasExited}
          placeholder={isReady ? 'Enter command...' : 'Starting shell...'}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          className="flex-1 bg-transparent outline-none text-cyber-text placeholder-cyber-muted/50 font-mono text-sm"
          style={{ caretColor: '#00ff9f' }}
        />
        {input && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-cyber-accent/50 hover:text-cyber-accent text-xs shrink-0 px-1"
            onClick={submitCommand}
          >
            ENTER
          </motion.button>
        )}
      </div>
    </div>
  )
}
