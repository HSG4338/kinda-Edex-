interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  label?: string
}

export function Sparkline({
  data,
  width = 160,
  height = 40,
  color = '#00ff9f',
  label
}: SparklineProps) {
  if (data.length === 0) return null

  const max = 100
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - (val / max) * height
    return `${x},${y}`
  })

  const pathD = `M ${points.join(' L ')}`

  // Fill path
  const fillD = `M 0,${height} L ${pathD.slice(2)} L ${width},${height} Z`

  return (
    <div className="relative">
      {label && (
        <div className="text-xs text-cyber-muted mb-1 font-mono">{label}</div>
      )}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path
          d={fillD}
          fill={`url(#grad-${color.replace('#', '')})`}
        />
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 3px ${color})` }}
        />
      </svg>
    </div>
  )
}
