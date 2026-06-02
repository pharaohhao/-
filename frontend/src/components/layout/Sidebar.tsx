import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { personaService } from '../../services/persona';

export default function Sidebar() {
  const navigate = useNavigate();
  const personas = useStore((s) => s.personas);
  const currentPersona = useStore((s) => s.currentPersona);
  const loadPersonas = useStore((s) => s.loadPersonas);

  useEffect(() => { loadPersonas(); }, [loadPersonas]);

  const handleCreate = async () => {
    const name = window.prompt('输入人物姓名：');
    if (!name?.trim()) return;
    const relation = window.prompt('输入关系（如：家人、朋友、同事）：') || '朋友';
    await personaService.create({ name: name.trim(), relation } as any);
    await loadPersonas();
  };

  return (
    <aside className="w-64 bg-white border-r border-stone-200 flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="p-5 border-b border-stone-100">
        <h1 className="text-lg font-semibold text-stone-800 tracking-tight">关系记忆</h1>
        <p className="text-xs text-stone-400 mt-0.5">Relationship Intelligence</p>
      </div>

      {/* Persona list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {personas.length === 0 && (
          <div className="text-sm text-stone-400 text-center py-8">暂无人物档案</div>
        )}
        {personas.map((p) => {
          const isActive = currentPersona?.id === p.id;
          return (
            <button
              key={p.id}
              onClick={() => navigate(`/persona/${p.id}`)}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-150 group
                ${isActive
                  ? 'bg-amber-50 border-l-[3px] border-amber-400 -ml-[3px] pl-[calc(0.75rem-1px)]'
                  : 'border-l-[3px] border-transparent hover:bg-stone-50'
                }`}
            >
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm font-medium text-amber-700 flex-shrink-0">
                {p.avatar || p.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium truncate ${isActive ? 'text-stone-800' : 'text-stone-600'}`}>{p.name}</div>
                <div className="text-xs text-stone-400 truncate">{p.relation}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Nav */}
      <div className="p-3 border-t border-stone-100 space-y-1">
        <button onClick={() => navigate('/graph')} className="flex items-center gap-2 w-full p-2.5 rounded-xl text-stone-500 hover:text-stone-700 hover:bg-stone-50 transition-colors">
          <span className="text-base">🔗</span><span className="text-sm">关系图谱</span>
        </button>
        <button onClick={() => navigate('/insights')} className="flex items-center gap-2 w-full p-2.5 rounded-xl text-stone-500 hover:text-stone-700 hover:bg-stone-50 transition-colors">
          <span className="text-base">💡</span><span className="text-sm">洞察面板</span>
        </button>
        <button onClick={() => navigate('/actions')} className="flex items-center gap-2 w-full p-2.5 rounded-xl text-stone-500 hover:text-stone-700 hover:bg-stone-50 transition-colors">
          <span className="text-base">🎯</span><span className="text-sm">行动中心</span>
        </button>
        {currentPersona && (
          <button onClick={() => navigate(`/persona/${currentPersona.id}/capsule`)} className="flex items-center gap-2 w-full p-2.5 rounded-xl text-stone-500 hover:text-stone-700 hover:bg-stone-50 transition-colors">
            <span className="text-base">⏳</span><span className="text-sm">时间胶囊</span>
          </button>
        )}
      </div>

      {/* Add button */}
      <div className="p-3 border-t border-stone-100">
        <button onClick={handleCreate}
          className="w-full py-2 rounded-xl border border-dashed border-stone-300 text-stone-400 hover:border-amber-300 hover:text-amber-600 transition-colors text-sm flex items-center justify-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          添加人物
        </button>
      </div>
    </aside>
  );
}
