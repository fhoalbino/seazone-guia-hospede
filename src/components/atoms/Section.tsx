import type { ReactNode } from "react";

interface SectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}

/** Cartão de seção com título e ícone. Bloco visual base do guia. */
export function Section({ title, icon, children }: SectionProps) {
  return (
    <section className="rounded-3xl bg-card p-6 shadow-[0_2px_24px_rgba(16,42,67,0.06)] ring-1 ring-line">
      <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-ink">
        {icon && (
          <span className="text-accent" aria-hidden>
            {icon}
          </span>
        )}
        {title}
      </h2>
      {children}
    </section>
  );
}
