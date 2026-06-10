import { prisma } from "@/lib/db";
import { Hero } from "./_landing/Hero";
import { Features } from "./_landing/Features";
import { PropertyGrid, type PropertyCard } from "./_landing/PropertyGrid";
import { Footer } from "./_landing/Footer";

// Imóveis reais da Seazone com seus dados de exibição (fetchados ao clicar).
const REAL_PROPERTIES: PropertyCard[] = [
  { code: "AMC0202", name: "Apto Praia dos Ingleses", city: "Florianópolis", state: "SC", type: "real" },
  { code: "AMC0204", name: "Apto Beira-Mar AMC", city: "Florianópolis", state: "SC", type: "real" },
  { code: "CDK0011", name: "Apto 1 Quarto Praia", city: "Porto Seguro", state: "BA", type: "real" },
  { code: "SPT0203", name: "Estúdio Vila Germânica", city: "Blumenau", state: "SC", type: "real" },
  { code: "SPT0204", name: "Studio perto da Vila", city: "Blumenau", state: "SC", type: "real" },
  { code: "SPT0205", name: "Studio Blumenau SPT", city: "Blumenau", state: "SC", type: "real" },
  { code: "SPT0208", name: "Estúdio c/ AC Blumenau", city: "Blumenau", state: "SC", type: "real" },
];

export default async function Home() {
  const seedRows = await prisma.property.findMany({
    select: { code: true, name: true, city: true, state: true, images: true },
    orderBy: { code: "asc" },
  });

  const seedCards: PropertyCard[] = seedRows.map((p) => ({
    code: p.code,
    name: p.name,
    city: p.city,
    state: p.state,
    type: "seed",
    image: p.images[0] ?? undefined,
  }));

  const allProperties = [...seedCards, ...REAL_PROPERTIES];

  return (
    <>
      <Hero />
      <Features />
      <PropertyGrid properties={allProperties} />
      <Footer />
    </>
  );
}
