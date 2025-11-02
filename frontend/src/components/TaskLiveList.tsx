import { useTaskStream } from "@/hooks/useTaskStream"

export function TaskLiveList() {
  const tasks = useTaskStream()

  return (
    <div className="space-y-2">
      {tasks.map((t) => (
        <div key={t.id} className="p-3 rounded-lg border bg-card">
          <div className="flex justify-between">
            <span>{t.id}</span>
            <span className="text-sm text-muted-foreground">{t.status}</span>
          </div>
          <pre className="text-xs mt-2">{t.output}</pre>
        </div>
      ))}
    </div>
  )
}
