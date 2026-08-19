import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react";
import { cn } from "../../utils/cn";

const LANG_COLORS = {
  TypeScript: "#3178c6", JavaScript: "#c9a227", Python: "#3572A5",
  Java: "#b07219", Go: "#00ADD8", Rust: "#dea584", "C++": "#f34b7d",
  HTML: "#e34c26", CSS: "#563d7c", SCSS: "#c6538c", Vue: "#41b883",
  Svelte: "#ff3e00", Markdown: "#6b675e", JSON: "#8c887f",
};

function FileIcon({ node }) {
  if (node.type === "dir") return <Folder className="w-3.5 h-3.5 text-ink-400 flex-shrink-0" strokeWidth={1.75} />;
  const color = LANG_COLORS[node.language] || "#8c887f";
  return <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 inline-block" style={{ background: color }} />;
}

function TreeNode({ node, depth = 0 }) {
  const [open, setOpen] = useState(depth < 2);
  const isDir = node.type === "dir";
  const hasChildren = isDir && node.children?.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-1.5 py-[3px] px-2 text-xs cursor-pointer hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors"
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        onClick={() => isDir && setOpen((v) => !v)}
      >
        {isDir && hasChildren && (
          <span className="text-ink-300 flex-shrink-0">
            {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </span>
        )}
        {isDir && !hasChildren && <span className="w-3 flex-shrink-0" />}
        {isDir
          ? (open ? <FolderOpen className="w-3.5 h-3.5 text-ink-400 flex-shrink-0" strokeWidth={1.75} /> : <Folder className="w-3.5 h-3.5 text-ink-400 flex-shrink-0" strokeWidth={1.75} />)
          : <FileIcon node={node} />
        }
        <span className={cn("truncate", isDir ? "font-medium text-ink-700 dark:text-ink-200" : "text-ink-500 dark:text-ink-400")}>
          {node.name}
        </span>
        {!isDir && node.lines > 0 && (
          <span className="ml-auto text-[10px] text-ink-300 dark:text-ink-600 tabular-nums flex-shrink-0">{node.lines}L</span>
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
  if (!tree) return <p className="text-xs text-ink-400 p-3">No file tree available</p>;
  return (
    <div className="font-mono text-xs overflow-auto max-h-[600px] py-2 -mx-2">
      <TreeNode node={tree} depth={0} />
    </div>
  );
}
