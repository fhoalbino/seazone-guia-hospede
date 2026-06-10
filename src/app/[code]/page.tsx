import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPropertyCodes, getProperty } from "@/lib/properties";
import { StayRail } from "@/components/organisms/StayRail";
import { AccessCard } from "@/components/organisms/AccessCard";
import { RulesCard } from "@/components/organisms/RulesCard";
import { ContactCard } from "@/components/organisms/ContactCard";
import { ExperienceGuideClient } from "@/components/organisms/ExperienceGuideClient";
import { ChatWidgetLazy } from "@/components/organisms/ChatWidgetLazy";
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
  const title = `${property.name} · Guia do Hóspede`;
  const description = `Tudo sobre sua estadia em ${property.address.city}: acesso, WiFi, regras e guia de experiências gerado por IA.`;
  // A imagem de OG/Twitter é o card gerado em opengraph-image.tsx (Next usa o
  // arquivo de convenção automaticamente). Não apontamos para a foto do imóvel.
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PropertyGuidePage({
  params,
}: PageProps<"/[code]">) {
  const { code } = await params;
  const property = await getProperty(code);

  if (!property) notFound();

  return (
    <main className="theme-stay min-h-screen">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-10 lg:py-10">
        <StayRail property={property} />

        <div className="flex flex-col gap-5">
          <Reveal>
            <Section title="Amenidades" icon={<Sparkles className="h-5 w-5" />}>
              <AmenityList amenities={property.amenities} />
            </Section>
          </Reveal>

          <Reveal>
            <AccessCard operational={property.operational} />
          </Reveal>

          <Reveal>
            <RulesCard rules={property.rules} />
          </Reveal>

          <ExperienceGuideClient key={property.code} code={property.code} />

          <Reveal>
            <ContactCard host={property.host} address={property.address} />
          </Reveal>
        </div>
      </div>

      <ChatWidgetLazy code={property.code} />
    </main>
  );
}
