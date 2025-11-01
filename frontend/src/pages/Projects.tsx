import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export function Projects() {
  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/api/projects').then(r => r.data),
  })

  if (isLoading) return <p>Loading projects...</p>

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Projects</h2>
      <ul className="space-y-2">
        {data.map((p: any) => (
          <li key={p.id} className="border rounded p-2">{p.title}</li>
        ))}
      </ul>
    </div>
  )
}
