import { useMemo } from 'react';
import { useStore } from '../../store';
import type { TimelineItem } from '../../services/timeline';

function formatDate(iso: string): string {
  const d = new Date(iso);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${month}月${day}日`;
}

function getTypeConfig(type: TimelineItem['type']) {
  switch (type) {
    case 'memory':
      return { label: '记忆', dotColor: 'bg-blue-500', bgColor: 'bg-blue-500/10', textColor: 'text-blue-400' };
    case 'event':
      return { label: '事件', dotColor: 'bg-amber-500', bgColor: 'bg-amber-500/10', textColor: 'text-amber-400' };
    case 'observation':
      return { label: '观察', dotColor: 'bg-purple-500', bgColor: 'bg-purple-500/10', textColor: 'text-purple-400' };
  }
}

function groupByMonth(items: TimelineItem[]): Map<string, TimelineItem[]> {
  const groups = new Map<string, TimelineItem[]>();

  for (const item of items) {
    const d = new Date(item.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  }

  return groups;
}

function getMonthLabel(key: string): string {
  const [year, month] = key.split('-');
  return `${year}年${parseInt(month, 10)}月`;
}

export default function Timeline() {
  const timeline = useStore((s) => s.timeline);
  const loading = useStore((s) => s.loading);

  const grouped = useMemo(() => {
    // Sort newest first, then group by month
    const sorted = [...timeline].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return groupByMonth(sorted);
  }, [timeline]);

  const monthKeys = useMemo(() => {
    return Array.from(grouped.keys()).sort().reverse();
  }, [grouped]);

  if (loading && timeline.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-200 mb-4">时间线</h3>
        <div className="text-sm text-gray-500 text-center py-8">加载中...</div>
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-200 mb-4">时间线</h3>
        <div className="text-sm text-gray-500 text-center py-8">
          暂无时间线数据，添加记忆或事件后将会显示在这里
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-200 mb-4">时间线</h3>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-800 rounded-full" />

        {monthKeys.map((monthKey) => {
          const items = grouped.get(monthKey)!;
          return (
            <div key={monthKey} className="mb-6 last:mb-0">
              {/* Month header */}
              <div className="text-xs font-medium text-gray-500 mb-3 sticky top-0 bg-gray-900 py-1 z-10">
                {getMonthLabel(monthKey)}
              </div>

              {/* Items */}
              <div className="space-y-4">
                {items.map((item) => {
                  const config = getTypeConfig(item.type);
                  const displayContent = item.content || item.title || item.description || '';
                  return (
                    <div key={`${item.type}-${item.id}`} className="flex gap-3 relative">
                      {/* Dot */}
                      <div className="flex-shrink-0 relative z-10 mt-0.5">
                        <div className={`w-[22px] h-[22px] rounded-full ${config.dotColor} border-[3px] border-gray-900 flex items-center justify-center`}>
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-900" />
                        </div>
                      </div>

                      {/* Content card */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">{formatDate(item.date)}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${config.bgColor} ${config.textColor}`}>
                            {config.label}
                          </span>
                        </div>
                        <div className="text-sm text-gray-300 leading-relaxed">
                          {displayContent}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
