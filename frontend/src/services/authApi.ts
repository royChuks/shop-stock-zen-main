import { api } from "./api";
import type { LoginResponse, SignupResponse, SignupData } from "@/types/auth";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  businessType?: string;
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", { email, password });
    return response;
  },

  async register(data: SignupData): Promise<SignupResponse> {
    const response = await api.post<SignupResponse>("/auth/register", data);
    return response;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>("/auth/forgot-password", { email });
    return response;
  },

  async getProfile(): Promise<UserProfile> {
    const response = await api.get<UserProfile>("/users/me");
    return response;
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await api.put<UserProfile>("/users/me", data);
    return response;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>("/users/me/password", {
      currentPassword,
      newPassword,
    });
    return response;
  },
};