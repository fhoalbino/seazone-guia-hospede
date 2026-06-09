import type { ReactNode } from "react";

type BadgeTone = "neutral" | "positive" | "negative";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  positive: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  negative: "bg-rose-50 text-rose-700 ring-rose-200",
};

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
}

/** Pílula compacta para amenidades, regras e status. */
export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ring-1 ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
