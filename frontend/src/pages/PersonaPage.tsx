import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import BriefingCard from '../components/dashboard/BriefingCard';
import StatsGrid from '../components/dashboard/StatsGrid';
import AIPersonaCard from '../components/dashboard/AIPersonaCard';
import Timeline from '../components/dashboard/Timeline';
import ChatWindow from '../components/chat/ChatWindow';

export default function PersonaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const selectPersona = useStore((s) => s.selectPersona);
  const clearPersona = useStore((s) => s.clearPersona);
  const loading = useStore((s) => s.loading);
  const currentPersona = useStore((s) => s.currentPersona);

  useEffect(() => {
    if (id) {
      selectPersona(id);
    }
    return () => {
      clearPersona();
    };
  }, [id, selectPersona, clearPersona]);

  // Loading state
  if (loading && !currentPersona) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-sm text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!currentPersona) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-sm text-gray-500">未找到人物信息</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Persona header */}
      <div className="flex items-center gap-4 pb-2">
        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-lg font-medium text-gray-300 overflow-hidden flex-shrink-0">
          {currentPersona.avatar ? (
            <img src={currentPersona.avatar} alt={currentPersona.name} className="w-full h-full object-cover" />
          ) : (
            currentPersona.name.charAt(0)
          )}
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-100">{currentPersona.name}</h1>
          <p className="text-sm text-gray-500">{currentPersona.relation}</p>
        </div>
        {currentPersona.description && (
          <p className="text-sm text-gray-400 ml-auto max-w-xs text-right leading-relaxed">
            {currentPersona.description}
          </p>
        )}
        <button
          onClick={() => navigate(`/persona/${id}/story`)}
          className="ml-4 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-gray-100 transition-colors whitespace-nowrap"
        >
          📖 生命故事
        </button>
        <button
          onClick={() => navigate(`/persona/${id}/capsule`)}
          className="ml-4 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-gray-100 transition-colors whitespace-nowrap"
        >
          ⏳ 时间胶囊
        </button>
      </div>

      {/* Briefing */}
      <BriefingCard />

      {/* Middle row: Stats + AI Card */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <StatsGrid />
        </div>
        <div className="xl:col-span-1">
          <AIPersonaCard />
        </div>
      </div>

      {/* Timeline */}
      <Timeline />

      {/* Chat */}
      <ChatWindow />
    </div>
  );
}
