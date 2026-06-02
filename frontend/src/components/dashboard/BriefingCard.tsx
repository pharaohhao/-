import { useMemo } from 'react';
import { useStore } from '../../store';

export default function BriefingCard() {
  const memories = useStore((s) => s.memories);
  const events = useStore((s) => s.events);
  const insight = useStore((s) => s.insight);
  const currentPersona = useStore((s) => s.currentPersona);

  const recentMemories = useMemo(() => [...memories].slice(-3).reverse(), [memories]);
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events.filter(e => new Date(e.event_date) >= now).sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()).slice(0, 3);
  }, [events]);

  const suggestedTopics = useMemo(() => {
    const topics: string[] = [];
    if (insight?.interests) topics.push(...insight.interests.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3));
    if (topics.length === 0 && currentPersona?.interests) topics.push(...currentPersona.interests.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3));
    return topics;
  }, [insight, currentPersona]);

  const name = currentPersona?.name || '';
  const hasData = memories.length > 0 || events.length > 0;

  if (!hasData) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-5">
        <h3 className="text-sm font-semibold text-stone-700 mb-3">今日简报</h3>
        <div className="text-center py-4">
          <p className="text-stone-400 text-sm">还没有关于{name}的记录</p>
          <p className="text-stone-300 text-xs mt-2">试试在聊天框输入 "{name}喜欢..." 来添加第一条记忆</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-5">
      <h3 className="text-sm font-semibold text-stone-700 mb-4">今日简报</h3>
      <div className="space-y-4">
        {recentMemories.length > 0 && (
          <div>
            <div className="text-xs text-stone-400 mb-2 font-medium">最近关注</div>
            <div className="space-y-1.5">
              {recentMemories.map(mem => (
                <p key={mem.id} className="text-sm text-stone-500 pl-4 border-l border-stone-200">{mem.content}</p>
              ))}
            </div>
          </div>
        )}
        {upcomingEvents.length > 0 && (
          <div>
            <div className="text-xs text-stone-400 mb-2 font-medium">重要日期</div>
            <div className="space-y-1.5">
              {upcomingEvents.map(evt => (
                <div key={evt.id} className="text-sm text-stone-500 pl-4 border-l border-amber-200">
                  <span className="text-amber-600">{new Date(evt.event_date).toLocaleDateString('zh-CN')}</span>{' — '}{evt.title}
                </div>
              ))}
            </div>
          </div>
        )}
        {suggestedTopics.length > 0 && (
          <div>
            <div className="text-xs text-stone-400 mb-2 font-medium">建议话题</div>
            <div className="flex flex-wrap gap-1.5">
              {suggestedTopics.map(t => (
                <span key={t} className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs border border-amber-100">{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
