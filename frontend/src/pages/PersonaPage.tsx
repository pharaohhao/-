import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { memoryService, eventService, observationService } from '../services/memory';
import BriefingCard from '../components/dashboard/BriefingCard';
import AIPersonaCard from '../components/dashboard/AIPersonaCard';
import Timeline from '../components/dashboard/Timeline';
import ChatWindow from '../components/chat/ChatWindow';

// ─── Quick Record Modal ─────────────────────────────────────────────────────

function QuickRecordModal({ type, personaId, onClose, onSaved }: {
  type: 'memory' | 'event' | 'observation';
  personaId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('hobby');
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventType, setEventType] = useState('other');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!content && type !== 'event') return;
    setSaving(true);
    try {
      if (type === 'memory') {
        await memoryService.create(personaId, {
          category,
          content,
          keywords: '',
          importance: 5,
        } as any);
      } else if (type === 'observation') {
        await observationService.create(personaId, {
          content,
          source_type: 'manual',
          confidence: 0.9,
        });
      } else if (type === 'event') {
        await eventService.create(personaId, {
          title,
          event_type: eventType,
          event_date: eventDate,
          is_recurring: false,
          importance: 5,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  const typeLabel = { memory: '记忆', event: '事件', observation: '观察' }[type];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-100 mb-4">添加{typeLabel}</h3>

        {type === 'memory' && (
          <>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-gray-800 text-gray-200 rounded-lg px-3 py-2 mb-3 text-sm outline-none"
            >
              <option value="hobby">兴趣</option>
              <option value="food">饮食</option>
              <option value="style">审美</option>
              <option value="personality">性格</option>
              <option value="relationship">关系</option>
              <option value="dream">愿望</option>
              <option value="dislike">禁忌</option>
              <option value="other">其他</option>
            </select>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="记忆内容..."
              className="w-full bg-gray-800 text-gray-200 rounded-lg px-3 py-2 mb-3 text-sm outline-none h-24 resize-none"
            />
          </>
        )}

        {type === 'event' && (
          <>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="事件标题"
              className="w-full bg-gray-800 text-gray-200 rounded-lg px-3 py-2 mb-2 text-sm outline-none"
            />
            <input
              type="date"
              value={eventDate}
              onChange={e => setEventDate(e.target.value)}
              className="w-full bg-gray-800 text-gray-200 rounded-lg px-3 py-2 mb-2 text-sm outline-none"
            />
            <select
              value={eventType}
              onChange={e => setEventType(e.target.value)}
              className="w-full bg-gray-800 text-gray-200 rounded-lg px-3 py-2 mb-3 text-sm outline-none"
            >
              <option value="birthday">生日</option>
              <option value="anniversary">纪念日</option>
              <option value="exam">考试</option>
              <option value="meeting">见面</option>
              <option value="other">其他</option>
            </select>
          </>
        )}

        {type === 'observation' && (
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="观察内容..."
            className="w-full bg-gray-800 text-gray-200 rounded-lg px-3 py-2 mb-3 text-sm outline-none h-24 resize-none"
          />
        )}

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50"
          >
            {saving ? '保存中' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Persona Page ──────────────────────────────────────────────────────────

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

  useEffect(() => {
    if (id) {
      selectPersona(id);
    }
    return () => {
      clearPersona();
    };
  }, [id, selectPersona, clearPersona]);

  if (loading && !currentPersona) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-sm text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!currentPersona) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-sm text-gray-500">未找到人物</div>
      </div>
    );
  }

  const refresh = () => {
    if (id) loadPersonaData(id);
  };

  const healthScore = insight?.health_score ?? 100;
  const healthColor = healthScore >= 70 ? 'bg-green-500' : healthScore >= 40 ? 'bg-amber-500' : 'bg-red-500';

  // Find latest interaction
  const lastDates = [
    ...memories.map(m => new Date(m.created_at || 0).getTime()),
    ...events.map(e => new Date(e.event_date || 0).getTime()),
  ].filter(t => !isNaN(t));
  const lastDate = lastDates.length > 0 ? new Date(Math.max(...lastDates)) : null;
  const daysAgo = lastDate ? Math.floor((Date.now() - lastDate.getTime()) / 86400000) : null;

  return (
    <div className="h-full flex flex-col">
      {/* ── Enhanced Persona Header ── */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center gap-4 mb-3">
          <span className="text-4xl">{currentPersona.avatar || '👤'}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-100">{currentPersona.name}</h1>
              <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
                {currentPersona.relation}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="text-gray-500">🧠 {memories.length} 记忆</span>
              <span className="text-gray-500">📅 {events.length} 事件</span>
              <span className="text-gray-500">👁️ {observations.length} 观察</span>
              {daysAgo !== null && (
                <span className="text-gray-600 text-xs">
                  最近更新: {daysAgo === 0 ? '今天' : daysAgo + '天前'}
                </span>
              )}
            </div>
            {/* Health bar */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-gray-500 text-xs">关系健康度</span>
              <div className="flex-1 max-w-[120px] h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${healthColor} rounded-full`}
                  style={{ width: `${healthScore}%` }}
                />
              </div>
              <span className={`text-xs font-mono ${healthScore >= 70 ? 'text-green-400' : healthScore >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                {healthScore}
              </span>
            </div>
          </div>
          {/* Quick action buttons */}
          <div className="flex gap-1.5">
            <button
              onClick={() => setShowQuickAdd('memory')}
              className="px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg text-xs hover:bg-blue-600/30 transition-colors"
            >
              + 记忆
            </button>
            <button
              onClick={() => setShowQuickAdd('event')}
              className="px-3 py-1.5 bg-amber-600/20 text-amber-400 rounded-lg text-xs hover:bg-amber-600/30 transition-colors"
            >
              + 事件
            </button>
            <button
              onClick={() => setShowQuickAdd('observation')}
              className="px-3 py-1.5 bg-purple-600/20 text-purple-400 rounded-lg text-xs hover:bg-purple-600/30 transition-colors"
            >
              + 观察
            </button>
            <button
              onClick={() => navigate(`/persona/${id}/story`)}
              className="px-3 py-1.5 bg-gray-800 text-gray-400 rounded-lg text-xs hover:bg-gray-700 transition-colors"
            >
              📖 故事
            </button>
            <button
              onClick={() => navigate(`/persona/${id}/capsule`)}
              className="px-3 py-1.5 bg-gray-800 text-gray-400 rounded-lg text-xs hover:bg-gray-700 transition-colors"
            >
              ⏳ 胶囊
            </button>
          </div>
        </div>
      </div>

      {/* ── Quick Record Modal ── */}
      {showQuickAdd && id && (
        <QuickRecordModal
          type={showQuickAdd}
          personaId={id}
          onClose={() => setShowQuickAdd(null)}
          onSaved={refresh}
        />
      )}

      {/* ── Briefing — always visible ── */}
      <div className="px-6 pt-4">
        <BriefingCard />
      </div>

      {/* ── Chat First — flex grow ── */}
      <div className="flex-1 px-6 py-4 min-h-0">
        <ChatWindow onMessageSent={refresh} />
      </div>

      {/* ── Below Chat — Timeline + AI Card ── */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <div className="lg:col-span-2">
            <Timeline />
          </div>
          <div>
            <AIPersonaCard />
          </div>
        </div>
      </div>
    </div>
  );
}
