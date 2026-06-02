import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { memoryService, eventService, observationService } from '../services/memory';
import BriefingCard from '../components/dashboard/BriefingCard';
import AIPersonaCard from '../components/dashboard/AIPersonaCard';
import Timeline from '../components/dashboard/Timeline';
import ChatWindow from '../components/chat/ChatWindow';

function QuickRecordModal({ type, personaId, onClose, onSaved }: {
  type: 'memory' | 'event' | 'observation'; personaId: string; onClose: () => void; onSaved: () => void;
}) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('hobby');
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventType, setEventType] = useState('other');
  const [saving, setSaving] = useState(false);
  const label = { memory: '记忆', event: '事件', observation: '观察' }[type];

  const save = async () => {
    if ((type !== 'event' && !content.trim()) || (type === 'event' && (!title.trim() || !eventDate))) return;
    setSaving(true);
    try {
      if (type === 'memory') await memoryService.create(personaId, { category, content: content.trim(), keywords: '', importance: 5 } as any);
      else if (type === 'observation') await observationService.create(personaId, { content: content.trim(), source_type: 'manual', confidence: 0.9 });
      else if (type === 'event') await eventService.create(personaId, { title, event_type: eventType, event_date: eventDate, is_recurring: false, importance: 5 } as any);
      onSaved(); onClose();
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-slate-100 mb-4">快速添加{label}</h3>
        {type === 'memory' && (<>
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-800 text-slate-200 rounded-xl px-3 py-2 mb-3 text-sm outline-none border border-slate-700">
            {['hobby:兴趣','food:饮食','style:审美','personality:性格','relationship:关系','dream:愿望','dislike:禁忌','other:其他'].map(o => {
              const [v, l] = o.split(':'); return <option key={v} value={v}>{l}</option>;
            })}
          </select>
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="记忆内容..." className="w-full bg-slate-800 text-slate-200 rounded-xl px-3 py-2 mb-3 text-sm outline-none border border-slate-700 h-24 resize-none" />
        </>)}
        {type === 'event' && (<>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="事件标题" className="w-full bg-slate-800 text-slate-200 rounded-xl px-3 py-2 mb-2 text-sm outline-none border border-slate-700" />
          <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="w-full bg-slate-800 text-slate-200 rounded-xl px-3 py-2 mb-2 text-sm outline-none border border-slate-700" />
          <select value={eventType} onChange={e => setEventType(e.target.value)} className="w-full bg-slate-800 text-slate-200 rounded-xl px-3 py-2 mb-3 text-sm outline-none border border-slate-700">
            {['other:其他','birthday:生日','anniversary:纪念日','exam:考试','meeting:见面'].map(o => {
              const [v, l] = o.split(':'); return <option key={v} value={v}>{l}</option>;
            })}
          </select>
        </>)}
        {type === 'observation' && (
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="观察到什么..." className="w-full bg-slate-800 text-slate-200 rounded-xl px-3 py-2 mb-3 text-sm outline-none border border-slate-700 h-24 resize-none" />
        )}
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700 transition-colors">取消</button>
          <button onClick={save} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-500 disabled:opacity-50 transition-colors">{saving ? '...' : '保存'}</button>
        </div>
      </div>
    </div>
  );
}

export default function PersonaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const selectPersona = useStore(s => s.selectPersona);
  const clearPersona = useStore(s => s.clearPersona);
  const loadPersonaData = useStore(s => s.loadPersonaData);
  const loading = useStore(s => s.loading);
  const currentPersona = useStore(s => s.currentPersona);
  const memories = useStore(s => s.memories);
  const events = useStore(s => s.events);
  const observations = useStore(s => s.observations);
  const insight = useStore(s => s.insight);
  const [showQuickAdd, setShowQuickAdd] = useState<'memory' | 'event' | 'observation' | null>(null);

  useEffect(() => { if (id) selectPersona(id); return () => clearPersona(); }, [id]);
  const refresh = () => { if (id) loadPersonaData(id); };

  if (loading && !currentPersona) return <div className="flex items-center justify-center h-full text-slate-400">加载中...</div>;
  if (!currentPersona) return <div className="flex items-center justify-center h-full text-slate-400">未找到人物信息</div>;

  const healthScore = insight?.health_score ?? 100;
  const lastTs = Math.max(0, ...[...memories, ...events].map((x: any) => new Date(x.created_at || x.event_date || 0).getTime()));
  const daysAgo = lastTs ? Math.floor((Date.now() - lastTs) / 86400000) : null;

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      {/* ═══ Persona Header ═══ */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-lg p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl shadow-inner">
              {currentPersona.avatar || '👤'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-50">{currentPersona.name}</h1>
              <p className="text-slate-400 text-sm mt-0.5">
                {currentPersona.relation}{daysAgo !== null ? ` · 最近更新：${daysAgo === 0 ? '今天' : daysAgo + '天前'}` : ''}
              </p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {(['memory', 'event', 'observation'] as const).map(t => (
              <button key={t} onClick={() => setShowQuickAdd(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  t === 'memory' ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' :
                  t === 'event' ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' :
                  'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
                }`}>+ {t === 'memory' ? '记忆' : t === 'event' ? '事件' : '观察'}</button>
            ))}
            <button onClick={() => navigate(`/persona/${id}/story`)} className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-xl text-xs hover:bg-slate-700 transition-colors">📖</button>
            <button onClick={() => navigate(`/persona/${id}/capsule`)} className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-xl text-xs hover:bg-slate-700 transition-colors">⏳</button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6">
          {[
            { label: '记忆', value: memories.length, color: 'text-blue-400', icon: '🧠' },
            { label: '事件', value: events.length, color: 'text-amber-400', icon: '📅' },
            { label: '观察', value: observations.length, color: 'text-purple-400', icon: '👁️' },
            { label: '健康度', value: `${healthScore}%`, color: healthScore >= 70 ? 'text-emerald-400' : healthScore >= 40 ? 'text-amber-400' : 'text-rose-400', icon: '💚' },
          ].map(s => (
            <div key={s.label} className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-800">
              <div className="text-lg mb-1">{s.icon}</div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {showQuickAdd && id && <QuickRecordModal type={showQuickAdd} personaId={id} onClose={() => setShowQuickAdd(null)} onSaved={refresh} />}

      {/* ═══ Briefing ═══ */}
      <BriefingCard />

      {/* ═══ Chat (8) + AI Card (4) ═══ */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <ChatWindow onMessageSent={refresh} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <AIPersonaCard />
        </div>
      </div>

      {/* ═══ Timeline ═══ */}
      <Timeline />
    </div>
  );
}
