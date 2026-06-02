import api from './api';

export interface TimelineItem {
  type: 'memory' | 'event' | 'observation';
  id: string;
  date: string;
  category?: string;
  content?: string;
  title?: string;
  description?: string;
  event_type?: string;
  confidence?: number;
}

export const timelineService = {
  async get(personaId: string, limit: number = 30): Promise<TimelineItem[]> {
    const res = await api.get(`/personas/${personaId}/timeline`, { params: { limit } });
    return res.data;
  },
};
