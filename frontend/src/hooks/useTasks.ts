import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

export function useTasks(params = {}) {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: async () => {
      const { data } = await api.get("/tasks/", { params });
      return data; // expected paginated: {count, next, previous, results}
    },
    placeholderData: (previousData) => previousData,
  });
}
