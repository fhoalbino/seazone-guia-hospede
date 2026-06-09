"use client";

import { useEffect, useState } from "react";
import { Map } from "lucide-react";
import { Section } from "@/components/atoms/Section";
import { GuideContent, GuideSkeleton } from "@/components/organisms/GuideContent";
import type { ExperienceGuide } from "@/lib/types";

type State =
  | { status: "loading" }
  | { status: "ready"; guide: ExperienceGuide }
  | { status: "error" };

/**
 * Carrega o guia de experiências em paralelo, via API, sem bloquear a página.
 * O imóvel já está renderizado; aqui só o guia entra quando pronto.
 */
export function ExperienceGuideClient({ code }: { code: string }) {
  // Componente é remontado por `key={code}`, então o estado inicial já cobre o loading.
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch(`/api/guide/${code}`);
        if (!res.ok) throw new Error();
        const guide: ExperienceGuide = await res.json();
        if (active) setState({ status: "ready", guide });
      } catch {
        if (active) setState({ status: "error" });
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [code]);

  if (state.status === "loading") return <GuideSkeleton />;

  if (state.status === "error") {
    return (
      <Section title="Guia de Experiências" icon={<Map className="h-5 w-5" />}>
        <p className="text-sm text-slate-500">
          Não foi possível gerar o guia da região agora. Tente recarregar a
          página em instantes.
        </p>
      </Section>
    );
  }

  return <GuideContent guide={state.guide} />;
}
