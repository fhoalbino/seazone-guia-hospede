import { getAllPropertyCards } from "@/lib/properties";
import { Hero } from "./_landing/Hero";
import { Features } from "./_landing/Features";
import { PropertyGrid, type PropertyCard } from "./_landing/PropertyGrid";
import { Footer } from "./_landing/Footer";

// Imóveis-exemplo fornecidos no desafio (recebem o selo "Exemplo").
const CHALLENGE_CODES = new Set(["FLN001", "GRM001"]);

export default async function Home() {
  const rows = await getAllPropertyCards();

  const cards: PropertyCard[] = rows.map((p) => ({
    code: p.code,
    name: p.name,
    city: p.city,
    state: p.state,
    type: CHALLENGE_CODES.has(p.code) ? "seed" : "real",
    image: p.image ?? undefined,
  }));

  // Exemplos do desafio primeiro, depois os imóveis reais.
  cards.sort((a, b) => Number(b.type === "seed") - Number(a.type === "seed"));

  return (
    <>
      <Hero />
      <Features />
      <PropertyGrid properties={cards} />
      <Footer />
    </>
  );
}
