import api from './api';

export interface ActionItem {
  persona_name: string;
  persona_avatar: string;
  action_id: string;
  action_type: 'contact' | 'gift' | 'event_prep' | 'check_in';
  suggestion: string;
  reason: string;
  priority: number;
}

export const actionsService = {
  async list(personaId?: string): Promise<ActionItem[]> {
    const res = await api.get('/actions', { params: personaId ? { persona_id: personaId } : {} });
    return res.data;
  },
  async generate(personaId?: string): Promise<ActionItem[]> {
    const res = await api.post('/actions/generate', null, { params: personaId ? { persona_id: personaId } : {} });
    return res.data;
  },
  async complete(actionId: string): Promise<void> {
    await api.post(`/actions/${actionId}/complete`);
  },
};
