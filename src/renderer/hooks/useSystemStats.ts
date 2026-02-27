import { useState, useEffect, useCallback } from 'react'
import type { SystemStats } from '../types'

interface UseSystemStatsReturn {
  stats: SystemStats | null
  cpuHistory: number[]
  isLoading: boolean
}

export function useSystemStats(): UseSystemStatsReturn {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [cpuHistory, setCpuHistory] = useState<number[]>(new Array(60).fill(0))
  const [isLoading, setIsLoading] = useState(true)

  const updateHistory = useCallback((usage: number) => {
    setCpuHistory((prev) => {
      const next = [...prev.slice(1), usage]
      return next
    })
  }, [])

  useEffect(() => {
    let cleanup: (() => void) | null = null

    const init = async () => {
      // Get initial stats
      const initial = await window.edex.system.getStats()
      if (initial) {
        setStats(initial)
        updateHistory(initial.cpu.usage)
      }

      const history = await window.edex.system.getCpuHistory()
      setCpuHistory(history)
      setIsLoading(false)

      // Subscribe to live updates
      cleanup = window.edex.system.onStats((newStats) => {
        setStats(newStats)
        updateHistory(newStats.cpu.usage)
      })

      window.edex.system.startPolling()
    }

    init()

    return () => {
      cleanup?.()
      window.edex.system.stopPolling()
    }
  }, [updateHistory])

  return { stats, cpuHistory, isLoading }
}
