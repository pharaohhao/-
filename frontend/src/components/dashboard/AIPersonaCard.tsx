import { useStore } from '../../store';

export default function AIPersonaCard() {
  const insight = useStore((s) => s.insight);
  const generateInsight = useStore((s) => s.generateInsight);
  const loading = useStore((s) => s.loading);

  const hasContent = insight?.personality || insight?.interests || insight?.gift_suggestions;

  if (!hasContent) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px]">
        <div className="text-gray-400 text-sm mb-3">AI 人物卡尚未生成</div>
        <button
          onClick={generateInsight}
          disabled={loading}
          className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {loading ? '生成中...' : '点击生成 AI 人物卡'}
        </button>
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
      {/* Header */}
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

      {/* Summary */}
      {insight.summary && (
        <p className="text-sm text-gray-400 mb-4 leading-relaxed">{insight.summary}</p>
      )}

      {/* Personality */}
      {insight.personality && (
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1 font-medium">性格特征</div>
          <p className="text-sm text-gray-300">{insight.personality}</p>
        </div>
      )}

      {/* Interests */}
      {interests.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-2 font-medium">兴趣爱好</div>
          <div className="flex flex-wrap gap-1.5">
            {interests.map((interest) => (
              <span
                key={interest}
                className="px-2.5 py-1 rounded-full bg-gray-800 text-gray-300 text-xs"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Gift Suggestions */}
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
