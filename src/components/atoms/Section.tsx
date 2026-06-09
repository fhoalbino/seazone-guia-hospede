import type { ReactNode } from "react";

interface SectionProps {
  title: string;
  icon?: string;
  children: ReactNode;
}

/** Cartão de seção com título e ícone. Bloco visual base do guia. */
export function Section({ title, icon, children }: SectionProps) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
        {icon && <span aria-hidden>{icon}</span>}
        {title}
      </h2>
      {children}
    </section>
  );
}
