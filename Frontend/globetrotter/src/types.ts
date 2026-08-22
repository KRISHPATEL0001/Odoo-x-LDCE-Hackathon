export interface UserProfile {
  name: string;
  email: string;
  password?: string;
  avatarUrl: string | null;
  bio?: string;
  homeCity?: string;
  travelStyle?: string;
  createdAt: string;
}

export type AuthMode = 'signup' | 'login';
