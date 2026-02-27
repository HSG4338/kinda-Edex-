export interface SystemStats {
  cpu: {
    usage: number
    cores: number
    model: string
    speed: number
  }
  memory: {
    total: number
    used: number
    free: number
    percent: number
  }
  disk: Array<{
    fs: string
    size: number
    used: number
    percent: number
    mount: string
  }>
  network: Array<{
    iface: string
    rx_sec: number
    tx_sec: number
  }>
  os: {
    platform: string
    distro: string
    hostname: string
    uptime: number
  }
  timestamp: number
}

export interface TerminalResult {
  success: boolean
  error?: string
}

export interface EdexAPI {
  window: {
    minimize: () => void
    maximize: () => void
    close: () => void
    toggleFullscreen: () => void
  }
  terminal: {
    create: (id: string) => Promise<TerminalResult>
    destroy: (id: string) => Promise<TerminalResult>
    write: (id: string, data: string) => Promise<TerminalResult>
    resize: (id: string, cols: number, rows: number) => Promise<TerminalResult>
    onData: (id: string, callback: (data: string) => void) => () => void
  }
  system: {
    getStats: () => Promise<SystemStats | null>
    getCpuHistory: () => Promise<number[]>
    onStats: (callback: (stats: SystemStats) => void) => () => void
    startPolling: () => void
    stopPolling: () => void
  }
}

declare global {
  interface Window {
    edex: EdexAPI
  }
}

export type AppPhase = 'boot' | 'main'

export interface Command {
  id: string
  label: string
  description: string
  keywords: string[]
  action: () => void
  icon?: string
}
