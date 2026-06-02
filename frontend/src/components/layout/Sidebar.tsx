import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { personaService } from '../../services/persona';

export default function Sidebar() {
  const navigate = useNavigate();
  const personas = useStore((s) => s.personas);
  const currentPersona = useStore((s) => s.currentPersona);
  const loadPersonas = useStore((s) => s.loadPersonas);

  useEffect(() => {
    loadPersonas();
  }, [loadPersonas]);

  const handleCreate = async () => {
    const name = window.prompt('输入人物姓名：');
    if (!name?.trim()) return;
    const relation = window.prompt('输入关系（如：家人、朋友、同事）：') || '朋友';
    await personaService.create({ name: name.trim(), relation });
    await loadPersonas();
  };

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Logo / Title */}
      <div className="p-5 border-b border-gray-800">
        <h1 className="text-lg font-semibold text-gray-100 tracking-tight">关系记忆</h1>
        <p className="text-xs text-gray-500 mt-0.5">Personal Relationship Intelligence</p>
      </div>

      {/* Persona list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {personas.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-8">
            暂无人物档案
          </div>
        )}
        {personas.map((p) => {
          const isActive = currentPersona?.id === p.id;
          return (
            <button
              key={p.id}
              onClick={() => navigate(`/persona/${p.id}`)}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all duration-150 group
                ${isActive
                  ? 'bg-gray-800 border-l-[3px] border-blue-400 -ml-[3px] pl-[calc(0.75rem-1px)]'
                  : 'border-l-[3px] border-transparent hover:bg-gray-800/50'
                }`}
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-300 overflow-hidden flex-shrink-0">
                {p.avatar ? (
                  <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  p.name.charAt(0)
                )}
              </div>
              {/* Name + relation */}
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium truncate ${isActive ? 'text-gray-100' : 'text-gray-300'}`}>
                  {p.name}
                </div>
                <div className="text-xs text-gray-500 truncate">{p.relation}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Graph nav button */}
      <div className="p-3 border-t border-gray-800 space-y-1">
        <button
          onClick={() => navigate('/graph')}
          className="flex items-center gap-2 w-full p-3 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
        >
          <span className="text-lg">🔗</span>
          <span className="text-sm">关系图谱</span>
        </button>
        <button
          onClick={() => navigate('/insights')}
          className="flex items-center gap-2 w-full p-3 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
        >
          <span className="text-lg">{'💡'}</span>
          <span className="text-sm">洞察面板</span>
        </button>
        <button
          onClick={() => navigate('/actions')}
          className="flex items-center gap-2 w-full p-3 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
        >
          <span className="text-lg">{'🎯'}</span>
          <span className="text-sm">行动中心</span>
        </button>
        {currentPersona && (
          <button
            onClick={() => navigate(`/persona/${currentPersona.id}/capsule`)}
            className="flex items-center gap-2 w-full p-3 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
          >
            <span className="text-lg">{'⏳'}</span>
            <span className="text-sm">时间胶囊</span>
          </button>
        )}
      </div>

      {/* Add button */}
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={handleCreate}
          className="w-full py-2 rounded-lg border border-dashed border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors text-sm flex items-center justify-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          添加人物
        </button>
      </div>
    </aside>
  );
}
