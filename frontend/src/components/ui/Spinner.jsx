import { cn } from "../../utils/cn";

export default function Spinner({ size = "md", className }) {
  const sizes = { sm: "w-3.5 h-3.5", md: "w-5 h-5", lg: "w-8 h-8" };
  return (
    <svg
      className={cn("animate-spin text-ink-400", sizes[size], className)}
      fill="none" viewBox="0 0 24 24"
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
