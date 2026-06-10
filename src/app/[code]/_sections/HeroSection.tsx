import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import { PropertyHero } from "@/components/organisms/PropertyHero";
import { AmenityList } from "@/components/molecules/AmenityList";
import { Section } from "@/components/atoms/Section";
import { Reveal } from "@/components/atoms/Reveal";
import type { Property } from "@/lib/types";

export async function HeroSection({
  propertyPromise,
}: {
  propertyPromise: Promise<Property | null>;
}) {
  const property = await propertyPromise;
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
    </>
  );
}

export function HeroSkeleton() {
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
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 h-5 w-40 animate-pulse rounded bg-slate-200" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-7 w-20 animate-pulse rounded-full bg-slate-100" />
          ))}
        </div>
      </div>
    </>
  );
}
