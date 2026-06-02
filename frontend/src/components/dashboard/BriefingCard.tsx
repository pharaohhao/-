import { useMemo } from 'react';
import { useStore } from '../../store';

export default function BriefingCard() {
  const memories = useStore((s) => s.memories);
  const events = useStore((s) => s.events);
  const insight = useStore((s) => s.insight);
  const currentPersona = useStore((s) => s.currentPersona);

  const recentMemories = useMemo(() => {
    return [...memories].slice(-3).reverse();
  }, [memories]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => new Date(e.event_date) >= now)
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
      .slice(0, 3);
  }, [events]);

  const suggestedTopics = useMemo(() => {
    const topics: string[] = [];
    if (insight?.interests) {
      const interests = insight.interests.split(',').map((s) => s.trim()).filter(Boolean);
      topics.push(...interests.slice(0, 3));
    }
    if (topics.length === 0 && currentPersona?.interests) {
      const interests = currentPersona.interests.split(',').map((s) => s.trim()).filter(Boolean);
      topics.push(...interests.slice(0, 3));
    }
    return topics;
  }, [insight, currentPersona]);

  const hasData = memories.length > 0 || events.length > 0;
  const name = currentPersona?.name || '';

  function formatEventDate(iso: string): string {
    const d = new Date(iso);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  }

  // Template-based fallback for cold start
  if (!hasData) {
    return (
      <div className="bg-gray-900 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-200 mb-3">今日简报</h3>
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">还没有关于{name}的记录</p>
          <p className="text-gray-600 text-xs mt-2">
            试试在聊天框输入 "{name}喜欢..." 来添加第一条记忆
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-200 mb-4">今日简报</h3>

      <div className="space-y-4">
        {recentMemories.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 mb-2 font-medium">最近关注</div>
            <div className="space-y-1.5">
              {recentMemories.map((mem) => (
                <p key={mem.id} className="text-sm text-gray-400 pl-4 border-l border-gray-700 line-clamp-2">
                  {mem.content}
                </p>
              ))}
            </div>
          </div>
        )}

        {upcomingEvents.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 mb-2 font-medium">重要日期</div>
            <div className="space-y-1.5">
              {upcomingEvents.map((evt) => (
                <div key={evt.id} className="text-sm text-gray-400 pl-4 border-l border-amber-700/50">
                  <span className="text-amber-400/80">{formatEventDate(evt.event_date)}</span>
                  {' — '}{evt.title}
                </div>
              ))}
            </div>
          </div>
        )}

        {suggestedTopics.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 mb-2 font-medium">建议话题</div>
            <div className="flex flex-wrap gap-1.5">
              {suggestedTopics.map((topic) => (
                <span key={topic} className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
