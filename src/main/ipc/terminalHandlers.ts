import { ipcMain, BrowserWindow } from 'electron'
import { spawn, ChildProcess } from 'child_process'
import os from 'os'

interface ShellSession {
  process: ChildProcess
  id: string
}

const sessions = new Map<string, ShellSession>()

function getShell(): { cmd: string; args: string[] } {
  if (process.platform === 'win32') {
    return { cmd: 'powershell.exe', args: ['-NoLogo', '-NoExit', '-Command', '-'] }
  }
  return { cmd: process.env.SHELL ?? '/bin/bash', args: ['--login', '-i'] }
}

export function setupTerminalHandlers(): void {
  ipcMain.handle('terminal:create', async (event, id: string) => {
    if (sessions.has(id)) return { success: true }

    try {
      const { cmd, args } = getShell()
      const shell = spawn(cmd, args, {
        cwd: os.homedir(),
        env: {
          ...process.env as Record<string, string>,
          TERM: 'xterm-256color',
          COLORTERM: 'truecolor'
        },
        shell: false,
        windowsHide: true,
        stdio: ['pipe', 'pipe', 'pipe']
      })

      const sendData = (data: Buffer) => {
        const win = BrowserWindow.fromWebContents(event.sender)
        if (win && !win.isDestroyed()) {
          win.webContents.send('terminal:data', id, data.toString('utf8'))
        }
      }

      shell.stdout?.on('data', sendData)
      shell.stderr?.on('data', sendData)

      shell.on('exit', () => {
        sessions.delete(id)
        const win = BrowserWindow.fromWebContents(event.sender)
        if (win && !win.isDestroyed()) {
          win.webContents.send('terminal:exit', id)
        }
      })

      sessions.set(id, { process: shell, id })
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('terminal:write', async (_event, id: string, data: string) => {
    const session = sessions.get(id)
    if (!session) return { success: false, error: 'Session not found' }
    try {
      session.process.stdin?.write(data)
      return { success: true }
    } catch {
      return { success: false, error: 'Write failed' }
    }
  })

  // No-op: child_process doesn't support PTY resize — kept for API compat
  ipcMain.handle('terminal:resize', async () => ({ success: true }))

  ipcMain.handle('terminal:destroy', async (_event, id: string) => {
    const session = sessions.get(id)
    if (session) {
      try { session.process.kill() } catch { /* already dead */ }
      sessions.delete(id)
    }
    return { success: true }
  })
}

export function cleanupTerminals(): void {
  for (const session of sessions.values()) {
    try { session.process.kill() } catch { /* ignore */ }
  }
  sessions.clear()
}
