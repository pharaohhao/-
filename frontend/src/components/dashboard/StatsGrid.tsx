import { useStore } from '../../store';

export default function StatsGrid() {
  const memories = useStore((s) => s.memories);
  const events = useStore((s) => s.events);
  const observations = useStore((s) => s.observations);
  const insight = useStore((s) => s.insight);

  interface StatItem {
    label: string;
    value: string | number;
    color: string;
    borderColor: string;
    suffix?: string;
  }

  const stats: StatItem[] = [
    {
      label: '记忆数',
      value: memories.length,
      color: 'text-blue-400',
      borderColor: 'border-blue-500/30',
    },
    {
      label: '事件数',
      value: events.length,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/30',
    },
    {
      label: '观察数',
      value: observations.length,
      color: 'text-purple-400',
      borderColor: 'border-purple-500/30',
    },
    {
      label: '关系健康度',
      value: insight?.health_score != null ? insight.health_score : '--',
      color: 'text-green-400',
      borderColor: 'border-green-500/30',
      suffix: insight?.health_score != null ? '%' : '',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-gray-900 rounded-xl p-4"
        >
          <div className="text-xs text-gray-500 mb-1 font-medium tracking-wide">
            {stat.label}
          </div>
          <div className={`text-2xl font-bold ${stat.color}`}>
            {stat.value}{stat.suffix ?? ''}
          </div>
        </div>
      ))}
    </div>
  );
}
