import { useQuery } from "@tanstack/react-query";
import {api} from "@/lib/api";

export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data } = await api.get("/agents/");
      return data;
    },
    staleTime: 5000,
  });
}
