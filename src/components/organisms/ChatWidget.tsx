"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

const SUGGESTIONS = [
  "Qual a senha do WiFi?",
  "Posso trazer meu cachorro?",
  "A que horas posso fazer check-in?",
  "Que restaurantes tem perto?",
];

function messageText(parts: { type: string; text?: string }[]): string {
  return parts
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("");
}

export function ChatWidget({ code }: { code: string }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  const { messages, sendMessage, regenerate, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat", body: { code } }),
  });

  const busy = status === "submitted" || status === "streaming";

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-sky-600 text-2xl text-white shadow-lg transition hover:bg-sky-700 active:scale-95"
        aria-label={open ? "Fechar assistente" : "Abrir assistente virtual"}
      >
        {open ? "✕" : "💬"}
      </button>

      {/* Painel */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex h-[80vh] flex-col rounded-t-2xl bg-white shadow-2xl ring-1 ring-slate-200 sm:inset-x-auto sm:bottom-24 sm:right-5 sm:h-[32rem] sm:w-96 sm:rounded-2xl">
          <header className="rounded-t-2xl bg-sky-600 px-4 py-3 text-white">
            <p className="font-semibold">Assistente da estadia</p>
            <p className="text-xs text-sky-100">
              Tire dúvidas sobre o imóvel e a região
            </p>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-slate-500">
                  Olá! 👋 Como posso ajudar? Experimente:
                </p>
                <div className="flex flex-col gap-2">
                  {SUGGESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => send(q)}
                      className="rounded-xl bg-slate-50 px-3 py-2 text-left text-sm text-slate-700 ring-1 ring-slate-200 transition hover:bg-sky-50 hover:ring-sky-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={m.role === "user" ? "text-right" : "text-left"}
              >
                <span
                  className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-sky-600 text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {messageText(m.parts)}
                </span>
              </div>
            ))}

            {status === "submitted" && (
              <div className="text-left">
                <span className="inline-flex gap-1 rounded-2xl bg-slate-100 px-3 py-2.5">
                  <Dot /> <Dot delay={150} /> <Dot delay={300} />
                </span>
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
                Ops, algo deu errado ao responder.{" "}
                <button
                  type="button"
                  onClick={() => regenerate()}
                  className="font-medium underline underline-offset-2 hover:text-rose-900"
                >
                  Tentar de novo
                </button>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2 border-t border-slate-100 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua pergunta…"
              className="flex-1 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-800 ring-1 ring-slate-200 outline-none focus:ring-sky-300"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-40"
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <span
      className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}
