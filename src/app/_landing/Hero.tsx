"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0B1E3D] text-white">
      {/* Background subtle radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(14,165,233,0.18),transparent)]" />

      <div className="relative mx-auto max-w-5xl px-6 pb-36 pt-20 text-center sm:pb-44 sm:pt-28">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center gap-7"
        >
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1.5 text-sm font-medium text-sky-300">
              <Sparkles className="h-3.5 w-3.5" />
              Guia gerado por IA · Assistente em tempo real
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl"
          >
            Tudo sobre sua estadia,{" "}
            <span className="text-sky-400">na palma da mão</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="max-w-xl text-lg leading-relaxed text-slate-300"
          >
            Guia digital personalizado por imóvel: acesso, WiFi, regras,
            experiências locais e assistente virtual — tudo em um link.
          </motion.p>

          <motion.div variants={item} className="flex flex-wrap justify-center gap-3">
            <Link
              href="/FLN001"
              className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-400 hover:shadow-sky-400/30"
            >
              Ver guia de exemplo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#imoveis"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 font-medium text-white transition hover:bg-white/10"
            >
              Explorar imóveis
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={item}
            className="mt-4 flex flex-wrap justify-center gap-8 text-sm text-slate-400"
          >
            {[
              { n: "20+", label: "imóveis disponíveis" },
              { n: "IA", label: "guia contextualizado" },
              { n: "24h", label: "assistente virtual" },
            ].map(({ n, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold text-white">{n}</span>
                <span>{label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Wave separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 96"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0,48 C240,96 480,0 720,48 C960,96 1200,16 1440,48 L1440,96 L0,96 Z"
            fill="#f1f5f9"
          />
        </svg>
      </div>
    </section>
  );
}
