import { useState } from "react";
import { useAgents } from "@/hooks/useAgents";
import {AgentModal} from "./AgentModal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AgentList() {
    const { data, isLoading } = useAgents();
    const {results: agents} = data || {results: []};
    
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);

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
                {agents.map((a: any) => (
                    <div
                        key={a.id}
                        className="p-3 rounded-xl bg-white/5 flex justify-between items-center"
                    >
                        <div>
                            <div className="font-medium">{a.name}</div>
                            <div className="text-sm text-slate-400">
                                {a.model} • {a.tasks_count ?? 0} tasks
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setEditing(a);
                                    setOpen(true);
                                }}
                            >
                                Edit
                            </Button>
                            <Button
                                onClick={() => {
                                    navigator.clipboard.writeText(String(a.id));
                                    toast.info("Agent ID copied to clipboard.");
                                }}
                            >
                                Copy ID
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <AgentModal open={open} onOpenChange={setOpen} editing={editing} />
        </div>
    );
}
