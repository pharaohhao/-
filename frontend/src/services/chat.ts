import api from './api';

export const chatService = {
  async ask(personaId: string, message: string): Promise<{ reply: string; persona_name: string; sources: Array<{ content: string; source_type: string; recorded_at: string }>; memories_used: number }> {
    const res = await api.post('/chat', { persona_id: personaId, message });
    return res.data;
  },

  async *askStream(personaId: string, message: string): AsyncGenerator<string> {
    const response = await fetch('/api/v1/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ persona_id: personaId, message }),
    });
    const reader = response.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.chunk) yield parsed.chunk;
          } catch {
            // skip malformed SSE lines
          }
        }
      }
    }
  },
};
