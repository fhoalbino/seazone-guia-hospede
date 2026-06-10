"use client";

import { motion, useInView, type Variants } from "motion/react";
import { useRef } from "react";
import { MapPin, MessageCircle, KeyRound, Zap } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Guia de Experiências",
    desc: "A IA analisa a localização do imóvel e gera um guia com restaurantes, atrações e serviços essenciais próximos — com distâncias reais do Google Maps.",
    color: "text-clay",
    bg: "bg-clay/10",
  },
  {
    icon: MessageCircle,
    title: "Assistente Virtual",
    desc: "Chat em tempo real treinado com todos os dados do imóvel. O hóspede pergunta sobre WiFi, check-out, regras ou pede dicas — e recebe respostas instantâneas.",
    color: "text-[#b8893b]",
    bg: "bg-[#b8893b]/10",
  },
  {
    icon: KeyRound,
    title: "Acesso Centralizado",
    desc: "Código do portão, senha do WiFi, instruções de estacionamento e contato do anfitrião reunidos em um único guia seguro e acessível pelo celular.",
    color: "text-[#7a7a52]",
    bg: "bg-[#7a7a52]/10",
  },
  {
    icon: Zap,
    title: "Rápido e Offline-Ready",
    desc: "Página leve que abre em qualquer celular, sem app para instalar. O hóspede acessa pelo link enviado na reserva — funciona mesmo com sinal fraco.",
    color: "text-[#c2542f]",
    bg: "bg-[#c2542f]/10",
  },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const card: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function Features() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="bg-sand py-20 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-clay">
            O que está incluído
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-bark sm:text-4xl">
            Tudo que o hóspede precisa
          </h2>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid gap-4 sm:grid-cols-2"
        >
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                variants={card}
                className="rounded-3xl bg-cream p-6 shadow-[0_2px_24px_rgba(58,46,38,0.06)] ring-1 ring-line"
              >
                <div className={`mb-4 inline-flex rounded-xl p-3 ${f.bg}`}>
                  <Icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-bark">{f.title}</h3>
                <p className="text-sm leading-relaxed text-stone">{f.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
