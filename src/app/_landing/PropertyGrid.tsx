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
    <motion.div variants={card} className="h-full">
      <Link
        href={`/${p.code}`}
        className="group flex h-full flex-col overflow-hidden rounded-3xl bg-cream shadow-[0_2px_24px_rgba(58,46,38,0.06)] ring-1 ring-line transition hover:shadow-md hover:ring-clay"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-sand">
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
                ? "bg-cream/90 text-bark"
                : "bg-clay/90 text-white"
            }`}
          >
            {p.type === "seed" ? "Exemplo" : "Seazone"}
          </span>
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col p-4">
          <p className="line-clamp-2 min-h-[3.25rem] font-display text-lg font-semibold leading-snug text-bark">
            {p.name}
          </p>
          <div className="mt-auto flex items-center justify-between pt-2">
            <p className="text-sm text-stone">
              {p.city} — {p.state}
            </p>
            <span className="font-mono text-xs text-clay">/{p.code}</span>
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
    <section ref={ref} id="imoveis" className="bg-sand py-20 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-clay">
            Guias disponíveis
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-bark sm:text-4xl">
            Explore os imóveis
          </h2>
          <p className="mt-3 text-stone">
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
