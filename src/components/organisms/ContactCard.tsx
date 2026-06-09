import { Section } from "@/components/atoms/Section";
import { formatPhone, whatsappLink } from "@/lib/labels";
import type { Property } from "@/lib/types";

interface ContactCardProps {
  host: Property["host"];
  address: Property["address"];
}

/** Anfitrião e endereço completo do imóvel. */
export function ContactCard({ host, address }: ContactCardProps) {
  const fullAddress = [
    `${address.street}, ${address.number}`,
    address.complement,
    `${address.neighborhood}, ${address.city} — ${address.state}`,
    `CEP ${address.postalCode}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Section title="Contato e endereço" icon="📞">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-slate-500">Anfitrião</p>
        <p className="font-medium text-slate-800">{host.name}</p>
        <a
          href={whatsappLink(host.phone)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex w-fit items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-100"
        >
          💬 {formatPhone(host.phone)}
        </a>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <p className="text-sm text-slate-500">Endereço</p>
        <p className="mt-1 text-slate-800">{fullAddress}</p>
      </div>
    </Section>
  );
}
