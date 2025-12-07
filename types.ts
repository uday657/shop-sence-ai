export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  matchReason?: string; // Why Gemini recommended this
  imageUrl?: string;
}

export interface UserProfile {
  name: string;
  email: string;
}

export enum AppScreen {
  LOGIN = 'LOGIN',
  PERMISSIONS = 'PERMISSIONS',
  DASHBOARD = 'DASHBOARD',
}

export interface SimulatedUserData {
  recentMessages: string[];
  contactInterests: string[];
}
