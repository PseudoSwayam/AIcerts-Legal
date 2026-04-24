import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/types";

const map: Record<RiskLevel, { label: string; cls: string }> = {
  low: { label: "Low risk", cls: "bg-risk-low-bg text-risk-low border-risk-low/20" },
  medium: { label: "Medium risk", cls: "bg-risk-medium-bg text-risk-medium border-risk-medium/20" },
  high: { label: "High risk", cls: "bg-risk-high-bg text-risk-high border-risk-high/30" },
};

export function RiskTag({ level, className }: { level: RiskLevel; className?: string }) {
  const m = map[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        m.cls,
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          level === "low" && "bg-risk-low",
          level === "medium" && "bg-risk-medium",
          level === "high" && "bg-risk-high"
        )}
      />
      {m.label}
    </span>
  );
}
