import Spinner from "../ui/Spinner";
import { cn } from "../../utils/cn";

const CFG = {
  complete:  { label: "Complete",  cls: "tag-green" },
  analyzing: { label: "Analyzing", cls: "tag-blue",  spin: true },
  cloning:   { label: "Cloning",   cls: "tag-blue",  spin: true },
  pending:   { label: "Pending",   cls: "tag-gray",  spin: true },
  error:     { label: "Error",     cls: "tag-red" },
};

export default function RepoStatusBadge({ status }) {
  const cfg = CFG[status] || { label: status, cls: "tag-gray" };
  return (
    <span className={cn("tag", cfg.cls)}>
      {cfg.spin ? <Spinner size="sm" className="!w-2.5 !h-2.5" /> : <span className="tag-dot" />}
      {cfg.label}
    </span>
  );
}
