import React from "react";
import { useAgents } from "../hooks/useAgents";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast"; // shadcn style

export default function AgentList({ onEdit }) {
  const { data, isLoading, error } = useAgents();
  const { toast } = useToast();

  if (isLoading) return <div>Loading…</div>;
  if (error) return <div>Error</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold">Agents</h3>
        <Button onClick={() => onEdit(null)}>New Agent</Button>
      </div>

      <div className="grid gap-4">
        {data.map((a) => (
          <div key={a.id} className="p-4 rounded-xl bg-white/5 flex justify-between items-center">
            <div>
              <div className="font-medium">{a.name}</div>
              <div className="text-sm text-slate-400">{a.model} • {a.tasks_count ?? 0} tasks</div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => onEdit(a)}>Edit</Button>
              <Button onClick={() => {
                navigator.clipboard.writeText(a.id);
                toast({title: "Agent id copied"});
              }}>Copy ID</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
