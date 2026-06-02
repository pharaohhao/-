import api from './api';
import type { PersonaInsight } from '../types';

export const insightService = {
  async get(personaId: string): Promise<PersonaInsight> {
    const res = await api.get(`/personas/${personaId}/insights`);
    return res.data;
  },
  async generate(personaId: string): Promise<PersonaInsight> {
    const res = await api.post(`/personas/${personaId}/insights/generate`);
    return res.data;
  },
};
