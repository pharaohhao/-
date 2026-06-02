import api from './api';
import type { User } from '../types';

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export const authService = {
  async login(data: LoginData): Promise<void> {
    const res = await api.post('/auth/login', data);
    localStorage.setItem('token', res.data.access_token);
  },

  async register(data: RegisterData): Promise<User> {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  logout(): void {
    localStorage.removeItem('token');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};
