import { useParams, Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { ArrowLeft, Info, Network } from "lucide-react";
import ReactFlow, {
  MiniMap, Controls, Background, useNodesState, useEdgesState, MarkerType, Panel
} from "reactflow";
import "reactflow/dist/style.css";
import { useAnalysis } from "../../hooks/useAnalysis";
import { useRepository } from "../../hooks/useRepositories";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";

function buildGraph(edges) {
  if (!edges || edges.length === 0) return { nodes: [], edges: [] };

  const nodeSet = new Set();
  edges.forEach(({ source, target }) => { nodeSet.add(source); nodeSet.add(target); });

  const nodeArr = Array.from(nodeSet);
  const cols    = Math.ceil(Math.sqrt(nodeArr.length));

  const nodes = nodeArr.map((id, i) => ({
    id,
    data: { label: id.split("/").pop() || id },
    position: { x: (i % cols) * 220, y: Math.floor(i / cols) * 100 },
    style: {
      background: "#ffffff",
      border: "1px solid #d8d6d1",
      borderRadius: 4,
      color: "#3a3733",
      fontSize: 11,
      padding: "6px 12px",
      maxWidth: 180,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
  }));

  const rfEdges = edges.map(({ source, target }, i) => ({
    id:     `e-${i}`,
    source,
    target,
    markerEnd: { type: MarkerType.ArrowClosed, color: "#8c887f" },
    style:  { stroke: "#b7b4ad", strokeWidth: 1.25 },
    animated: false,
  }));

  return { nodes, edges: rfEdges };
}

export default function DependencyGraphPage() {
  const { id } = useParams();
  const { data: repo }     = useRepository(id);
  const { data: analysis, isLoading, error } = useAnalysis(id);
  const [showExternal, setShowExternal] = useState(false);

  const { nodes: initNodes, edges: initEdges } = useMemo(
    () => buildGraph(analysis?.dependencyEdges || []),
    [analysis]
  );

  const [nodes, , onNodesChange] = useNodesState(initNodes);
  const [edges, , onEdgesChange] = useEdgesState(initEdges);

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <ErrorMessage message="Could not load dependency data" />;

  const depEdges = analysis?.dependencyEdges || [];
  const extDeps  = analysis?.dependencies    || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to={`/repositories/${id}`} className="btn-ghost p-2 -ml-2"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="page-title">Dependency graph</h1>
            <p className="text-muted">{repo?.fullName}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-ink-400">
          <span>{depEdges.length} edges</span>
          <span>{extDeps.length} packages</span>
        </div>
      </div>

      {/* Graph */}
      {depEdges.length === 0 ? (
        <div className="border border-line dark:border-line-dark p-12 text-center">
          <Network className="w-6 h-6 text-ink-300 mx-auto mb-3" strokeWidth={1.5} />
          <p className="font-medium text-ink-800 dark:text-ink-100">No internal dependencies found</p>
          <p className="text-sm text-ink-400 mt-1">This repository may not have resolvable relative imports.</p>
        </div>
      ) : (
        <div className="border border-line dark:border-line-dark overflow-hidden" style={{ height: 520 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            minZoom={0.2}
            maxZoom={3}
          >
            <Background color="#e5e3de" gap={20} size={1} />
            <Controls className="!bottom-4 !right-4 !left-auto" />
            <MiniMap
              nodeColor="#b7b4ad"
              maskColor="rgba(0,0,0,0.06)"
              style={{ background: "#faf9f6", border: "1px solid #e5e3de", borderRadius: 4 }}
            />
            <Panel position="top-left" className="!m-3">
              <div className="bg-paper-surface border border-line dark:border-line-dark px-3 py-2 text-xs text-ink-400 flex items-center gap-2">
                <Info className="w-3.5 h-3.5" />
                Drag to pan · Scroll to zoom · {nodes.length} nodes
              </div>
            </Panel>
          </ReactFlow>
        </div>
      )}

      {/* External packages */}
      {extDeps.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title">External packages ({extDeps.length})</h2>
            <button onClick={() => setShowExternal((v) => !v)} className="text-sm text-ink-500 hover:text-ink-900 dark:hover:text-white">
              {showExternal ? "Show less" : "Show all"}
            </button>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {(showExternal ? extDeps : extDeps.slice(0, 40)).map((dep) => (
              <span key={dep} className="font-mono text-xs text-ink-500 dark:text-ink-400">{dep}</span>
            ))}
            {!showExternal && extDeps.length > 40 && (
              <span className="text-xs text-ink-400">+{extDeps.length - 40} more</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
