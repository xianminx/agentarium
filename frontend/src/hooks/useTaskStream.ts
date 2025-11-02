import { useEffect, useState } from "react"

export function useTaskStream() {
  const [updates, setUpdates] = useState<any[]>([])

  useEffect(() => {
    const evtSource = new EventSource("http://localhost:8000/stream/tasks/")
    evtSource.onmessage = (e) => {
      const data = JSON.parse(e.data)
      setUpdates((prev) => {
        const existing = prev.filter((t) => t.id !== data.id)
        return [data, ...existing]
      })
    }
    return () => evtSource.close()
  }, [])

  return updates
}
