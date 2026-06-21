import { useState } from "react";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from "lucide-react";
import { cn } from "../../utils/cn";
import { formatBytes } from "../../utils/format";

const LANG_COLORS = {
  TypeScript: "#3178c6", JavaScript: "#f0db4f", Python: "#3572A5",
  Java: "#b07219", Go: "#00ADD8", Rust: "#dea584", "C++": "#f34b7d",
  HTML: "#e34c26", CSS: "#563d7c", SCSS: "#c6538c", Vue: "#41b883",
  Svelte: "#ff3e00", Markdown: "#083fa1", JSON: "#6b7280",
};

function FileIcon({ node }) {
  if (node.type === "dir") return <Folder className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />;
  const color = LANG_COLORS[node.language] || "#6b7280";
  return (
    <span className="w-2 h-2 rounded-full flex-shrink-0 inline-block" style={{ background: color }} />
  );
}

function TreeNode({ node, depth = 0 }) {
  const [open, setOpen] = useState(depth < 2);
  const isDir = node.type === "dir";
  const hasChildren = isDir && node.children?.length > 0;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1.5 py-[3px] px-2 rounded-md text-xs cursor-pointer group",
          "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
        )}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        onClick={() => isDir && setOpen((v) => !v)}
      >
        {isDir && hasChildren && (
          <span className="text-gray-400 flex-shrink-0">
            {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </span>
        )}
        {isDir && !hasChildren && <span className="w-3 flex-shrink-0" />}
        {isDir
          ? (open ? <FolderOpen className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" /> : <Folder className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />)
          : <FileIcon node={node} />
        }
        <span className={cn("truncate", isDir ? "font-medium text-gray-700 dark:text-gray-200" : "text-gray-600 dark:text-gray-400")}>
          {node.name}
        </span>
        {!isDir && node.lines > 0 && (
          <span className="ml-auto text-[10px] text-gray-400 tabular-nums flex-shrink-0">{node.lines}L</span>
        )}
      </div>
      {isDir && open && hasChildren && (
        <div>
          {node.children.map((child, i) => (
            <TreeNode key={`${child.name}-${i}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({ tree }) {
  if (!tree) return <p className="text-xs text-gray-400 p-3">No file tree available</p>;
  return (
    <div className="font-mono text-xs overflow-auto max-h-[600px] p-2">
      <TreeNode node={tree} depth={0} />
    </div>
  );
}
