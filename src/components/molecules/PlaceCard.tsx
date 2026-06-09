import type { GuidePlace } from "@/lib/types";

interface PlaceCardProps {
  place: GuidePlace;
  icon?: string;
}

/** Cartão de um local do guia (restaurante, atração, serviço). */
export function PlaceCard({ place, icon }: PlaceCardProps) {
  return (
    <li className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-medium text-slate-800">
          {icon && <span aria-hidden className="mr-1">{icon}</span>}
          {place.name}
        </p>
        <span className="shrink-0 text-xs text-slate-500">{place.distance}</span>
      </div>
      <p className="mt-1 text-sm text-slate-600">{place.description}</p>
    </li>
  );
}
