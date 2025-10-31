import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

function useTasks(params) {
  return useQuery(["tasks", params], async () => {
    const { data } = await api.get("/tasks/", { params });
    return data;
  }, { keepPreviousData: true });
}

export default function TaskList() {
  const [filters, setFilters] = useState({ status: "", agent: "", ordering: "-created_at" });
  const { data, isLoading } = useTasks(filters);

  if (isLoading) return <div>Loading tasks…</div>;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
        </select>
        <input placeholder="Agent id" value={filters.agent} onChange={e => setFilters({...filters, agent: e.target.value})} />
        <select value={filters.ordering} onChange={e => setFilters({...filters, ordering: e.target.value})}>
          <option value="-created_at">Newest</option>
          <option value="created_at">Oldest</option>
        </select>
      </div>

      <div className="space-y-3">
        {data.results.map(t => (
          <div key={t.id} className="p-3 rounded bg-white/5">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">{t.agent_name}</div>
                <div className="text-sm text-slate-400">{t.input_text.slice(0,80)}</div>
              </div>
              <div className="text-sm">{t.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
