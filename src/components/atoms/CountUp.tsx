"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";

/** Conta de 0 até `value` quando entra na viewport. */
export function CountUp({ value, duration = 0.9 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, duration]);

  return <span ref={ref}>{display}</span>;
}
