"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

/** Envolve conteúdo (renderizado no servidor) numa entrada suave fade-in-up. */
export function Reveal({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
