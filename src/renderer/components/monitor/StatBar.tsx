import { motion } from 'framer-motion'

interface StatBarProps {
  label: string
  value: number
  max?: number
  unit?: string
  color?: string
}

function getColor(pct: number, base: string): string {
  if (pct > 85) return '#ff0055'
  if (pct > 65) return '#ffd700'
  return base
}

export function StatBar({ label, value, max = 100, unit = '%', color = '#00ff9f' }: StatBarProps) {
  const pct = Math.min((value / max) * 100, 100)
  const dynamicColor = getColor(pct, color)

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs font-mono">
        <span className="text-cyber-muted uppercase tracking-wider">{label}</span>
        <span style={{ color: dynamicColor }}>
          {unit === '%'
            ? `${Math.round(pct)}%`
            : `${formatBytes(value)} / ${formatBytes(max)}`}
        </span>
      </div>
      <div className="w-full h-1.5 bg-cyber-muted/20 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: dynamicColor,
            boxShadow: `0 0 6px ${dynamicColor}`
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)}MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`
}
