import { Badge } from "@/components/atoms/Badge";
import { amenityIcon, amenityLabel } from "@/lib/labels";
import type { Amenities } from "@/lib/types";

interface AmenityListProps {
  amenities: Amenities;
}

/** Grade de amenidades ativas do imóvel. */
export function AmenityList({ amenities }: AmenityListProps) {
  const active = Object.entries(amenities)
    .filter(([, on]) => on)
    .map(([key]) => key);

  if (active.length === 0) {
    return <p className="text-sm text-slate-500">Nenhuma amenidade listada.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {active.map((key) => (
        <Badge key={key} tone="neutral">
          <span aria-hidden>{amenityIcon(key)}</span>
          {amenityLabel(key)}
        </Badge>
      ))}
    </div>
  );
}
