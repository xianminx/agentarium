import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export function useCreateAgent() {
  const qc = useQueryClient();
  return useMutation(
    async (payload: any) => {
      const { data } = await api.post("/agents/", payload);
      return data;
    },
    {
      onSuccess: () => qc.invalidateQueries(["agents"]),
    }
  );
}

export function useRunTask() {
  const qc = useQueryClient();
  return useMutation(
    async (payload: any) => {
      const { data } = await api.post("/tasks/run/", payload);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(["tasks"]);
        qc.invalidateQueries(["agents"]);
      },
    }
  );
}
