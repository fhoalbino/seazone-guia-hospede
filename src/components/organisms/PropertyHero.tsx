import Image from "next/image";
import { Badge } from "@/components/atoms/Badge";
import type { Property } from "@/lib/types";

interface PropertyHeroProps {
  property: Property;
}

/** Topo do guia: foto, nome, tipo, localização e capacidade. */
export function PropertyHero({ property }: PropertyHeroProps) {
  const { address } = property;
  const cover = property.images[0];

  return (
    <header className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="relative aspect-[16/9] w-full bg-slate-100">
        {cover && (
          <Image
            src={cover}
            alt={property.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        )}
      </div>
      <div className="p-5">
        <Badge tone="neutral">{property.propertyType}</Badge>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          {property.name}
        </h1>
        <p className="mt-1 text-slate-500">
          📍 {address.neighborhood}, {address.city} — {address.state}
        </p>

        <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
          <Capacity label="Quartos" value={property.bedroomQuantity} icon="🛏️" />
          <Capacity
            label="Banheiros"
            value={property.bathroomQuantity}
            icon="🚿"
          />
          <Capacity
            label="Hóspedes"
            value={property.guestCapacity}
            icon="👥"
          />
        </dl>
      </div>
    </header>
  );
}

function Capacity({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 py-3 ring-1 ring-slate-200">
      <dd className="text-xl font-semibold text-slate-800">
        <span aria-hidden className="mr-1">
          {icon}
        </span>
        {value}
      </dd>
      <dt className="text-xs text-slate-500">{label}</dt>
    </div>
  );
}
