import api from './api';
import type { PersonaMemory, Observation, PersonaEvent } from '../types';

export const memoryService = {
  async list(personaId: string): Promise<PersonaMemory[]> {
    const res = await api.get(`/personas/${personaId}/memories`);
    return res.data;
  },
  async create(personaId: string, data: Partial<PersonaMemory>): Promise<PersonaMemory> {
    const res = await api.post(`/personas/${personaId}/memories`, data);
    return res.data;
  },
  async delete(personaId: string, memoryId: string): Promise<void> {
    await api.delete(`/personas/${personaId}/memories/${memoryId}`);
  },
};

export const eventService = {
  async list(personaId: string): Promise<PersonaEvent[]> {
    const res = await api.get(`/personas/${personaId}/events`);
    return res.data;
  },
  async create(personaId: string, data: Partial<PersonaEvent>): Promise<PersonaEvent> {
    const res = await api.post(`/personas/${personaId}/events`, data);
    return res.data;
  },
};

export const observationService = {
  async list(personaId: string): Promise<Observation[]> {
    const res = await api.get(`/personas/${personaId}/observations`);
    return res.data;
  },
  async create(personaId: string, data: Partial<Observation>): Promise<Observation> {
    const res = await api.post(`/personas/${personaId}/observations`, data);
    return res.data;
  },
};
