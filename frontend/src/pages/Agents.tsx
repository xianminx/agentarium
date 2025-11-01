import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function Agents() {
  const { data, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get('/mock/agents').then(r => r.data),
  })

  if (isLoading) return <p>Loading agents...</p>

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Agents</h2>
      <ul className="space-y-2">
        {data.map((a: any) => (
          <li key={a.id} className="border rounded p-2">{a.name}</li>
        ))}
      </ul>
    </div>
  )
}
