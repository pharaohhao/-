import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import { chatService } from '../../services/chat';

interface ChatMessage { role: 'user' | 'assistant'; content: string; }

export default function ChatWindow({ onMessageSent }: { onMessageSent?: () => void }) {
  const currentPersona = useStore(s => s.currentPersona);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { setMessages([]); setError(null); }, [currentPersona?.id]);

  const send = async () => {
    const text = input.trim();
    if (!text || !currentPersona || streaming) return;
    setInput(''); setError(null);
    setMessages(p => [...p, { role: 'user', content: text }, { role: 'assistant', content: '' }]);
    setStreaming(true);
    try {
      let acc = '';
      for await (const chunk of chatService.askStream(currentPersona.id, text)) {
        acc += chunk;
        setMessages(p => { const u = [...p]; u[u.length - 1] = { role: 'assistant', content: acc }; return u; });
      }
      onMessageSent?.();
    } catch (err: any) {
      setError(err?.message || '发送失败');
      setMessages(p => p.slice(0, -1));
    } finally { setStreaming(false); }
  };

  if (!currentPersona) return null;

  const chips = [
    `${currentPersona.name}喜欢什么花`,
    `${currentPersona.name}生日是什么时候`,
    `${currentPersona.name}最近在关注什么`,
    `${currentPersona.name}退休后喜欢做什么`,
  ];

  const hasMessages = messages.length > 0;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-sm flex flex-col" style={{ height: '700px' }}>
      {/* Header */}
      <div className="px-5 py-3 border-b border-stone-100 flex items-center gap-2 shrink-0">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-sm text-stone-500">正在和 <span className="font-medium text-stone-700">{currentPersona.name}</span> 对话</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {!hasMessages && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-5xl mb-4">{currentPersona.avatar || '👤'}</div>
            <h3 className="text-lg font-medium text-stone-600 mb-2">开始认识 {currentPersona.name}</h3>
            <p className="text-stone-400 text-sm mb-6">点击下方话题或直接输入，系统会自动提取记忆</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {chips.map(c => (
                <button key={c} onClick={() => { setInput(c); inputRef.current?.focus(); }}
                  className="px-3 py-2 bg-stone-50 hover:bg-amber-50 text-stone-500 hover:text-amber-700 rounded-xl text-xs transition-colors border border-stone-200 hover:border-amber-200">
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-amber-50 text-stone-700 border border-amber-100'
                : 'bg-stone-50 text-stone-600 border border-stone-100'
            }`}>
              {m.content || (streaming && i === messages.length - 1
                ? <span className="flex gap-1"><span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" /><span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:150ms]" /><span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:300ms]" /></span>
                : null)}
            </div>
          </div>
        ))}

        {error && <div className="text-xs text-rose-500 text-center py-2">{error}</div>}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-stone-100 shrink-0">
        <div className="flex items-center gap-2">
          <input ref={inputRef} type="text" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={`和 ${currentPersona.name} 说点什么...`}
            disabled={streaming}
            className="flex-1 bg-stone-50 text-stone-700 rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-stone-400 border border-stone-200 focus:border-amber-300 disabled:opacity-50 transition-colors" />
          <button onClick={send} disabled={!input.trim() || streaming}
            className="px-4 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-400 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed">
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
