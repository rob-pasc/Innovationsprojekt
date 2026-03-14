import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  role: 'user' | 'moderator' | 'admin';
  total_points: number;
  exp_lvl: number;
  created_at: string;
}

interface AuthStore {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;

  // Actions
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // API calls (to be implemented)
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
}

/**
 * useAuthStore
 * 
 * Global authentication state using Zustand.
 * Persists user and token to localStorage.
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null,

      // State setters
      setUser: (user) => set({ user, isAuthenticated: true }),
      setToken: (token) => set({ token }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          token: null,
          error: null,
        }),

      // API calls (wired to backend)
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { authAPI } = await import('@/lib/api');
          const response = await authAPI.login(email, password);
          const { user, token } = response.data;
          set({
            user,
            token,
            isAuthenticated: true,
            error: null,
            isLoading: false,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Login failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      register: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { authAPI } = await import('@/lib/api');
          const response = await authAPI.register(email, password);
          const { user, token } = response.data;
          set({
            user,
            token,
            isAuthenticated: true,
            error: null,
            isLoading: false,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Registration failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage', // localStorage key
    }
  )
);
