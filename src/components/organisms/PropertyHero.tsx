import Image from "next/image";
import { Bath, BedDouble, MapPin, Users } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/atoms/Badge";
import type { Property } from "@/lib/types";

interface PropertyHeroProps {
  property: Property;
}

/** Topo do guia: foto com nome/local sobrepostos e capacidade. */
export function PropertyHero({ property }: PropertyHeroProps) {
  const { address } = property;
  const cover = property.images[0];

  return (
    <header className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="relative aspect-[16/10] w-full bg-slate-200 sm:aspect-[2/1]">
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
        {/* Gradiente para legibilidade do texto sobre a foto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <Badge tone="neutral">{property.propertyType}</Badge>
          <h1 className="mt-2 text-2xl font-bold drop-shadow-sm">
            {property.name}
          </h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-white/90">
            <MapPin className="h-4 w-4 shrink-0" />
            {address.neighborhood}, {address.city} — {address.state}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-3 p-5 text-center">
        <Capacity
          label="Quartos"
          value={property.bedroomQuantity}
          icon={<BedDouble className="h-5 w-5" />}
        />
        <Capacity
          label="Banheiros"
          value={property.bathroomQuantity}
          icon={<Bath className="h-5 w-5" />}
        />
        <Capacity
          label="Hóspedes"
          value={property.guestCapacity}
          icon={<Users className="h-5 w-5" />}
        />
      </dl>
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
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl bg-slate-50 py-3 ring-1 ring-slate-200">
      <dd className="flex items-center justify-center gap-1.5 text-xl font-semibold text-slate-800">
        <span aria-hidden className="text-sky-600">
          {icon}
        </span>
        {value}
      </dd>
      <dt className="text-xs text-slate-500">{label}</dt>
    </div>
  );
}
