import { cn } from "../../utils/cn";

export default function Skeleton({ className, ...props }) {
  return <div className={cn("skeleton", className)} {...props} />;
}

export function SkeletonCard() {
  return (
    <div className="surface rounded p-4 space-y-3">
      <Skeleton className="h-3.5 w-1/2" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-6 w-full" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}
