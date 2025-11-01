import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8000/api",
});

// mock data fallback (for Part 1)
if (import.meta.env.DEV) {
  api.get = async (url: string) => {
    if (url.includes('agents')) {
      return { data: [{ id: 1, name: 'Agent Alpha' }, { id: 2, name: 'Agent Beta' }] }
    }
    if (url.includes('projects')) {
      return { data: [{ id: 1, title: 'Project X' }, { id: 2, title: 'Project Y' }] }
    }
    return { data: [] }
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export { api };
  