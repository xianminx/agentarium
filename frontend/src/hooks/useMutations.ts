import { useMutation, useQueryClient } from "@tanstack/react-query";
import {api} from "@/lib/api";

type AgentPayload = {
  name: string;
  description?: string;
  model: string;
  temperature?: number;
};

type RunTaskPayload = Record<string, unknown>;

export function useCreateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AgentPayload) => {
      const { data } = await api.post("/agents/", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}

export function useRunTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RunTaskPayload) => {
      const { data } = await api.post("/tasks/run/", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}
