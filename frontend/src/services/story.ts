import api from './api';

export interface StoryChapter {
  year: number;
  summary: string;
  highlights: string[];
}

export interface LifeStory {
  persona_name: string;
  persona_avatar: string;
  persona_relation: string;
  narrative: string;
  chapters: StoryChapter[];
  total_memories: number;
  total_events: number;
  total_observations?: number;
  timeline_span: string;
}

export const storyService = {
  async get(personaId: string): Promise<LifeStory> {
    const res = await api.get(`/personas/${personaId}/story`);
    return res.data;
  },
};
