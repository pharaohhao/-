import { create } from 'zustand';
import type { Persona, PersonaMemory, PersonaEvent, Observation, PersonaInsight } from '../types';
import type { TimelineItem } from '../services/timeline';
import { personaService } from '../services/persona';
import { memoryService, eventService, observationService } from '../services/memory';
import { insightService } from '../services/insight';
import { timelineService } from '../services/timeline';

interface AppState {
  // Persona
  personas: Persona[];
  currentPersona: Persona | null;
  loading: boolean;

  // Persona data
  memories: PersonaMemory[];
  events: PersonaEvent[];
  observations: Observation[];
  insight: PersonaInsight | null;
  timeline: TimelineItem[];

  // Actions
  loadPersonas: () => Promise<void>;
  selectPersona: (id: string) => Promise<void>;
  loadPersonaData: (id: string) => Promise<void>;
  generateInsight: () => Promise<void>;
  clearPersona: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  personas: [],
  currentPersona: null,
  loading: false,
  memories: [],
  events: [],
  observations: [],
  insight: null,
  timeline: [],

  loadPersonas: async () => {
    set({ loading: true });
    const personas = await personaService.list();
    set({ personas, loading: false });
  },

  selectPersona: async (id: string) => {
    set({ loading: true });
    const persona = await personaService.get(id);
    set({ currentPersona: persona });
    await get().loadPersonaData(id);
  },

  loadPersonaData: async (id: string) => {
    try {
      const [memories, events, observations, insight, timeline] = await Promise.all([
        memoryService.list(id),
        eventService.list(id),
        observationService.list(id),
        insightService.get(id).catch(() => null),
        timelineService.get(id),
      ]);
      set({ memories, events, observations, insight, timeline, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  generateInsight: async () => {
    const persona = get().currentPersona;
    if (!persona) return;
    const insight = await insightService.generate(persona.id);
    set({ insight });
  },

  clearPersona: () => {
    set({
      currentPersona: null,
      memories: [],
      events: [],
      observations: [],
      insight: null,
      timeline: [],
    });
  },
}));
