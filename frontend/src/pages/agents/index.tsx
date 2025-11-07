import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAgents } from "@/hooks/useAgents";
import { AgentModal } from "./AgentModal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MessageSquare, Edit, Copy } from "lucide-react";

interface Agent {
  id: number;
  name: string;
  model: string;
  tasks_count?: number;
  description?: string;
  temperature?: number;
}

export function AgentList() {
  const { data, isLoading } = useAgents();
  const { results: agents } = data || { results: [] };
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Agent | null>(null);

  if (isLoading) return <div>Loading agents…</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Agents</h2>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          New Agent
        </Button>
      </div>

      <div className="grid gap-3">
        {agents.map((a: Agent) => (
          <div
            key={a.id}
            className="p-3 rounded-xl bg-white/5 flex justify-between items-center hover:bg-white/10 transition-colors"
          >
            <div>
              <div className="font-medium">{a.name}</div>
              <div className="text-sm text-slate-400">
                {a.model} • {a.tasks_count ?? 0} tasks
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="default"
                onClick={() => navigate({ to: `/dashboard/agents/${a.id}` })}
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditing(a);
                  setOpen(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(String(a.id));
                  toast.info("Agent ID copied to clipboard.");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <AgentModal open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}
