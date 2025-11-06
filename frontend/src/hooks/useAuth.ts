import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useNavigate } from "@tanstack/react-router";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  last_login: string | null;
  is_superuser: boolean;
}

interface AuthTokens {
  access: string;
  refresh: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Custom hook for authentication using React Query.
 * Provides login, logout, register functions and current user state.
 */
export function useAuth(): AuthState & {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  refetchUser: () => void;
} {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch current user
  const {
    data: user,
    isLoading,
    refetch: refetchUser,
  } = useQuery<User | null>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) return null;

      try {
        const response = await api.get("/auth/me/");
        return response.data;
      } catch (error) {
        // If token is invalid, clear it
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post("/auth/login/", credentials);
      return response.data as AuthTokens;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await api.post("/auth/register/", data);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.tokens.access);
      localStorage.setItem("refreshToken", data.tokens.refresh);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          await api.post("/auth/logout/", { refresh: refreshToken });
        } catch (error) {
          // Continue with logout even if blacklist fails
          console.error("Failed to blacklist token:", error);
        }
      }
    },
    onSuccess: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      queryClient.setQueryData(["currentUser"], null);
      queryClient.clear();
      navigate({ to: "/" });
    },
  });

  return {
    user: user || null,
    isAuthenticated: !!user,
    isLoading,
    login: async (credentials: LoginCredentials) => {
      await loginMutation.mutateAsync(credentials);
    },
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
    register: async (data: RegisterData) => {
      await registerMutation.mutateAsync(data);
    },
    refetchUser: () => {
      refetchUser();
    },
  };
}
