import type { LoginResponse, SignupResponse, SignupData } from "@/types/auth";

const mockUsers: { [key: string]: { password: string; user: LoginResponse["user"]; token: string } } = {
  "test@example.com": {
    password: "password123",
    user: {
      id: "1",
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
      businessName: "Tech Store",
      businessType: "Retail",
    },
    token: "mock_token_123",
  },
};

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const userRecord = mockUsers[email];
    if (!userRecord || userRecord.password !== password) {
      throw new Error("Invalid email or password");
    }
    const response: LoginResponse = { user: userRecord.user, token: userRecord.token };
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    return response;
  },

  async signup(data: SignupData): Promise<SignupResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (mockUsers[data.email]) throw new Error("Email already registered");
    if (data.password !== data.confirmPassword) throw new Error("Passwords do not match");
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      businessName: data.businessName,
      businessType: data.businessType,
    };
    const token = `mock_token_${Date.now()}`;
    mockUsers[data.email] = { password: data.password, user: newUser, token };
    const response: SignupResponse = { user: newUser, token };
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    return response;
  },

  getCurrentUser() {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try { return JSON.parse(userStr); } catch { return null; }
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  async validateToken(token: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return !!token;
  },
};