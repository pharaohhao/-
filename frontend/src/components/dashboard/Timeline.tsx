import { useMemo } from 'react';
import { useStore } from '../../store';
import type { TimelineItem } from '../../services/timeline';

const typeConfig: Record<string, { dot: string; border: string; label: string }> = {
  memory: { dot: 'bg-blue-500 shadow-blue-500/30', border: 'border-blue-500/20', label: '记忆' },
  event: { dot: 'bg-amber-500 shadow-amber-500/30', border: 'border-amber-500/20', label: '事件' },
  observation: { dot: 'bg-purple-500 shadow-purple-500/30', border: 'border-purple-500/20', label: '观察' },
};

function TimelineItemRow({ item }: { item: TimelineItem }) {
  const cfg = typeConfig[item.type] || typeConfig.memory;
  const d = item.date ? new Date(item.date) : null;
  const ds = d ? `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日` : '';

  return (
    <div className="relative pl-10 pb-6 last:pb-0">
      <div className="absolute left-[15px] top-2 bottom-0 w-px bg-slate-800 last:hidden" />
      <div className={`absolute left-[9px] top-2 w-3.5 h-3.5 rounded-full ${cfg.dot} shadow-lg border-2 border-slate-900`} />
      <div className={`rounded-xl border ${cfg.border} bg-slate-800/30 p-3`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${
            item.type === 'memory' ? 'bg-blue-500/10 text-blue-400' :
            item.type === 'event' ? 'bg-amber-500/10 text-amber-400' : 'bg-purple-500/10 text-purple-400'
          }`}>{cfg.label}</span>
          {ds && <span className="text-slate-600 text-xs">{ds}</span>}
        </div>
        <p className="text-sm text-slate-300">{item.type === 'event' ? item.title : item.content}</p>
        {item.type === 'event' && item.description && <p className="text-xs text-slate-500 mt-1">{item.description}</p>}
      </div>
    </div>
  );
}

export default function Timeline() {
  const timeline = useStore(s => s.timeline);

  const grouped = useMemo(() => {
    const groups: Record<number, TimelineItem[]> = {};
    for (const item of timeline) {
      if (!item.date) continue;
      const year = new Date(item.date).getFullYear();
      if (!groups[year]) groups[year] = [];
      groups[year].push(item);
    }
    return Object.entries(groups).sort(([a], [b]) => Number(b) - Number(a));
  }, [timeline]);

  if (timeline.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-lg p-6 text-center">
        <p className="text-slate-500 text-sm">时间线为空</p>
        <p className="text-slate-600 text-xs mt-1">添加记忆或事件后会自动生成</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-lg p-6">
      <h3 className="text-sm font-semibold text-slate-200 mb-6">时间线</h3>
      {grouped.map(([year, items]) => (
        <div key={year} className="mb-6 last:mb-0">
          <div className="text-lg font-bold text-slate-400 mb-3">{year}</div>
          <div className="ml-1">
            {items.map((item, i) => <TimelineItemRow key={item.id || i} item={item} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
