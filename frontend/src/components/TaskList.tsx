import  { useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { useRunTask } from "../hooks/useMutations";
import { Button } from "@/components/ui/button";
import {toast } from "sonner";

export default function TaskList() {
  const [filters, setFilters] = useState({ status: "", agent: "", ordering: "-created_at" });
  const { data, isLoading } = useTasks(filters);
  const { mutateAsync: runTask, isPending: running } = useRunTask();

  if (isLoading) return <div>Loading tasks…</div>;

  const results = data?.results ?? data;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} className="rounded p-1 bg-white/5">
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
        </select>
        <input placeholder="Agent id" value={filters.agent} onChange={(e) => setFilters({...filters, agent: e.target.value})} className="rounded p-1 bg-white/5" />
        <select value={filters.ordering} onChange={(e) => setFilters({...filters, ordering: e.target.value})} className="rounded p-1 bg-white/5">
          <option value="-created_at">Newest</option>
          <option value="created_at">Oldest</option>
        </select>
      </div>

      <div className="space-y-3">
        {results?.map((t: any) => (
          <div key={t.id} className="p-3 rounded bg-white/5 flex justify-between items-start">
            <div>
              <div className="font-medium">{t.agent_name}</div>
              <div className="text-sm text-slate-400">{t.input_text.slice(0, 100)}</div>
              <div className="text-xs text-slate-500 mt-1">{t.created_at}</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-sm">{t.status}</div>
              <Button size="sm" onClick={async () => {
                try {
                  await runTask({ agent: t.agent, input_text: t.input_text });
                  toast.info("Task has been queued");
                } catch (e) {
                  toast.error("Could not start task");
                }
              }} disabled={running}>Re-run</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
