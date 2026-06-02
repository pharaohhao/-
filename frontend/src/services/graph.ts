import api from './api';

export interface GraphNode {
  id: string;
  name: string;
  avatar: string;
  relation: string;
  memory_count: number;
  event_count: number;
  last_interaction: string | null;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  strength: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const graphService = {
  async get(): Promise<GraphData> {
    const res = await api.get('/graph');
    return res.data;
  },
};
