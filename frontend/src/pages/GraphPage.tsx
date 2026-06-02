import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useNavigate } from 'react-router-dom';
import { graphService, type GraphData } from '../services/graph';

// Custom node component
function PersonaNode({
  data,
}: {
  data: { label: string; avatar: string; relation: string; memoryCount: number };
}) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 min-w-[120px] text-center cursor-pointer hover:border-blue-400 transition-colors shadow-lg">
      <div className="text-2xl mb-1">{data.avatar}</div>
      <div className="text-gray-100 font-medium text-sm">{data.label}</div>
      <div className="text-gray-500 text-xs mt-0.5">{data.relation}</div>
      <div className="text-gray-600 text-xs">{data.memoryCount} memories</div>
    </div>
  );
}

const nodeTypes = { personaNode: PersonaNode };

export default function GraphPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    graphService.get().then((data: GraphData) => {
      // Position nodes in a circle layout
      const center = { x: 400, y: 300 };
      const radius = 200;
      const angleStep = (2 * Math.PI) / Math.max(data.nodes.length, 1);

      const newNodes: Node[] = data.nodes.map((n, i) => ({
        id: n.id,
        type: 'personaNode',
        position: {
          x: center.x + radius * Math.cos(i * angleStep - Math.PI / 2),
          y: center.y + radius * Math.sin(i * angleStep - Math.PI / 2),
        },
        data: {
          label: n.name,
          avatar: n.avatar,
          relation: n.relation,
          memoryCount: n.memory_count,
        },
      }));

      const newEdges: Edge[] = data.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: `${e.type} (${e.strength})`,
        style: {
          stroke: `rgba(147, 197, 253, ${Math.max(0.2, e.strength / 100)})`,
          strokeWidth: Math.max(1, e.strength / 20),
        },
        labelStyle: { fill: '#9ca3af', fontSize: 11 },
        labelBgStyle: { fill: '#1f2937' },
      }));

      setNodes(newNodes);
      setEdges(newEdges);
      setLoading(false);
    });
  }, [setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      navigate(`/persona/${node.id}`);
    },
    [navigate],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        加载关系图谱...
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <div className="absolute top-4 left-4 z-10 bg-gray-900/90 backdrop-blur rounded-lg px-4 py-2 border border-gray-700">
        <h2 className="text-gray-100 font-medium text-sm">关系图谱</h2>
        <p className="text-gray-500 text-xs mt-0.5">
          点击节点查看人物详情 · 连线粗细表示关系强度
        </p>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="#374151" gap={20} />
        <Controls className="!bg-gray-900 !border-gray-700 !text-gray-300" />
        <MiniMap
          nodeColor="#374151"
          maskColor="rgba(0,0,0,0.7)"
          className="!bg-gray-900 !border-gray-700"
        />
      </ReactFlow>
    </div>
  );
}
