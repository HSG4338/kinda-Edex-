import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('edex', {
  // Window controls
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    toggleFullscreen: () => ipcRenderer.send('window:toggle-fullscreen')
  },

  // Terminal
  terminal: {
    create: (id: string) => ipcRenderer.invoke('terminal:create', id),
    destroy: (id: string) => ipcRenderer.invoke('terminal:destroy', id),
    write: (id: string, data: string) => ipcRenderer.invoke('terminal:write', id, data),
    resize: (id: string, cols: number, rows: number) =>
      ipcRenderer.invoke('terminal:resize', id, cols, rows),
    onData: (id: string, callback: (data: string) => void) => {
      const handler = (_: Electron.IpcRendererEvent, termId: string, data: string) => {
        if (termId === id) callback(data)
      }
      ipcRenderer.on('terminal:data', handler)
      return () => ipcRenderer.removeListener('terminal:data', handler)
    }
  },

  // System info
  system: {
    getStats: () => ipcRenderer.invoke('system:stats'),
    getCpuHistory: () => ipcRenderer.invoke('system:cpu-history'),
    onStats: (callback: (stats: unknown) => void) => {
      const handler = (_: Electron.IpcRendererEvent, stats: unknown) => callback(stats)
      ipcRenderer.on('system:stats-update', handler)
      return () => ipcRenderer.removeListener('system:stats-update', handler)
    },
    startPolling: () => ipcRenderer.send('system:start-polling'),
    stopPolling: () => ipcRenderer.send('system:stop-polling')
  }
})
