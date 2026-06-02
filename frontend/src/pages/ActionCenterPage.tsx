import { useEffect, useState } from 'react';
import { actionsService, type ActionItem } from '../services/actions';

const typeMap: Record<string, { label: string; color: string; icon: string }> = {
  contact: { label: '联系', color: 'text-blue-400 bg-blue-900/30 border-blue-800', icon: '📞' },
  gift: { label: '礼物', color: 'text-pink-400 bg-pink-900/30 border-pink-800', icon: '🎁' },
  event_prep: { label: '事件', color: 'text-amber-400 bg-amber-900/30 border-amber-800', icon: '📅' },
  check_in: { label: '关心', color: 'text-green-400 bg-green-900/30 border-green-800', icon: '💚' },
};

const priorityColor = (p: number) => p >= 9 ? 'border-l-red-500' : p >= 7 ? 'border-l-amber-500' : 'border-l-gray-600';

export default function ActionCenterPage() {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActions = () => {
    setLoading(true);
    actionsService.list().then(setActions).finally(() => setLoading(false));
  };

  useEffect(() => { loadActions(); }, []);

  const handleComplete = async (actionId: string) => {
    await actionsService.complete(actionId);
    setActions((prev) => prev.filter((a) => a.action_id !== actionId));
  };

  const handleGenerate = async () => {
    setLoading(true);
    await actionsService.generate();
    loadActions();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full text-gray-400">加载中...</div>;
  }

  const pending = actions.filter((a) => a.priority >= 7);
  const normal = actions.filter((a) => a.priority < 7);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">行动中心</h1>
          <p className="text-gray-500 text-sm mt-1">基于分析自动生成的行动建议</p>
        </div>
        <button onClick={handleGenerate} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white transition-colors">
          🔄 刷新建议
        </button>
      </div>

      {actions.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">暂无行动建议</p>
          <p className="text-sm mt-2">积累更多数据后，系统将自动生成建议</p>
        </div>
      ) : (
        <>
          {/* Priority actions */}
          {pending.length > 0 && (
            <div className="mb-6">
              <h2 className="text-red-400 text-sm font-medium mb-3 uppercase tracking-wide">优先处理</h2>
              <div className="space-y-3">
                {pending.map((a) => (
                  <ActionCard key={a.action_id} action={a} onComplete={handleComplete} />
                ))}
              </div>
            </div>
          )}

          {/* Normal actions */}
          {normal.length > 0 && (
            <div>
              <h2 className="text-gray-500 text-sm font-medium mb-3 uppercase tracking-wide">其他建议</h2>
              <div className="space-y-3">
                {normal.map((a) => (
                  <ActionCard key={a.action_id} action={a} onComplete={handleComplete} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ActionCard({ action, onComplete }: { action: ActionItem; onComplete: (id: string) => void }) {
  const tm = typeMap[action.action_type] || typeMap.contact;
  return (
    <div className={`bg-gray-900 border border-gray-800 border-l-4 ${priorityColor(action.priority)} rounded-xl p-4 flex items-center gap-4`}>
      <span className="text-2xl">{action.persona_avatar}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-gray-100 font-medium">{action.suggestion}</span>
          <span className={`text-xs px-2 py-0.5 rounded border ${tm.color}`}>{tm.icon} {tm.label}</span>
        </div>
        <p className="text-gray-500 text-xs">{action.reason}</p>
      </div>
      <button
        onClick={() => onComplete(action.action_id)}
        className="shrink-0 px-3 py-1.5 bg-gray-800 hover:bg-green-800 text-gray-400 hover:text-green-300 rounded-lg text-xs transition-colors"
      >
        完成
      </button>
    </div>
  );
}
