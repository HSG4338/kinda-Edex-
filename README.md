# eDEX — Cyber Terminal Environment

A full-screen, futuristic terminal desktop application built with Electron, React, TypeScript, and xterm.js. Real terminal access, live system monitoring, boot sequence animation, and a command palette — all wrapped in a dark cyber aesthetic.

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+
- **Python** (for native module compilation — node-pty requires it)
- **C++ build tools**:
  - **macOS**: Xcode command line tools (`xcode-select --install`)
  - **Windows**: `npm install -g windows-build-tools` (run as admin) or Visual Studio Build Tools
  - **Linux**: `apt-get install build-essential` or equivalent

---

## Installation

```bash
# Clone / enter the project directory
cd edex

# Install dependencies
npm install

# Rebuild native modules for Electron
npx electron-rebuild
```

> **Note**: `node-pty` is a native module and requires compilation. The `electron-rebuild` step is mandatory.

---

## Development

```bash
npm run dev
```

This starts:
1. Vite dev server for the React renderer (port 5173)
2. TypeScript compiler for the main process
3. Electron window (waits for Vite to be ready)

---

## Production Build

```bash
npm run build        # Compile everything
npm run package      # Create distributable (in /release)
```

Output files:
- **Windows**: `release/*.exe` (NSIS installer)
- **macOS**: `release/*.dmg`
- **Linux**: `release/*.AppImage`

---

## Architecture

```
edex/
├── src/
│   ├── main/                    # Electron main process (Node.js)
│   │   ├── main.ts              # App entry, window creation
│   │   ├── preload.ts           # Context bridge (IPC API)
│   │   └── ipc/
│   │       ├── terminalHandlers.ts  # node-pty sessions
│   │       └── systemHandlers.ts    # systeminformation polling
│   └── renderer/                # React UI (browser context)
│       ├── App.tsx              # Root component, layout
│       ├── main.tsx             # React entry point
│       ├── index.css            # Global styles
│       ├── types/               # TypeScript interfaces
│       ├── hooks/
│       │   ├── useSystemStats.ts    # Live system data
│       │   └── useCommandRegistry.ts # Command management
│       └── components/
│           ├── boot/            # Boot sequence animation
│           ├── terminal/        # xterm.js integration
│           ├── monitor/         # CPU/RAM/disk/network UI
│           ├── command-palette/ # Global command search
│           └── HeaderBar.tsx    # Top bar + window controls
├── index.html
├── vite.config.ts               # Renderer build
├── tsconfig.json                # Renderer TS config
├── tsconfig.main.json           # Main process TS config
├── tailwind.config.js
└── package.json
```

---

## Key Features

| Feature | Implementation |
|---|---|
| Real terminal | `node-pty` spawns PowerShell/Bash, streamed via IPC to `xterm.js` |
| Live system stats | `systeminformation` polled every 1.5s, pushed to renderer via IPC |
| Boot animation | Typed log sequence with progress bar, Framer Motion transitions |
| Command palette | `Ctrl+K` opens searchable command registry with keyboard nav |
| Cyber UI | TailwindCSS + custom CSS, glitch effects, scanline overlay |
| Security | Context isolation ON, node integration OFF, preload bridge only |

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+K` | Open command palette |
| `Ctrl+L` | Clear terminal |
| `Ctrl+C` | Interrupt running process |
| `Ctrl+D` | Send EOF |
| `Tab` | Terminal autocomplete |
| `Escape` | Close command palette |

---

## Extending Commands

Register new commands by adding entries to the `DEFAULT_COMMANDS` array in `App.tsx`:

```typescript
{
  id: 'my.command',
  label: 'My Command',
  description: 'Does something useful',
  keywords: ['useful', 'thing'],
  icon: '🔧',
  action: () => {
    // Do the thing
    window.edex.terminal.write(TERMINAL_ID, 'echo hello\r')
  }
}
```

---

## Troubleshooting

**node-pty fails to compile**
- Ensure Python and C++ build tools are installed
- Run `npx electron-rebuild` after `npm install`
- On Windows, may need Visual Studio 2019+ build tools

**Blank screen in dev**
- Wait for both the Vite server AND the main process to start
- Check devtools console (opens automatically in dev mode)

**Terminal not responding**
- Check that the shell exists: `echo $SHELL` on Unix, or PowerShell on Windows
- Review main process output in the terminal you ran `npm run dev` from
