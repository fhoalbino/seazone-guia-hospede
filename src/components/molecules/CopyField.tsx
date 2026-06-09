"use client";

import { useState } from "react";

interface CopyFieldProps {
  label: string;
  value: string;
  mono?: boolean;
}

/** Campo de credencial (senha WiFi, código de acesso) com botão copiar. */
export function CopyField({ label, value, mono = true }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard pode falhar (http/perm) — ignora silenciosamente
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p
          className={`truncate text-slate-800 ${mono ? "font-mono" : "font-medium"}`}
        >
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-sky-700 ring-1 ring-sky-200 transition hover:bg-sky-50 active:scale-95"
        aria-label={`Copiar ${label}`}
      >
        {copied ? "Copiado ✓" : "Copiar"}
      </button>
    </div>
  );
}
