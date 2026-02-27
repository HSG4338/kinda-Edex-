import { motion } from 'framer-motion'
import { useSystemStats } from '../../hooks/useSystemStats'
import { Sparkline } from './Sparkline'
import { StatBar } from './StatBar'
import { useState, useEffect } from 'react'

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function formatNetSpeed(bps: number): string {
  if (bps < 1024) return `${bps.toFixed(0)} B/s`
  if (bps < 1024 * 1024) return `${(bps / 1024).toFixed(1)} KB/s`
  return `${(bps / (1024 * 1024)).toFixed(1)} MB/s`
}

export function SystemMonitor() {
  const { stats, cpuHistory, isLoading } = useSystemStats()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-full flex flex-col gap-3 p-3 font-mono text-xs overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyber-border/30 pb-2">
        <div className="text-cyber-accent font-bold tracking-widest text-xs">SYS.MONITOR</div>
        <div className="text-cyber-muted text-xs">
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-cyber-muted">
          Collecting data...
        </div>
      ) : (
        <>
          {/* CPU */}
          <div className="space-y-2">
            <div className="text-cyber-accent2 text-xs tracking-widest">CPU</div>
            {stats && (
              <div className="text-cyber-muted text-xs truncate" title={stats.cpu.model}>
                {stats.cpu.model.slice(0, 28)}
              </div>
            )}
            <Sparkline data={cpuHistory} color="#00ff9f" width={200} height={36} />
            <StatBar
              label="Load"
              value={stats?.cpu.usage ?? 0}
              max={100}
              unit="%"
              color="#00ff9f"
            />
            <div className="flex justify-between text-cyber-muted">
              <span>Cores: {stats?.cpu.cores ?? '-'}</span>
              <span>{stats?.cpu.speed ?? '-'} GHz</span>
            </div>
          </div>

          <div className="border-t border-cyber-border/20" />

          {/* Memory */}
          <div className="space-y-2">
            <div className="text-cyber-accent2 text-xs tracking-widest">MEMORY</div>
            <StatBar
              label="RAM"
              value={stats?.memory.used ?? 0}
              max={stats?.memory.total ?? 1}
              unit="bytes"
              color="#00b8ff"
            />
            <div className="flex justify-between text-cyber-muted">
              <span>
                Free:{' '}
                {stats
                  ? `${(stats.memory.free / 1024 / 1024 / 1024).toFixed(1)}GB`
                  : '-'}
              </span>
              <span>{stats?.memory.percent ?? 0}%</span>
            </div>
          </div>

          <div className="border-t border-cyber-border/20" />

          {/* Disk */}
          <div className="space-y-2">
            <div className="text-cyber-accent2 text-xs tracking-widest">STORAGE</div>
            {stats?.disk.slice(0, 2).map((disk, i) => (
              <div key={i} className="space-y-1">
                <StatBar
                  label={disk.mount}
                  value={disk.used}
                  max={disk.size}
                  unit="bytes"
                  color="#ffd700"
                />
              </div>
            ))}
          </div>

          <div className="border-t border-cyber-border/20" />

          {/* Network */}
          <div className="space-y-2">
            <div className="text-cyber-accent2 text-xs tracking-widest">NETWORK</div>
            {stats?.network.slice(0, 1).map((net, i) => (
              <div key={i} className="space-y-1">
                <div className="text-cyber-muted text-xs truncate">{net.iface}</div>
                <div className="flex justify-between">
                  <div className="text-green-400">
                    ↑ {formatNetSpeed(net.tx_sec)}
                  </div>
                  <div className="text-cyber-accent2">
                    ↓ {formatNetSpeed(net.rx_sec)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-cyber-border/20" />

          {/* OS Info */}
          <div className="space-y-1">
            <div className="text-cyber-accent2 text-xs tracking-widest">SYSTEM</div>
            <div className="text-cyber-muted space-y-0.5">
              <div>Host: {stats?.os.hostname}</div>
              <div>OS: {stats?.os.distro?.slice(0, 20)}</div>
              <div>Up: {stats ? formatUptime(stats.os.uptime) : '--:--:--'}</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
