import Image from "next/image";
import {
  Bath,
  BedDouble,
  Clock,
  MapPin,
  MessageCircle,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { CopyField } from "@/components/molecules/CopyField";
import { CountUp } from "@/components/atoms/CountUp";
import { formatPhone, whatsappLink } from "@/lib/labels";
import type { Property } from "@/lib/types";

/**
 * Trilho de chegada: o essencial da estadia sempre à vista. No desktop fica fixo
 * (sticky) enquanto o guia rola ao lado; no mobile vira o topo da página.
 */
export function StayRail({ property }: { property: Property }) {
  const { address, operational, rules, host } = property;
  const cover = property.images[0];

  return (
    <aside className="lg:sticky lg:top-6 lg:self-start">
      <div className="overflow-hidden rounded-3xl bg-card shadow-[0_2px_24px_rgba(16,42,67,0.08)] ring-1 ring-line">
        {/* Hero */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink/10">
          {cover && (
            <Image
              src={cover}
              alt={property.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 420px"
              className="animate-kenburns object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-card">
            <span className="inline-block rounded-full bg-card/15 px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm">
              {property.propertyType}
            </span>
            <h1 className="mt-2 font-display text-3xl leading-tight font-semibold drop-shadow-sm">
              {property.name}
            </h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-card/90">
              <MapPin className="h-4 w-4 shrink-0" />
              {address.neighborhood}, {address.city} · {address.state}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-5">
          {/* Capacidade */}
          <dl className="grid grid-cols-3 gap-2 text-center">
            <Stat icon={<BedDouble className="h-4 w-4" />} value={property.bedroomQuantity} label="Quartos" />
            <Stat icon={<Bath className="h-4 w-4" />} value={property.bathroomQuantity} label="Banheiros" />
            <Stat icon={<Users className="h-4 w-4" />} value={property.guestCapacity} label="Hóspedes" />
          </dl>

          {/* Check-in / out */}
          <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3 ring-1 ring-line">
            <Time icon label="Check-in" value={rules.checkInTime} />
            <span className="h-8 w-px bg-line" />
            <Time label="Check-out" value={rules.checkOutTime} />
          </div>

          {/* WiFi rápido */}
          <CopyField label="Senha do WiFi" value={operational.wifiPassword} />

          {/* Falar com o anfitrião */}
          <a
            href={whatsappLink(host.phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-card transition hover:bg-accent-strong active:scale-[0.98]"
          >
            <MessageCircle className="h-4 w-4" />
            Falar com {host.name.split(" ")[0]}
            <span className="text-card/70">· {formatPhone(host.phone)}</span>
          </a>
        </div>
      </div>
    </aside>
  );
}

function Stat({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-surface py-3 ring-1 ring-line">
      <dd className="flex items-center justify-center gap-1.5 text-xl font-semibold text-ink">
        <span aria-hidden className="text-accent">
          {icon}
        </span>
        <CountUp value={value} />
      </dd>
      <dt className="text-xs text-muted">{label}</dt>
    </div>
  );
}

function Time({ icon, label, value }: { icon?: boolean; label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="flex items-center gap-1 text-xs text-muted">
        {icon && <Clock className="h-3 w-3" />}
        {label}
      </span>
      <span className="text-lg font-semibold text-ink">{value}</span>
    </div>
  );
}
