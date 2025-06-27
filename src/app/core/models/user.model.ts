export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  isVerified: boolean;
  currency: string;
  avatar?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  currency: string;
  notifications: {
    budgetAlerts: boolean;
    monthlyReports: boolean;
    expenseReminders: boolean;
  };
  language: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}