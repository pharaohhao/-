import api from './api';

export interface PersonaInsightSummary {
  persona_id: string;
  persona_name: string;
  persona_avatar: string;
  persona_relation: string;
  health_score: number;
  memory_count: number;
  days_since_last_interaction: number | null;
  interest_trends: {
    periods: string[];
    trends: Array<{ category: string; label: string; change_pct: number; current: number; previous: number }>;
  } | null;
  gift_suggestions: string;
}

export interface DashboardData {
  personas: PersonaInsightSummary[];
  generated_at: string;
}

export const insightDashboardService = {
  async get(): Promise<DashboardData> {
    const res = await api.get('/insights/dashboard');
    return res.data;
  },
  async analyze(personaId: string): Promise<void> {
    await api.post(`/personas/${personaId}/insights/analyze`);
  },
};
