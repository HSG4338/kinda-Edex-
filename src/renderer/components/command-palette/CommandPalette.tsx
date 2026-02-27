import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Command } from '../../types'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  commands: Command[]
}

export function CommandPalette({ isOpen, onClose, commands }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = query.trim()
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description.toLowerCase().includes(query.toLowerCase()) ||
          c.keywords.some((k) => k.toLowerCase().includes(query.toLowerCase()))
      )
    : commands

  const execute = useCallback(
    (cmd: Command) => {
      cmd.action()
      onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (filtered[selectedIndex]) execute(filtered[selectedIndex])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            className="relative w-full max-w-xl mx-4 cyber-border bg-cyber-surface rounded"
            initial={{ y: -20, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -10, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-cyber-border/30">
              <span className="text-cyber-accent text-sm font-mono">⌘</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search commands..."
                className="flex-1 bg-transparent text-cyber-text placeholder-cyber-muted outline-none font-mono text-sm"
                style={{ caretColor: '#00ff9f' }}
              />
              <span className="text-cyber-muted text-xs">ESC to close</span>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <div className="px-4 py-6 text-center text-cyber-muted font-mono text-sm">
                  No commands found
                </div>
              ) : (
                filtered.map((cmd, i) => (
                  <motion.button
                    key={cmd.id}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      i === selectedIndex
                        ? 'bg-cyber-accent/10 text-cyber-accent'
                        : 'text-cyber-text hover:bg-white/5'
                    }`}
                    onClick={() => execute(cmd)}
                    onMouseEnter={() => setSelectedIndex(i)}
                  >
                    {cmd.icon && (
                      <span className="text-base w-5 text-center shrink-0">{cmd.icon}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm font-medium">{cmd.label}</div>
                      <div className="text-xs text-cyber-muted truncate">{cmd.description}</div>
                    </div>
                    {i === selectedIndex && (
                      <span className="text-xs text-cyber-accent/60 shrink-0">ENTER</span>
                    )}
                  </motion.button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 px-4 py-2 border-t border-cyber-border/20 text-cyber-muted text-xs font-mono">
              <span>↑↓ navigate</span>
              <span>↵ execute</span>
              <span className="ml-auto">{filtered.length} commands</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
