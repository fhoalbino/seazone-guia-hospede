import { Section } from "@/components/atoms/Section";
import { PlaceCard } from "@/components/molecules/PlaceCard";
import { getOrCreateGuide } from "@/lib/guide";
import type { Property } from "@/lib/types";

const ESSENTIAL_ICONS: Record<string, string> = {
  pharmacy: "💊",
  supermarket: "🛒",
  hospital: "🏥",
};

/**
 * Guia de experiências gerado por IA. Server Component assíncrono:
 * gera/lê o guia e renderiza. Deve ser envolvido em <Suspense> para
 * exibir o skeleton enquanto a IA gera (primeiro acesso).
 */
export async function ExperienceGuide({ property }: { property: Property }) {
  let guide;
  try {
    guide = await getOrCreateGuide(property);
  } catch {
    return (
      <Section title="Guia de Experiências" icon="🗺️">
        <p className="text-sm text-slate-500">
          Não foi possível gerar o guia da região agora. Tente recarregar a
          página em instantes.
        </p>
      </Section>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Section title="Bem-vindo!" icon="👋">
        <p className="leading-relaxed text-slate-700">{guide.welcomeMessage}</p>
      </Section>

      <Section title="Onde comer" icon="🍽️">
        <ul className="flex flex-col gap-2">
          {guide.restaurants.map((r) => (
            <PlaceCard key={r.name} place={r} />
          ))}
        </ul>
      </Section>

      <Section title="O que fazer" icon="📸">
        <ul className="flex flex-col gap-2">
          {guide.attractions.map((a) => (
            <PlaceCard key={a.name} place={a} />
          ))}
        </ul>
      </Section>

      <Section title="Serviços essenciais" icon="🧭">
        <ul className="flex flex-col gap-2">
          {guide.essentials.map((e) => (
            <PlaceCard key={e.name} place={e} icon={ESSENTIAL_ICONS[e.type]} />
          ))}
        </ul>
      </Section>

      <Section title="Dica da estação" icon="🌤️">
        <p className="leading-relaxed text-slate-700">{guide.seasonalTip}</p>
      </Section>
    </div>
  );
}

/** Skeleton exibido enquanto a IA gera o guia (feedback visual). */
export function ExperienceGuideSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center gap-3">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
        <p className="font-medium text-slate-700">
          Gerando seu guia personalizado da região…
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded-xl bg-slate-100"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
