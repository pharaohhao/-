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

    // Extract from insight interests
    if (insight?.interests) {
      const interests = insight.interests
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      topics.push(...interests.slice(0, 3));
    }

    // Fallback to currentPersona interests
    if (topics.length === 0 && currentPersona?.interests) {
      const interests = currentPersona.interests
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      topics.push(...interests.slice(0, 3));
    }

    return topics;
  }, [insight, currentPersona]);

  const hasData = memories.length > 0 || events.length > 0;

  if (!hasData) {
    return (
      <div className="bg-gray-900 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-200 mb-3">今日简报</h3>
        <div className="text-sm text-gray-500 text-center py-6">
          暂无数据，添加记忆和事件后将自动生成简报
        </div>
      </div>
    );
  }

  function formatEventDate(iso: string): string {
    const d = new Date(iso);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  }

  return (
    <div className="bg-gray-900 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-200 mb-4">今日简报</h3>

      <div className="space-y-4">
        {/* Recent memories */}
        {recentMemories.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 mb-2 font-medium flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              最近关注
            </div>
            <div className="space-y-1.5">
              {recentMemories.map((mem) => (
                <p key={mem.id} className="text-sm text-gray-400 pl-4 border-l border-gray-700 line-clamp-2">
                  {mem.content}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming events */}
        {upcomingEvents.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 mb-2 font-medium flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              重要日期
            </div>
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

        {/* Suggested topics */}
        {suggestedTopics.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 mb-2 font-medium flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              建议话题
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suggestedTopics.map((topic) => (
                <span
                  key={topic}
                  className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs"
                >
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
