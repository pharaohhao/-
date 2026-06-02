import { useStore } from '../../store';

export default function AIPersonaCard() {
  const insight = useStore(s => s.insight);
  const memories = useStore(s => s.memories);
  const events = useStore(s => s.events);
  const generateInsight = useStore(s => s.generateInsight);
  const loading = useStore(s => s.loading);

  const hasContent = insight?.personality || insight?.interests || insight?.gift_suggestions;
  const checks = [
    { done: memories.length >= 1, label: '兴趣信息' },
    { done: memories.length >= 3, label: '足够记忆' },
    { done: events.length >= 1, label: '重要事件' },
    { done: hasContent, label: 'AI 画像' },
  ];
  const pct = Math.round((checks.filter(c => c.done).length / checks.length) * 100);

  if (hasContent && insight) {
    const interests = (insight.interests || '').split(',').map(s => s.trim()).filter(Boolean);
    const gifts = (insight.gift_suggestions || '').split(',').map(s => s.trim()).filter(Boolean);

    return (
      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-stone-700">AI 人物画像</h3>
          <button onClick={generateInsight} disabled={loading} className="text-xs text-stone-400 hover:text-stone-600 transition-colors disabled:opacity-50">刷新</button>
        </div>
        {insight.summary && <p className="text-sm text-stone-500 mb-4 leading-relaxed">{insight.summary}</p>}
        {insight.personality && (
          <div className="mb-3">
            <div className="text-xs text-stone-400 mb-1 font-medium">性格特征</div>
            <p className="text-sm text-stone-600">{insight.personality}</p>
          </div>
        )}
        {interests.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-stone-400 mb-2 font-medium">兴趣爱好</div>
            <div className="flex flex-wrap gap-1.5">
              {interests.map(i => <span key={i} className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs border border-amber-100">{i}</span>)}
            </div>
          </div>
        )}
        {gifts.length > 0 && (
          <div>
            <div className="text-xs text-stone-400 mb-1.5 font-medium">礼物建议</div>
            <ul className="space-y-1">
              {gifts.map(g => <li key={g} className="text-sm text-stone-500 flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-amber-400" />{g}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-5">
      <h3 className="text-sm font-semibold text-stone-700 mb-4">AI 人物画像</h3>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-stone-400">收集进度</span>
          <span className="text-xs text-stone-500 font-mono">{pct}%</span>
        </div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <ul className="space-y-2 mb-4">
        {checks.map(c => (
          <li key={c.label} className="flex items-center gap-2 text-sm">
            <span className={c.done ? 'text-emerald-500' : 'text-stone-300'}>{c.done ? '☑' : '☐'}</span>
            <span className={c.done ? 'text-stone-600' : 'text-stone-400'}>{c.label}</span>
          </li>
        ))}
      </ul>
      {pct >= 75 ? (
        <button onClick={generateInsight} disabled={loading}
          className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-sm transition-colors disabled:opacity-50">
          {loading ? '生成中...' : '✨ 生成 AI 人物卡'}
        </button>
      ) : (
        <p className="text-stone-400 text-xs text-center">数据收集完成后自动生成</p>
      )}
    </div>
  );
}
