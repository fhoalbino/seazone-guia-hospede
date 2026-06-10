import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import { getProperty } from "@/lib/properties";
import { PropertyHero } from "@/components/organisms/PropertyHero";
import { AmenityList } from "@/components/molecules/AmenityList";
import { AccessCard } from "@/components/organisms/AccessCard";
import { RulesCard } from "@/components/organisms/RulesCard";
import { ContactCard } from "@/components/organisms/ContactCard";
import { Section } from "@/components/atoms/Section";
import { Reveal } from "@/components/atoms/Reveal";

export async function PropertySections({ code }: { code: string }) {
  const property = await getProperty(code);
  if (!property) notFound();
  return (
    <>
      <Reveal>
        <PropertyHero property={property} />
      </Reveal>
      <Reveal delay={0.05}>
        <Section title="Amenidades" icon={<Sparkles className="h-5 w-5" />}>
          <AmenityList amenities={property.amenities} />
        </Section>
      </Reveal>
      <Reveal delay={0.1}>
        <AccessCard operational={property.operational} />
      </Reveal>
      <Reveal delay={0.15}>
        <RulesCard rules={property.rules} />
      </Reveal>
      <Reveal delay={0.2}>
        <ContactCard host={property.host} address={property.address} />
      </Reveal>
    </>
  );
}

export function PropertySkeleton() {
  return (
    <>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="aspect-[16/10] w-full animate-pulse bg-slate-200 sm:aspect-[2/1]" />
        <div className="grid grid-cols-3 gap-3 p-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="mb-4 h-5 w-40 animate-pulse rounded bg-slate-200" />
          <div className="flex flex-col gap-2.5">
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </>
  );
}
