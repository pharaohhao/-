import api from './api';
import type { Persona } from '../types';

export const personaService = {
  async list(): Promise<Persona[]> {
    const res = await api.get('/personas');
    return res.data;
  },
  async get(id: string): Promise<Persona> {
    const res = await api.get(`/personas/${id}`);
    return res.data;
  },
  async create(data: Partial<Persona>): Promise<Persona> {
    const res = await api.post('/personas', data);
    return res.data;
  },
  async update(id: string, data: Partial<Persona>): Promise<Persona> {
    const res = await api.put(`/personas/${id}`, data);
    return res.data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/personas/${id}`);
  },
};
