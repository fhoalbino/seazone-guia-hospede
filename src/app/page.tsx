import { prisma } from "@/lib/db";
import { FEATURED_REAL_CODES, fetchPropertyPreview } from "@/lib/seazone-api";
import { Hero } from "./_landing/Hero";
import { Features } from "./_landing/Features";
import { PropertyGrid, type PropertyCard } from "./_landing/PropertyGrid";
import { Footer } from "./_landing/Footer";

export default async function Home() {
  // Busca seeds do banco e 18 reais da Seazone API em paralelo.
  const [seedRows, realPreviews] = await Promise.all([
    prisma.property.findMany({
      select: { code: true, name: true, city: true, state: true, images: true },
      orderBy: { code: "asc" },
    }),
    Promise.all(FEATURED_REAL_CODES.map(fetchPropertyPreview)),
  ]);

  const seedCards: PropertyCard[] = seedRows.map((p) => ({
    code: p.code,
    name: p.name,
    city: p.city,
    state: p.state,
    type: "seed",
    image: p.images[0] ?? undefined,
  }));

  const realCards: PropertyCard[] = realPreviews
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .map((p) => ({
      code: p.code,
      name: p.name,
      city: p.city,
      state: p.state,
      type: "real",
      image: p.image ?? undefined,
    }));

  return (
    <>
      <Hero />
      <Features />
      <PropertyGrid properties={[...seedCards, ...realCards]} />
      <Footer />
    </>
  );
}
