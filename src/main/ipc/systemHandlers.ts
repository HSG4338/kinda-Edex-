import { ipcMain, BrowserWindow } from 'electron'
import si from 'systeminformation'

interface SystemStats {
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

const cpuHistory: number[] = new Array(60).fill(0)
let pollingInterval: NodeJS.Timeout | null = null

async function collectStats(): Promise<SystemStats> {
  const [cpuLoad, mem, disks, networkStats, osInfo, cpuInfo, timeInfo] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.fsSize(),
    si.networkStats(),
    si.osInfo(),
    si.cpu(),
    si.time()
  ])

  const cpuUsage = Math.round(cpuLoad.currentLoad)
  cpuHistory.push(cpuUsage)
  cpuHistory.shift()

  return {
    cpu: {
      usage: cpuUsage,
      cores: cpuInfo.physicalCores,
      model: cpuInfo.brand,
      speed: cpuInfo.speed
    },
    memory: {
      total: mem.total,
      used: mem.used,
      free: mem.free,
      percent: Math.round((mem.used / mem.total) * 100)
    },
    disk: disks.slice(0, 4).map((d) => ({
      fs: d.fs,
      size: d.size,
      used: d.used,
      percent: d.use,
      mount: d.mount
    })),
    network: networkStats.slice(0, 2).map((n) => ({
      iface: n.iface,
      rx_sec: Math.max(0, n.rx_sec ?? 0),
      tx_sec: Math.max(0, n.tx_sec ?? 0)
    })),
    os: {
      platform: osInfo.platform,
      distro: osInfo.distro,
      hostname: osInfo.hostname,
      uptime: Math.floor(timeInfo.uptime ?? 0)
    },
    timestamp: Date.now()
  }
}

export function setupSystemHandlers(): void {
  ipcMain.handle('system:stats', async () => {
    try {
      return await collectStats()
    } catch (error) {
      return null
    }
  })

  ipcMain.handle('system:cpu-history', () => {
    return [...cpuHistory]
  })

  ipcMain.on('system:start-polling', (event) => {
    if (pollingInterval) clearInterval(pollingInterval)

    pollingInterval = setInterval(async () => {
      try {
        const stats = await collectStats()
        const win = BrowserWindow.fromWebContents(event.sender)
        if (win && !win.isDestroyed()) {
          win.webContents.send('system:stats-update', stats)
        }
      } catch {
        // Stats collection failed silently
      }
    }, 1500)
  })

  ipcMain.on('system:stop-polling', () => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  })
}
