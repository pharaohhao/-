export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Persona {
  id: string;
  user_id: string;
  name: string;
  avatar: string;
  relation: string;
  birthdate: string | null;
  description: string;
  personality: string;
  interests: string;
  gift_ideas: string;
}

export interface PersonaMemory {
  id: string;
  persona_id: string;
  category: string;
  content: string;
  keywords: string;
  importance: number;
}

export interface Relationship {
  id: string;
  source_persona_id: string;
  target_persona_id: string;
  relationship_type: string;
  strength_score: number;
}

export interface PersonaEvent {
  id: string;
  persona_id: string;
  title: string;
  description: string;
  event_type: string;
  event_date: string;
  is_recurring: boolean;
  importance: number;
}

export interface Observation {
  id: string;
  persona_id: string;
  content: string;
  source_type: string;
  confidence: number;
}

export interface PersonaInsight {
  id: string;
  persona_id: string;
  summary: string;
  personality: string;
  interests: string;
  gift_suggestions: string;
  health_score: number;
}

export interface ChatSession {
  id: string;
  user_id: string;
  persona_id: string | null;
  title: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  intent: string | null;
}
