import api from './api';

export interface SnapshotData {
  persona_id: string;
  persona_name: string;
  persona_avatar: string;
  snapshot_date: string;
  summary: { total_memories: number; total_events: number; total_observations: number };
  interests: Array<{ content: string; category: string; recorded_at: string | null }>;
  concerns: Array<{ content: string; category: string; recorded_at: string | null }>;
  personality_traits: Array<{ content: string; category: string; recorded_at: string | null }>;
  important_events: Array<{ title: string; event_type: string; event_date: string | null; description: string }>;
  recent_observations: Array<{ content: string; confidence: number; recorded_at: string | null }>;
  data_range: { earliest: string | null; latest: string | null };
}

export interface DiffData {
  persona_name: string;
  from_date: string;
  to_date: string;
  from_snapshot: SnapshotData;
  to_snapshot: SnapshotData;
  changes: {
    new_interests: string[];
    faded_interests: string[];
    new_concerns: string[];
    faded_concerns: string[];
    new_events: string[];
    new_memory_count: number;
    new_event_count: number;
  };
}

export const snapshotService = {
  async get(personaId: string, date: string): Promise<SnapshotData> {
    const res = await api.get(`/personas/${personaId}/snapshot`, { params: { date } });
    return res.data;
  },

  async getYears(personaId: string): Promise<number[]> {
    const res = await api.get(`/personas/${personaId}/snapshot/years`);
    return res.data.years;
  },

  async diff(personaId: string, from: string, to: string): Promise<DiffData> {
    const res = await api.get(`/personas/${personaId}/snapshot/diff`, { params: { from, to } });
    return res.data;
  },
};
