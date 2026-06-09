import type { ReactNode } from "react";

interface InfoRowProps {
  label: string;
  children: ReactNode;
}

/** Linha rótulo → valor. Usada em acesso, regras e contato. */
export function InfoRow({ label, children }: InfoRowProps) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-slate-100 py-2.5 last:border-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">{children}</span>
    </div>
  );
}
