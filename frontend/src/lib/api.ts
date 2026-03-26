import axios, { type AxiosInstance } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const API_URL = import.meta.env.VITE_API_URL; 

/**
 * API Client with automatic token injection
 * 
 * - Attaches JWT token to all requests
 * - Handles 401 responses (token expiry)
 * - Type-safe request/response handling
 */

let apiClient: AxiosInstance | null = null;

export function initializeApiClient() {
  apiClient = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor: attach token
  apiClient.interceptors.request.use((config) => {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor: handle 401
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return apiClient;
}

export function getApiClient(): AxiosInstance {
  if (!apiClient) {
    initializeApiClient();
  }
  return apiClient!;
}

// Auth endpoints
export const authAPI = {
  login: (email: string, password: string) =>
    getApiClient().post('/auth/login', { email, password }),

  register: (email: string, password: string) =>
    getApiClient().post('/auth/register', { email, password }),

  completeOnboarding: () =>
    getApiClient().post('/auth/complete-onboarding'),
};

// Simulation endpoints (Admin only)
export const simulationAPI = {
  getTemplates: () =>
    getApiClient().get('/simulations/templates'),

  sendSimulation: (targetEmail: string, templateId: string) =>
    getApiClient().post('/simulations/send', { targetEmail, templateId }),
};

// Recovery/Investigation endpoints
export const recoveryAPI = {
  getRecoveryData: (token: string) =>
    getApiClient().get(`/recovery/${token}`),

  getGameManifest: (token: string) =>
    getApiClient().get(`/games/manifest?token=${token}`),

  saveGameProgress: (token: string, score: number, gameModuleId: string, stateData?: object) =>
    getApiClient().put('/games/savegame', { token, score, gameModuleId, stateData: stateData ?? null }),
};

