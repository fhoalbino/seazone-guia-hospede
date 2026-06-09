import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPropertyCodes, getProperty } from "@/lib/properties";
import { PropertyHero } from "@/components/organisms/PropertyHero";
import { AccessCard } from "@/components/organisms/AccessCard";
import { RulesCard } from "@/components/organisms/RulesCard";
import { ContactCard } from "@/components/organisms/ContactCard";
import {
  ExperienceGuide,
  ExperienceGuideSkeleton,
} from "@/components/organisms/ExperienceGuide";
import { ChatWidget } from "@/components/organisms/ChatWidget";
import { AmenityList } from "@/components/molecules/AmenityList";
import { Section } from "@/components/atoms/Section";
import { Reveal } from "@/components/atoms/Reveal";
import { Sparkles } from "lucide-react";

export async function generateStaticParams() {
  const codes = await getAllPropertyCodes();
  return codes.map((code) => ({ code }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[code]">): Promise<Metadata> {
  const { code } = await params;
  const property = await getProperty(code);
  if (!property) return { title: "Imóvel não encontrado · Guia Seazone" };
  return {
    title: `${property.name} · Guia do Hóspede`,
    description: `Tudo sobre sua estadia em ${property.address.city}.`,
  };
}

export default async function PropertyGuidePage({
  params,
}: PageProps<"/[code]">) {
  const { code } = await params;
  const property = await getProperty(code);

  if (!property) notFound();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6">
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

      <Suspense fallback={<ExperienceGuideSkeleton />}>
        <ExperienceGuide property={property} />
      </Suspense>

      <Reveal delay={0.2}>
        <ContactCard host={property.host} address={property.address} />
      </Reveal>

      <ChatWidget code={property.code} />
    </main>
  );
}
