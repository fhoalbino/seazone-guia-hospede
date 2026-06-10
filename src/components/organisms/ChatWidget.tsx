"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Drawer } from "vaul";
import { AnimatePresence, motion } from "motion/react";
import { MessageCircle, Trash2, X } from "lucide-react";
import { Markdown } from "@/components/atoms/Markdown";

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

  const { messages, sendMessage, regenerate, setMessages, status, error } =
    useChat({
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
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        className="fixed right-5 bottom-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-clay text-white shadow-lg"
        aria-label="Abrir assistente virtual"
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>

      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex h-[82vh] flex-col overflow-hidden rounded-t-2xl bg-white outline-none sm:inset-x-auto sm:right-5 sm:h-[620px] sm:w-[26rem]">
            {/* alça de arrastar (mobile) */}
            <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-slate-300 sm:hidden" />

            <div className="flex items-start justify-between gap-2 px-4 pt-3 pb-2 sm:pt-4">
              <div>
                <Drawer.Title className="text-base font-semibold text-slate-900">
                  Assistente da estadia
                </Drawer.Title>
                <Drawer.Description className="text-xs text-slate-500">
                  Tire dúvidas sobre o imóvel e a região
                </Drawer.Description>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setMessages([])}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Limpar conversa"
                    title="Limpar conversa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="hidden rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 sm:inline-flex"
                  aria-label="Fechar"
                  title="Fechar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto border-t border-slate-100 p-4">
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
                        className="rounded-xl bg-slate-50 px-3 py-2 text-left text-sm text-slate-700 ring-1 ring-slate-200 transition hover:bg-clay/10 hover:ring-clay/30"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={m.role === "user" ? "text-right" : "text-left"}
                  >
                    <span
                      className={`inline-block max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                        m.role === "user"
                          ? "whitespace-pre-wrap bg-clay text-white"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {m.role === "user" ? (
                        messageText(m.parts)
                      ) : (
                        <Markdown>{messageText(m.parts)}</Markdown>
                      )}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>

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
                className="flex-1 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-800 ring-1 ring-slate-200 outline-none focus:ring-clay/50"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="rounded-xl bg-clay px-4 py-2 text-sm font-medium text-white transition hover:bg-clay-dark disabled:opacity-40"
              >
                Enviar
              </button>
            </form>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
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
