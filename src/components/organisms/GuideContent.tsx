import type { ReactNode } from "react";
import {
  Camera,
  Hand,
  Hospital,
  MapPinned,
  Pill,
  ShoppingCart,
  Sun,
  UtensilsCrossed,
} from "lucide-react";
import { Section } from "@/components/atoms/Section";
import { PlaceCard } from "@/components/molecules/PlaceCard";
import type { ExperienceGuide } from "@/lib/types";

const ESSENTIAL_ICONS: Record<string, ReactNode> = {
  pharmacy: <Pill className="h-4 w-4" />,
  supermarket: <ShoppingCart className="h-4 w-4" />,
  hospital: <Hospital className="h-4 w-4" />,
};

/** Renderização (apresentacional) do guia de experiências. */
export function GuideContent({ guide }: { guide: ExperienceGuide }) {
  return (
    <div className="flex flex-col gap-4">
      <Section title="Bem-vindo!" icon={<Hand className="h-5 w-5" />}>
        <p className="leading-relaxed text-slate-700">{guide.welcomeMessage}</p>
      </Section>

      <Section title="Onde comer" icon={<UtensilsCrossed className="h-5 w-5" />}>
        <ul className="flex flex-col gap-2">
          {guide.restaurants.map((r) => (
            <PlaceCard key={r.name} place={r} />
          ))}
        </ul>
      </Section>

      <Section title="O que fazer" icon={<Camera className="h-5 w-5" />}>
        <ul className="flex flex-col gap-2">
          {guide.attractions.map((a) => (
            <PlaceCard key={a.name} place={a} />
          ))}
        </ul>
      </Section>

      <Section title="Serviços essenciais" icon={<MapPinned className="h-5 w-5" />}>
        <ul className="flex flex-col gap-2">
          {guide.essentials.map((e) => (
            <PlaceCard key={e.name} place={e} icon={ESSENTIAL_ICONS[e.type]} />
          ))}
        </ul>
      </Section>

      <Section title="Dica da estação" icon={<Sun className="h-5 w-5" />}>
        <p className="leading-relaxed text-slate-700">{guide.seasonalTip}</p>
      </Section>
    </div>
  );
}

/** Skeleton exibido enquanto a IA gera o guia (feedback visual). */
export function GuideSkeleton() {
  return (
    <div className="rounded-3xl bg-cream p-6 shadow-[0_2px_24px_rgba(58,46,38,0.06)] ring-1 ring-line">
      <div className="flex items-center gap-3">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-clay/30 border-t-clay" />
        <p className="font-medium text-bark">
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
