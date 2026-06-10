"use client";

import dynamic from "next/dynamic";

// Carrega o ChatWidget (vaul + motion + react-markdown) só no cliente, em um
// chunk separado, tirando ~172KB do bundle inicial da página. O botão flutuante
// aparece após a hidratação. `ssr: false` exige um Client Component (Next 16).
const ChatWidget = dynamic(
  () => import("@/components/organisms/ChatWidget").then((m) => m.ChatWidget),
  { ssr: false }
);

export function ChatWidgetLazy({ code }: { code: string }) {
  return <ChatWidget code={code} />;
}
