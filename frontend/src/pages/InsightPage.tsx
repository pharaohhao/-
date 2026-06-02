import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { insightDashboardService, type DashboardData, type PersonaInsightSummary } from '../services/insight_dashboard';

function HealthBar({ score }: { score: number }) {
  const color = score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-sm font-mono font-medium ${score >= 70 ? 'text-green-400' : score >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
        {score}
      </span>
    </div>
  );
}

function TrendBadge({ change }: { change: number }) {
  const isUp = change > 0;
  const isNeutral = change === 0;
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded ${isUp ? 'bg-green-900/40 text-green-400' : isNeutral ? 'bg-gray-800 text-gray-400' : 'bg-red-900/40 text-red-400'}`}>
      {isUp ? '↑' : isNeutral ? '→' : '↓'} {Math.abs(change)}%
    </span>
  );
}

function PersonaInsightCard({ p }: { p: PersonaInsightSummary }) {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/persona/${p.persona_id}`)}>
          <span className="text-3xl">{p.persona_avatar}</span>
          <div>
            <h3 className="text-gray-100 font-medium">{p.persona_name}</h3>
            <span className="text-gray-500 text-xs">{p.persona_relation}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-gray-500 text-xs">{p.memory_count} 条记忆</span>
        </div>
      </div>

      {/* Health Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-gray-500 text-xs">关系健康度</span>
        </div>
        <HealthBar score={p.health_score} />
      </div>

      {/* Last interaction */}
      {p.days_since_last_interaction !== null && (
        <div className="mb-4">
          {p.days_since_last_interaction > 30 ? (
            <div className="flex items-center gap-2 text-sm bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
              <span>{'⚠️'}</span>
              <span className="text-red-300">已 {p.days_since_last_interaction} 天未互动</span>
            </div>
          ) : p.days_since_last_interaction > 14 ? (
            <div className="flex items-center gap-2 text-sm bg-amber-900/20 border border-amber-800 rounded-lg px-3 py-2">
              <span>{'📌'}</span>
              <span className="text-amber-300">最近互动 {p.days_since_last_interaction} 天前</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{'🞢'}</span>
              <span>最近互动 {p.days_since_last_interaction} 天前</span>
            </div>
          )}
        </div>
      )}

      {/* Interest Trends */}
      {p.interest_trends && p.interest_trends.trends.length > 0 && (
        <div className="mb-3">
          <span className="text-gray-500 text-xs block mb-2">兴趣趋势</span>
          <div className="flex flex-wrap gap-2">
            {p.interest_trends.trends.slice(0, 4).map((t, i) => (
              <span key={i} className="flex items-center gap-1 text-xs bg-gray-800 rounded-full px-3 py-1">
                <span className="text-gray-300">{t.label}</span>
                <TrendBadge change={t.change_pct} />
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Gift Suggestions */}
      {p.gift_suggestions && p.gift_suggestions !== "暂无推荐" && (
        <div className="border-t border-gray-800 pt-3 mt-3">
          <span className="text-gray-500 text-xs">{'🎁'} {p.gift_suggestions}</span>
        </div>
      )}
    </div>
  );
}

export default function InsightPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const loadData = () => {
    setLoading(true);
    insightDashboardService.get().then((d) => {
      setData(d);
      setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, []);

  const handleAnalyzeAll = async () => {
    if (!data) return;
    setAnalyzing(true);
    for (const p of data.personas) {
      await insightDashboardService.analyze(p.persona_id);
    }
    setAnalyzing(false);
    loadData();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full text-gray-400">加载洞察数据...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">洞察面板</h1>
          <p className="text-gray-500 text-sm mt-1">基于历史数据自动生成的关系洞察</p>
        </div>
        <button
          onClick={handleAnalyzeAll}
          disabled={analyzing}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm text-white transition-colors"
        >
          {analyzing ? '分析中...' : '🔄 刷新分析'}
        </button>
      </div>

      {data && data.personas.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">暂无人物数据</p>
          <p className="text-sm mt-2">创建人物并添加记忆后，洞察将自动生成</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.personas.map((p) => (
            <PersonaInsightCard key={p.persona_id} p={p} />
          ))}
        </div>
      )}

      {data && (
        <p className="text-gray-600 text-xs text-center mt-8">
          生成时间: {new Date(data.generated_at).toLocaleString('zh-CN')}
        </p>
      )}
    </div>
  );
}
