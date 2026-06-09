import { getProperty } from "@/lib/properties";
import { getOrCreateGuide } from "@/lib/guide";

// Geração do guia pode levar ~15s (IA + Places). Evita o timeout padrão.
export const maxDuration = 60;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const property = await getProperty(code);
  if (!property) {
    return new Response("Imóvel não encontrado", { status: 404 });
  }

  try {
    const guide = await getOrCreateGuide(property);
    return Response.json(guide);
  } catch {
    return new Response("Falha ao gerar o guia", { status: 500 });
  }
}
