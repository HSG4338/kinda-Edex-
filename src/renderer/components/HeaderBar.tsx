import { motion } from 'framer-motion'

interface HeaderBarProps {
  hostname: string
  onCommandPalette: () => void
  onClose: () => void
  onMinimize: () => void
  onToggleFullscreen: () => void
}

export function HeaderBar({
  hostname,
  onCommandPalette,
  onClose,
  onMinimize,
  onToggleFullscreen
}: HeaderBarProps) {
  return (
    <div
      className="flex items-center h-9 px-4 border-b bg-cyber-surface shrink-0"
      style={{ borderColor: 'rgba(0,255,159,0.2)' }}
    >
      {/* Logo */}
      <div
        className="text-cyber-accent font-bold text-sm tracking-widest"
        style={{ textShadow: '0 0 10px rgba(0,255,159,0.6)' }}
      >
        eDEX
      </div>

      {/* Separator */}
      <div className="w-px h-4 bg-cyber-border/30 mx-4" />

      {/* Host */}
      <div className="text-cyber-muted text-xs font-mono flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-cyber-accent animate-pulse inline-block" />
        {hostname || 'localhost'}
      </div>

      {/* Center: command palette hint */}
      <motion.button
        className="mx-auto flex items-center gap-2 px-3 py-1 rounded text-cyber-muted text-xs font-mono border border-cyber-border/20 hover:border-cyber-border/50 hover:text-cyber-text transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onCommandPalette}
      >
        <span className="text-cyber-accent">⌘</span>
        <span>Command Palette</span>
        <kbd className="bg-cyber-muted/20 px-1 rounded text-cyber-muted">Ctrl+K</kbd>
      </motion.button>

      {/* Right controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleFullscreen}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/5 text-cyber-muted hover:text-cyber-text transition-colors text-xs"
          title="Toggle fullscreen"
        >
          ⛶
        </button>
        <button
          onClick={onMinimize}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/5 text-cyber-muted hover:text-cyber-text transition-colors"
          title="Minimize"
        >
          ─
        </button>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-cyber-accent3/20 text-cyber-muted hover:text-cyber-accent3 transition-colors"
          title="Close"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
