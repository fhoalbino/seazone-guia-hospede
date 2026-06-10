import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllPropertyCodes, getProperty } from "@/lib/properties";
import { ExperienceGuideClient } from "@/components/organisms/ExperienceGuideClient";
import { ChatWidget } from "@/components/organisms/ChatWidget";
import { HeroSection, HeroSkeleton } from "./_sections/HeroSection";
import { AccessSection, AccessSkeleton } from "./_sections/AccessSection";
import { RulesSection, RulesSkeleton } from "./_sections/RulesSection";
import { ContactSection, ContactSkeleton } from "./_sections/ContactSection";

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

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6">
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection code={code} />
      </Suspense>

      <Suspense fallback={<AccessSkeleton />}>
        <AccessSection code={code} />
      </Suspense>

      <Suspense fallback={<RulesSkeleton />}>
        <RulesSection code={code} />
      </Suspense>

      <ExperienceGuideClient key={code} code={code} />

      <Suspense fallback={<ContactSkeleton />}>
        <ContactSection code={code} />
      </Suspense>

      <ChatWidget code={code} />
    </main>
  );
}
