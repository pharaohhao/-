import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { storyService, type LifeStory } from '../services/story';

export default function LifeStoryPage() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<LifeStory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    storyService.get(id).then(setStory).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-full text-gray-400">生成故事中...</div>;
  if (!story) return <div className="flex items-center justify-center h-full text-gray-400">未找到故事</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="text-5xl block mb-3">{story.persona_avatar}</span>
        <h1 className="text-2xl font-bold text-gray-100">{story.persona_name} 的故事</h1>
        <p className="text-gray-500 text-sm mt-1">
          {story.persona_relation} · {story.total_memories} 条记忆 · 时间跨度: {story.timeline_span}
        </p>
      </div>

      {/* Narrative */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
        <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm">{story.narrative}</p>
      </div>

      {/* Timeline chapters */}
      <div className="relative pl-8 border-l-2 border-gray-800 space-y-8">
        {story.chapters.map((ch) => (
          <div key={ch.year} className="relative">
            <div className="absolute -left-[calc(2rem+5px)] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-gray-950" />
            <div className="text-blue-400 text-sm font-medium mb-2">{ch.year} 年</div>
            <p className="text-gray-500 text-xs mb-3">{ch.summary}</p>
            <div className="space-y-2">
              {ch.highlights.map((h, i) => (
                <div key={i} className="text-gray-300 text-sm bg-gray-900 border border-gray-800 rounded-lg px-3 py-2">
                  {h}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Back link */}
      <div className="text-center mt-8">
        <Link to={`/persona/${id}`} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
          ← 返回人物页
        </Link>
      </div>
    </div>
  );
}
