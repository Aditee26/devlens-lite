import Spinner from "../ui/Spinner";
import { cn } from "../../utils/cn";

const CFG = {
  complete:  { label: "Complete",  cls: "badge-green" },
  analyzing: { label: "Analyzing…",cls: "badge-blue",  spin: true },
  cloning:   { label: "Cloning…",  cls: "badge-blue",  spin: true },
  pending:   { label: "Pending",   cls: "badge-gray",  spin: true },
  error:     { label: "Error",     cls: "badge-red" },
};

export default function RepoStatusBadge({ status }) {
  const cfg = CFG[status] || { label: status, cls: "badge-gray" };
  return (
    <span className={cn("badge gap-1.5", cfg.cls)}>
      {cfg.spin && <Spinner size="sm" className="!w-2.5 !h-2.5" />}
      {cfg.label}
    </span>
  );
}
