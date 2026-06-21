import { useParams, Link } from "react-router-dom";
import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle, Info, Network, RefreshCw } from "lucide-react";
import ReactFlow, {
  MiniMap, Controls, Background, useNodesState, useEdgesState,
  MarkerType, Panel
} from "reactflow";
import "reactflow/dist/style.css";
import { useAnalysis } from "../../hooks/useAnalysis";
import { useRepository } from "../../hooks/useRepositories";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";

function buildGraph(edges, dependencies) {
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
      background: "#1e1b4b",
      border: "1px solid #4338ca",
      borderRadius: 10,
      color: "#a5b4fc",
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
    markerEnd: { type: MarkerType.ArrowClosed, color: "#6d4cf5" },
    style:  { stroke: "#6d4cf5", strokeWidth: 1.5, opacity: 0.7 },
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
    () => buildGraph(analysis?.dependencyEdges || [], analysis?.dependencies || []),
    [analysis]
  );

  const [nodes, , onNodesChange] = useNodesState(initNodes);
  const [edges, , onEdgesChange] = useEdgesState(initEdges);

  if (isLoading) return (
    <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  );
  if (error) return <ErrorMessage message="Could not load dependency data" />;

  const depEdges   = analysis?.dependencyEdges  || [];
  const extDeps    = analysis?.dependencies     || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to={`/repositories/${id}`} className="btn-ghost p-2"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="page-title">Dependency Graph</h1>
            <p className="text-muted text-sm">{repo?.fullName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-purple">{depEdges.length} edges</span>
          <span className="badge badge-blue">{extDeps.length} packages</span>
        </div>
      </div>

      {/* Graph */}
      {depEdges.length === 0 ? (
        <div className="card p-12 text-center">
          <Network className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="font-semibold text-gray-900 dark:text-white">No internal dependencies found</p>
          <p className="text-sm text-gray-500 mt-1">This repository may not have resolvable relative imports.</p>
        </div>
      ) : (
        <div className="card overflow-hidden" style={{ height: 520 }}>
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
            <Background color="#374151" gap={20} size={1} />
            <Controls className="!bottom-4 !right-4 !left-auto" />
            <MiniMap
              nodeColor="#6d4cf5"
              maskColor="rgba(0,0,0,0.5)"
              style={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
            />
            <Panel position="top-left" className="!m-3">
              <div className="glass rounded-xl px-3 py-2 text-xs text-gray-400 flex items-center gap-2">
                <Info className="w-3.5 h-3.5" />
                Drag to pan · Scroll to zoom · {nodes.length} nodes
              </div>
            </Panel>
          </ReactFlow>
        </div>
      )}

      {/* External packages */}
      {extDeps.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title">External Packages ({extDeps.length})</h2>
            <button onClick={() => setShowExternal((v) => !v)} className="text-sm text-brand-400 hover:text-brand-300">
              {showExternal ? "Show less" : "Show all"}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(showExternal ? extDeps : extDeps.slice(0, 40)).map((dep) => (
              <span key={dep} className="badge badge-gray font-mono text-xs">{dep}</span>
            ))}
            {!showExternal && extDeps.length > 40 && (
              <span className="badge badge-gray">+{extDeps.length - 40} more</span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
