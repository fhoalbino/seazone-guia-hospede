import type { ReactNode } from "react";
import type { GuidePlace } from "@/lib/types";

interface PlaceCardProps {
  place: GuidePlace;
  icon?: ReactNode;
}

/** Cartão de um local do guia (restaurante, atração, serviço). */
export function PlaceCard({ place, icon }: PlaceCardProps) {
  return (
    <li className="rounded-xl bg-surface p-3 ring-1 ring-line">
      <div className="flex items-baseline justify-between gap-2">
        <p className="flex items-center gap-1.5 font-medium text-ink">
          {icon && (
            <span aria-hidden className="text-accent">
              {icon}
            </span>
          )}
          {place.name}
        </p>
        <span className="shrink-0 text-xs text-slate-500">{place.distance}</span>
      </div>
      <p className="mt-1 text-sm text-slate-600">{place.description}</p>
    </li>
  );
}
