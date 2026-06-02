import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import { chatService } from '../../services/chat';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWindow() {
  const currentPersona = useStore((s) => s.currentPersona);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset chat when persona changes
  useEffect(() => {
    setMessages([]);
    setError(null);
  }, [currentPersona?.id]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !currentPersona || isStreaming) return;

    setInput('');
    setError(null);

    // Add user message
    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);

    // Add empty assistant message for streaming
    const assistantMsg: ChatMessage = { role: 'assistant', content: '' };
    setMessages((prev) => [...prev, assistantMsg]);
    setIsStreaming(true);

    try {
      let accumulated = '';
      for await (const chunk of chatService.askStream(currentPersona.id, text)) {
        accumulated += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: accumulated };
          return updated;
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '发送失败，请重试';
      setError(errorMessage);
      // Remove the empty assistant message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!currentPersona) {
    return null;
  }

  return (
    <div className="bg-gray-900 rounded-xl flex flex-col h-[500px]">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-800 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-sm text-gray-300">
          正在和 <span className="font-medium text-gray-200">{currentPersona.name}</span> 对话...
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-8">
            开始和 {currentPersona.name} 对话吧
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-500/20 text-gray-200'
                  : 'bg-gray-800 text-gray-300'
              }`}
            >
              {msg.content || (isStreaming && idx === messages.length - 1 ? (
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              ) : null)}
            </div>
          </div>
        ))}

        {error && (
          <div className="text-xs text-red-400 text-center py-2">{error}</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            disabled={isStreaming}
            className="flex-1 bg-gray-800 text-gray-200 rounded-lg px-4 py-2 text-sm outline-none placeholder-gray-500 focus:ring-1 focus:ring-gray-700 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
