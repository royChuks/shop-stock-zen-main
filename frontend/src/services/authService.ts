import type { LoginResponse, SignupResponse, SignupData } from "@/types/auth";
import { authApi } from "./authApi";
import { authService as mockAuthService } from "./mockAuthService";

const USE_MOCK_MODE = import.meta.env.VITE_USE_MOCK === "true";

export const authService = USE_MOCK_MODE ? mockAuthService : {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await authApi.login(email, password);
    localStorage.setItem("auth_token", response.token);
    localStorage.setItem("auth_user", JSON.stringify(response.user));
    return response;
  },

  async signup(data: SignupData): Promise<SignupResponse> {
    const response = await authApi.register(data);
    localStorage.setItem("auth_token", response.token);
    localStorage.setItem("auth_user", JSON.stringify(response.user));
    return response;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return authApi.forgotPassword(email);
  },

  getCurrentUser() {
    const userStr = localStorage.getItem("auth_user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem("auth_token");
  },

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  },

  logout(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  },

  async validateToken(token: string): Promise<boolean> {
    try {
      await authApi.getProfile();
      return true;
    } catch {
      return false;
    }
  },
};