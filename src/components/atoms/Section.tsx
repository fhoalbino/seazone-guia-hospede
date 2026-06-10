import type { ReactNode } from "react";

interface SectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}

/** Cartão de seção com título e ícone. Bloco visual base do guia. */
export function Section({ title, icon, children }: SectionProps) {
  return (
    <section className="rounded-3xl bg-cream p-6 shadow-[0_2px_24px_rgba(58,46,38,0.06)] ring-1 ring-line">
      <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-bark">
        {icon && (
          <span className="text-clay" aria-hidden>
            {icon}
          </span>
        )}
        {title}
      </h2>
      {children}
    </section>
  );
}
