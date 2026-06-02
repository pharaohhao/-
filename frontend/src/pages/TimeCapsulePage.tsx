import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../store';
import { snapshotService, type SnapshotData, type DiffData } from '../services/snapshot';

export default function TimeCapsulePage() {
  const { id } = useParams<{ id: string }>();
  const selectPersona = useStore((s) => s.selectPersona);
  const currentPersona = useStore((s) => s.currentPersona);
  const clearPersona = useStore((s) => s.clearPersona);

  // Select persona on mount
  useEffect(() => {
    if (id) {
      selectPersona(id);
    }
    return () => {
      clearPersona();
    };
  }, [id, selectPersona, clearPersona]);

  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [snapshot, setSnapshot] = useState<SnapshotData | null>(null);
  const [diff, setDiff] = useState<DiffData | null>(null);
  const [compareYear, setCompareYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'snapshot' | 'diff'>('snapshot');

  useEffect(() => {
    if (!currentPersona) return;
    snapshotService.getYears(currentPersona.id).then((y) => {
      setYears(y);
      if (y.length > 0) setSelectedYear(y[y.length - 1]);
    });
  }, [currentPersona]);

  const loadSnapshot = useCallback(async (year: number) => {
    if (!currentPersona) return;
    setLoading(true);
    try {
      const date = `${year}-12-31`;
      const snap = await snapshotService.get(currentPersona.id, date);
      setSnapshot(snap);
    } catch {
      setSnapshot(null);
    }
    setLoading(false);
  }, [currentPersona]);

  useEffect(() => {
    if (selectedYear) loadSnapshot(selectedYear);
  }, [selectedYear, loadSnapshot]);

  const loadDiff = useCallback(async () => {
    if (!currentPersona || !compareYear) return;
    setLoading(true);
    try {
      const from = `${Math.min(selectedYear, compareYear)}-12-31`;
      const to = `${Math.max(selectedYear, compareYear)}-12-31`;
      const d = await snapshotService.diff(currentPersona.id, from, to);
      setDiff(d);
    } catch {
      setDiff(null);
    }
    setLoading(false);
  }, [currentPersona, selectedYear, compareYear]);

  useEffect(() => {
    if (mode === 'diff' && compareYear) {
      loadDiff();
    } else if (mode === 'snapshot') {
      setDiff(null);
    }
  }, [mode, compareYear, loadDiff]);

  // Reset compare year when switching modes
  useEffect(() => {
    if (mode === 'snapshot') {
      setCompareYear(null);
      setDiff(null);
    }
  }, [mode]);

  const handleYearClick = (year: number) => {
    if (mode === 'diff') {
      if (compareYear === null && year !== selectedYear) {
        setCompareYear(year);
      } else {
        setSelectedYear(year);
        setCompareYear(null);
        setDiff(null);
      }
    } else {
      setSelectedYear(year);
    }
  };

  if (!currentPersona) {
    return (
      <div className="p-6 flex items-center justify-center h-full text-gray-400">
        加载中...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <span className="text-4xl">{currentPersona.avatar}</span>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">{currentPersona.name} · 时间胶囊</h1>
          <p className="text-gray-500 text-sm mt-1">回溯人物在不同时间点的状态</p>
        </div>
      </div>

      {/* Timeline Slider */}
      {years.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm">时间轴</span>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('snapshot')}
                className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                  mode === 'snapshot'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                快照
              </button>
              <button
                onClick={() => setMode('diff')}
                className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                  mode === 'diff'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                对比
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => handleYearClick(y)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  y === selectedYear
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : y === compareYear
                    ? 'bg-purple-600 text-white shadow-lg scale-105'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {y}
              </button>
            ))}
          </div>

          {mode === 'diff' && !compareYear && (
            <p className="text-gray-500 text-xs mt-3 text-center">点击第二个年份进行对比</p>
          )}
          {mode === 'diff' && compareYear && (
            <p className="text-purple-400 text-xs mt-3 text-center">
              对比 {Math.min(selectedYear, compareYear)} 年 → {Math.max(selectedYear, compareYear)} 年
            </p>
          )}
        </div>
      )}

      {loading && (
        <div className="text-center text-gray-400 py-8">加载中...</div>
      )}

      {/* Snapshot View */}
      {!loading && snapshot && mode === 'snapshot' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="记忆" value={snapshot.summary.total_memories} icon="🧠" />
            <StatCard label="事件" value={snapshot.summary.total_events} icon="📅" />
            <StatCard label="观察" value={snapshot.summary.total_observations} icon="👁️" />
          </div>

          {/* Interests */}
          <Section title="🎯 兴趣" items={snapshot.interests.map((i) => i.content)} color="blue" />

          {/* Concerns */}
          <Section title="💭 关注" items={snapshot.concerns.map((c) => c.content)} color="amber" />

          {/* Personality */}
          {snapshot.personality_traits.length > 0 && (
            <Section title="🌟 性格特征" items={snapshot.personality_traits.map((p) => p.content)} color="green" />
          )}

          {/* Important Events */}
          {snapshot.important_events.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-gray-200 font-medium mb-3">📅 重要事件</h3>
              <div className="space-y-2">
                {snapshot.important_events.map((e, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="text-gray-600 w-24 shrink-0">{e.event_date || '未知'}</span>
                    <span className="text-gray-300">{e.title}</span>
                    <span className="text-gray-600 text-xs bg-gray-800 px-2 py-0.5 rounded">{e.event_type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observations */}
          {snapshot.recent_observations.length > 0 && (
            <Section title="👁️ 近期观察" items={snapshot.recent_observations.map((o) => o.content)} color="blue" />
          )}

          {/* Empty state */}
          {snapshot.summary.total_memories === 0 &&
            snapshot.summary.total_events === 0 &&
            snapshot.summary.total_observations === 0 && (
              <div className="text-center py-12 text-gray-500">该时间点暂无数据</div>
            )}
        </div>
      )}

      {/* Diff View */}
      {!loading && diff && mode === 'diff' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <DiffSection title="🆕 新增兴趣" items={diff.changes.new_interests} color="green" />
            <DiffSection title="📉 兴趣消退" items={diff.changes.faded_interests} color="red" />
            <DiffSection title="🆕 新增关注" items={diff.changes.new_concerns} color="green" />
            <DiffSection title="📉 关注消退" items={diff.changes.faded_concerns} color="red" />
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-gray-200 font-medium mb-3">📊 数据变化</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">新增记忆: </span>
                <span className="text-green-400 font-medium">+{diff.changes.new_memory_count}</span>
              </div>
              <div>
                <span className="text-gray-500">新增事件: </span>
                <span className="text-green-400 font-medium">+{diff.changes.new_event_count}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No years data */}
      {years.length === 0 && !loading && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">暂无时间数据</p>
          <p className="text-sm mt-2">为人物添加记忆或事件后，时间轴将自动生成</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-gray-100">{value}</div>
      <div className="text-gray-500 text-xs">{label}</div>
    </div>
  );
}

function Section({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-900/30 text-blue-300 border-blue-800',
    amber: 'bg-amber-900/30 text-amber-300 border-amber-800',
    green: 'bg-green-900/30 text-green-300 border-green-800',
    red: 'bg-red-900/30 text-red-300 border-red-800',
  };
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-gray-200 font-medium mb-3">{title}</h3>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span
              key={i}
              className={`px-3 py-1 rounded-full text-xs border ${colorMap[color] || colorMap.blue}`}
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-sm">暂无</p>
      )}
    </div>
  );
}

function DiffSection({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: string;
}) {
  const colorMap: Record<string, string> = {
    green: 'bg-green-900/20 border-green-700 text-green-300',
    red: 'bg-red-900/20 border-red-700 text-red-300',
  };
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h4 className="text-gray-400 text-xs font-medium mb-2">{title}</h4>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <span key={i} className={`px-2 py-0.5 rounded text-xs border ${colorMap[color]}`}>
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-xs">无变化</p>
      )}
    </div>
  );
}
