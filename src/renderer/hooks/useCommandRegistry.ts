import { useState, useCallback, useMemo } from 'react'
import type { Command } from '../types'

interface UseCommandRegistryReturn {
  commands: Command[]
  register: (command: Command) => void
  unregister: (id: string) => void
  search: (query: string) => Command[]
}

export function useCommandRegistry(
  initialCommands: Command[] = []
): UseCommandRegistryReturn {
  const [commands, setCommands] = useState<Command[]>(initialCommands)

  const register = useCallback((command: Command) => {
    setCommands((prev) => {
      if (prev.find((c) => c.id === command.id)) return prev
      return [...prev, command]
    })
  }, [])

  const unregister = useCallback((id: string) => {
    setCommands((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const search = useCallback(
    (query: string): Command[] => {
      if (!query.trim()) return commands
      const q = query.toLowerCase()
      return commands.filter(
        (c) =>
          c.label.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.keywords.some((k) => k.toLowerCase().includes(q))
      )
    },
    [commands]
  )

  return { commands, register, unregister, search }
}
