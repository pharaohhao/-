import { useStore } from '../../store';

export default function AIPersonaCard() {
  const insight = useStore((s) => s.insight);
  const memories = useStore((s) => s.memories);
  const events = useStore((s) => s.events);
  const generateInsight = useStore((s) => s.generateInsight);
  const loading = useStore((s) => s.loading);

  const hasContent = insight?.personality || insight?.interests || insight?.gift_suggestions;
  const memCount = memories.length;
  const eventCount = events.length;
  const needsMore = memCount < 3 || eventCount < 1;

  // Show progress tracker when no content
  if (!hasContent) {
    return (
      <div className="bg-gray-900 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-200 mb-4">AI 人物画像</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span>{memCount >= 3 ? '✅' : '⬜'}</span>
            <span className="text-gray-400">至少 3 条记忆</span>
            <span className="text-gray-600 text-xs ml-auto">{memCount}/3</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>{eventCount >= 1 ? '✅' : '⬜'}</span>
            <span className="text-gray-400">至少 1 个事件</span>
            <span className="text-gray-600 text-xs ml-auto">{eventCount}/1</span>
          </div>
          {needsMore ? (
            <p className="text-gray-600 text-xs mt-3">数据收集完成后即可生成 AI 人物卡</p>
          ) : (
            <button
              onClick={generateInsight}
              disabled={loading}
              className="w-full mt-3 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 text-sm transition-colors disabled:opacity-50"
            >
              {loading ? '生成中...' : '✨ 生成 AI 人物卡'}
            </button>
          )}
        </div>
      </div>
    );
  }

  const interests = (insight.interests || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const giftSuggestions = (insight.gift_suggestions || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="bg-gray-900 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-200">AI 人物卡</h3>
        <button
          onClick={generateInsight}
          disabled={loading}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
        >
          重新生成
        </button>
      </div>

      {insight.summary && (
        <p className="text-sm text-gray-400 mb-4 leading-relaxed">{insight.summary}</p>
      )}

      {insight.personality && (
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1 font-medium">性格特征</div>
          <p className="text-sm text-gray-300">{insight.personality}</p>
        </div>
      )}

      {interests.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-2 font-medium">兴趣爱好</div>
          <div className="flex flex-wrap gap-1.5">
            {interests.map((interest) => (
              <span key={interest} className="px-2.5 py-1 rounded-full bg-gray-800 text-gray-300 text-xs">
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {giftSuggestions.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 mb-1.5 font-medium">礼物建议</div>
          <ul className="space-y-1">
            {giftSuggestions.map((gift) => (
              <li key={gift} className="text-sm text-gray-400 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-gray-600 flex-shrink-0" />
                {gift}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
