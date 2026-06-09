# Parallel Suspense Islands Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Quebrar a pagina `/[code]` em ilhas de Suspense independentes, onde cada secao mostra seu proprio skeleton imediatamente e carrega em paralelo via `use()` do React 19.

**Architecture:** `page.tsx` cria `propertyPromise = getProperty(code)` sem `await` e passa a mesma Promise como prop para quatro novos Server Components em `_sections/`. Cada section usa `use(propertyPromise)` para suspender individualmente, envolto em `<Suspense>` com fallback skeleton proprio. `ExperienceGuideClient` permanece inalterado como client island.

**Tech Stack:** React 19 `use()`, Next.js App Router Suspense streaming, TypeScript

---

## Mapa de arquivos

| Acao | Arquivo |
|---|---|
| Criar | `src/app/[code]/_sections/HeroSection.tsx` |
| Criar | `src/app/[code]/_sections/AccessSection.tsx` |
| Criar | `src/app/[code]/_sections/RulesSection.tsx` |
| Criar | `src/app/[code]/_sections/ContactSection.tsx` |
| Modificar | `src/app/[code]/page.tsx` |
| Modificar | `src/app/[code]/loading.tsx` |

Componentes presentacionais (`PropertyHero`, `AccessCard`, `RulesCard`, `ContactCard`, `AmenityList`, `ExperienceGuideClient`, `ChatWidget`) e `src/lib/properties.ts` **nao sao alterados**.

---

### Task 1: HeroSection

**Files:**
- Create: `src/app/[code]/_sections/HeroSection.tsx`

- [ ] **Step 1: Criar o arquivo**

```tsx
import { use } from "react";
import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import { PropertyHero } from "@/components/organisms/PropertyHero";
import { AmenityList } from "@/components/molecules/AmenityList";
import { Section } from "@/components/atoms/Section";
import { Reveal } from "@/components/atoms/Reveal";
import type { Property } from "@/lib/types";

export function HeroSection({
  propertyPromise,
}: {
  propertyPromise: Promise<Property | null>;
}) {
  const property = use(propertyPromise);
  if (!property) notFound();
  return (
    <>
      <Reveal>
        <PropertyHero property={property} />
      </Reveal>
      <Reveal delay={0.05}>
        <Section title="Amenidades" icon={<Sparkles className="h-5 w-5" />}>
          <AmenityList amenities={property.amenities} />
        </Section>
      </Reveal>
    </>
  );
}

export function HeroSkeleton() {
  return (
    <>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="aspect-[16/10] w-full animate-pulse bg-slate-200 sm:aspect-[2/1]" />
        <div className="grid grid-cols-3 gap-3 p-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 h-5 w-40 animate-pulse rounded bg-slate-200" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-7 w-20 animate-pulse rounded-full bg-slate-100" />
          ))}
        </div>
      </div>
    </>
  );
}
```

Nota: Hero e Amenidades compartilham o mesmo `<Suspense>` no `page.tsx` (resolvem juntos, mesma Promise).

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Esperado: sem erros relacionados a `HeroSection.tsx`.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[code]/_sections/HeroSection.tsx"
git commit -m "feat: HeroSection com use() e HeroSkeleton"
```

---

### Task 2: AccessSection

**Files:**
- Create: `src/app/[code]/_sections/AccessSection.tsx`

- [ ] **Step 1: Criar o arquivo**

```tsx
import { use } from "react";
import { AccessCard } from "@/components/organisms/AccessCard";
import { Reveal } from "@/components/atoms/Reveal";
import type { Property } from "@/lib/types";

export function AccessSection({
  propertyPromise,
}: {
  propertyPromise: Promise<Property | null>;
}) {
  const property = use(propertyPromise);
  if (!property) return null;
  return (
    <Reveal delay={0.1}>
      <AccessCard operational={property.operational} />
    </Reveal>
  );
}

export function AccessSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 h-5 w-40 animate-pulse rounded bg-slate-200" />
      <div className="flex flex-col gap-2.5">
        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Esperado: sem erros relacionados a `AccessSection.tsx`.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[code]/_sections/AccessSection.tsx"
git commit -m "feat: AccessSection com use() e AccessSkeleton"
```

---

### Task 3: RulesSection

**Files:**
- Create: `src/app/[code]/_sections/RulesSection.tsx`

- [ ] **Step 1: Criar o arquivo**

```tsx
import { use } from "react";
import { RulesCard } from "@/components/organisms/RulesCard";
import { Reveal } from "@/components/atoms/Reveal";
import type { Property } from "@/lib/types";

export function RulesSection({
  propertyPromise,
}: {
  propertyPromise: Promise<Property | null>;
}) {
  const property = use(propertyPromise);
  if (!property) return null;
  return (
    <Reveal delay={0.15}>
      <RulesCard rules={property.rules} />
    </Reveal>
  );
}

export function RulesSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 h-5 w-40 animate-pulse rounded bg-slate-200" />
      <div className="flex flex-col gap-2.5">
        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[code]/_sections/RulesSection.tsx"
git commit -m "feat: RulesSection com use() e RulesSkeleton"
```

---

### Task 4: ContactSection

**Files:**
- Create: `src/app/[code]/_sections/ContactSection.tsx`

- [ ] **Step 1: Criar o arquivo**

```tsx
import { use } from "react";
import { ContactCard } from "@/components/organisms/ContactCard";
import { Reveal } from "@/components/atoms/Reveal";
import type { Property } from "@/lib/types";

export function ContactSection({
  propertyPromise,
}: {
  propertyPromise: Promise<Property | null>;
}) {
  const property = use(propertyPromise);
  if (!property) return null;
  return (
    <Reveal delay={0.2}>
      <ContactCard host={property.host} address={property.address} />
    </Reveal>
  );
}

export function ContactSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 h-5 w-40 animate-pulse rounded bg-slate-200" />
      <div className="flex flex-col gap-2.5">
        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[code]/_sections/ContactSection.tsx"
git commit -m "feat: ContactSection com use() e ContactSkeleton"
```

---

### Task 5: Reescrever page.tsx

**Files:**
- Modify: `src/app/[code]/page.tsx`

Remove o `await getProperty(code)` do render path. A page passa a ser quase-sincrona (so aguarda `params`). Cada section recebe a Promise e suspende individualmente.

`generateMetadata` mantem `await getProperty` pois roda em build time, fora do render path de streaming.

- [ ] **Step 1: Substituir o conteudo completo do arquivo**

```tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllPropertyCodes, getProperty } from "@/lib/properties";
import { ExperienceGuideClient } from "@/components/organisms/ExperienceGuideClient";
import { ChatWidget } from "@/components/organisms/ChatWidget";
import { HeroSection, HeroSkeleton } from "./_sections/HeroSection";
import { AccessSection, AccessSkeleton } from "./_sections/AccessSection";
import { RulesSection, RulesSkeleton } from "./_sections/RulesSection";
import { ContactSection, ContactSkeleton } from "./_sections/ContactSection";

export async function generateStaticParams() {
  const codes = await getAllPropertyCodes();
  return codes.map((code) => ({ code }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[code]">): Promise<Metadata> {
  const { code } = await params;
  const property = await getProperty(code);
  if (!property) return { title: "Imóvel não encontrado · Guia Seazone" };
  return {
    title: `${property.name} · Guia do Hóspede`,
    description: `Tudo sobre sua estadia em ${property.address.city}.`,
  };
}

export default async function PropertyGuidePage({
  params,
}: PageProps<"/[code]">) {
  const { code } = await params;
  const propertyPromise = getProperty(code);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6">
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection propertyPromise={propertyPromise} />
      </Suspense>

      <Suspense fallback={<AccessSkeleton />}>
        <AccessSection propertyPromise={propertyPromise} />
      </Suspense>

      <Suspense fallback={<RulesSkeleton />}>
        <RulesSection propertyPromise={propertyPromise} />
      </Suspense>

      <ExperienceGuideClient key={code} code={code} />

      <Suspense fallback={<ContactSkeleton />}>
        <ContactSection propertyPromise={propertyPromise} />
      </Suspense>

      <ChatWidget code={code} />
    </main>
  );
}
```

- [ ] **Step 2: Verificar tipos e lint**

```bash
npx tsc --noEmit 2>&1 | head -40
npm run lint 2>&1 | tail -20
```

Esperado: 0 erros de tipo, lint limpo.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[code]/page.tsx"
git commit -m "refactor: page usa Suspense islands com use() por secao"
```

---

### Task 6: Simplificar loading.tsx

**Files:**
- Modify: `src/app/[code]/loading.tsx`

Com a page quase-sincrona, o `loading.tsx` exibe por milissegundos antes do primeiro chunk de stream chegar. Simplificar para espelhar apenas o `HeroSkeleton`, eliminando os 3 cartoes genericos que agora cada section controla.

- [ ] **Step 1: Substituir o conteudo completo do arquivo**

```tsx
export default function LoadingProperty() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="aspect-[16/10] w-full animate-pulse bg-slate-200 sm:aspect-[2/1]" />
        <div className="grid grid-cols-3 gap-3 p-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[code]/loading.tsx"
git commit -m "chore: simplifica loading.tsx (cada section tem skeleton proprio)"
```

---

### Task 7: Validacao final

**Files:** nenhum novo arquivo

- [ ] **Step 1: Executar suite completa**

```bash
npm run lint && npx tsc --noEmit && npm test
```

Esperado: 0 erros de lint, 0 erros de tipo, todos os testes passando (os testes existentes sao para `chat-context` e `labels`, nao afetados por esta mudanca).

- [ ] **Step 2: Smoke test em dev**

```bash
npm run dev
```

Abrir `http://localhost:3000/FLN001` e verificar:

1. A pagina comeca a exibir skeletons antes de qualquer dado chegar (nao ha tela em branco)
2. Hero, Amenidades, Access, Rules e Contact revelam com o Reveal animation quando `getProperty` resolve
3. O guia de experiencias mostra seu spinner independentemente (client island)
4. Navegar para `http://localhost:3000/GRM001` e repetir a verificacao
5. Acessar um codigo invalido (ex: `/INVALIDO`) e confirmar que a pagina not-found aparece

- [ ] **Step 3: Verificar que nao ha arquivos sujos**

```bash
git status
```

Esperado: `nothing to commit, working tree clean`. Se houver ajuste residual, commitar com `git add -p && git commit -m "fix: ajuste pos-validacao"`.
