import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { personaService } from '../services/persona';

export default function Home() {
  const navigate = useNavigate();
  const personas = useStore((s) => s.personas);
  const loadPersonas = useStore((s) => s.loadPersonas);

  const handleCreate = async () => {
    const name = window.prompt('输入人物姓名：');
    if (!name?.trim()) return;
    const relation = window.prompt('输入关系（如：家人、朋友、同事）：') || '朋友';
    const persona = await personaService.create({ name: name.trim(), relation });
    await loadPersonas();
    navigate(`/persona/${persona.id}`);
  };

  // Empty state
  if (personas.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-200 mb-2">还没有人物档案</h2>
          <p className="text-sm text-gray-500 mb-6">
            创建一个人物档案开始记录你和TA之间的点点滴滴
          </p>
          <button
            onClick={handleCreate}
            className="px-5 py-2.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium"
          >
            创建第一个人物
          </button>
        </div>
      </div>
    );
  }

  // Persona grid
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-100">人物档案</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          新建人物
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {personas.map((p) => (
          <button
            key={p.id}
            onClick={() => navigate(`/persona/${p.id}`)}
            className="bg-gray-900 rounded-xl p-5 text-left hover:bg-gray-800/80 transition-colors border border-gray-800 hover:border-gray-700"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-base font-medium text-gray-300 overflow-hidden flex-shrink-0">
                {p.avatar ? (
                  <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  p.name.charAt(0)
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-200 truncate">{p.name}</div>
                <div className="text-xs text-gray-500">{p.relation}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
