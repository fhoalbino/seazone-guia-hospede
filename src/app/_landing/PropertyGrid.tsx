"use client";

import { motion, useInView, type Variants } from "motion/react";
import { useRef } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";

export interface PropertyCard {
  code: string;
  name: string;
  city: string;
  state: string;
  type: "seed" | "real";
  image?: string;
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const card: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

function Card({ p }: { p: PropertyCard }) {
  return (
    <motion.div variants={card}>
      <Link
        href={`/${p.code}`}
        className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:shadow-md hover:ring-sky-300"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          {p.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.image}
              alt={p.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-300">
              <MapPin className="h-10 w-10" />
            </div>
          )}
          {/* Badge */}
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              p.type === "seed"
                ? "bg-white/90 text-slate-700"
                : "bg-sky-500/90 text-white"
            }`}
          >
            {p.type === "seed" ? "Exemplo" : "Seazone"}
          </span>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="font-semibold text-slate-900 leading-snug">{p.name}</p>
          <div className="mt-1 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {p.city} — {p.state}
            </p>
            <span className="font-mono text-xs text-sky-600">/{p.code}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function PropertyGrid({ properties }: { properties: PropertyCard[] }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} id="imoveis" className="bg-white py-20 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-sky-600">
            Guias disponíveis
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            Explore os imóveis
          </h2>
          <p className="mt-3 text-slate-500">
            Clique em qualquer imóvel para abrir o guia completo do hóspede.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {properties.map((p) => (
            <Card key={p.code} p={p} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
