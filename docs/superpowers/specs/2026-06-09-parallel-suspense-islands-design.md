# Design: Parallel Suspense Islands com `use()` por Secao

**Data:** 2026-06-09
**Status:** Aprovado

## Problema

O `page.tsx` de `/[code]` faz `await getProperty(code)` no topo. Isso bloqueia a renderizacao da pagina inteira ate a Promise resolver. O shimmer de `loading.tsx` so aparece durante esse bloqueio inicial e cobre a pagina toda. Depois que a page resolve, o `ExperienceGuideClient` inicia seu fetch client-side (waterfall duplo). O usuario ve tela em branco ou shimmer global antes de qualquer conteudo.

## Objetivo

Cada secao da pagina deve:
- Mostrar seu proprio skeleton imediatamente ao navegar
- Carregar seus dados de forma independente e em paralelo com as outras secoes
- Revelar seu conteudo quando pronto, sem esperar as demais secoes

## Solucao: Promise Compartilhada + `use()` em Server Components

### Fluxo de dados

`page.tsx` cria `propertyPromise = getProperty(code)` **sem `await`** e passa a mesma instancia de Promise como prop para cada Section component. Cada Section e um Server Component que chama `use(propertyPromise)` para suspender individualmente. A Promise e criada uma unica vez, sem necessidade de `cache()`.

```
page.tsx
  propertyPromise = getProperty(code)   // sem await

  <Suspense fallback={<HeroSkeleton />}>
    <HeroSection propertyPromise={propertyPromise} />

  <Suspense fallback={<CardSkeleton />}>
    <AccessSection propertyPromise={propertyPromise} />

  <Suspense fallback={<CardSkeleton />}>
    <RulesSection propertyPromise={propertyPromise} />

  <ExperienceGuideClient code={code} />   // client island, inalterado

  <Suspense fallback={<CardSkeleton />}>
    <ContactSection propertyPromise={propertyPromise} />
```

### Novos arquivos

Todos em `src/app/[code]/_sections/` (colocados com a rota, prefixo `_` = privado do Next.js):

| Arquivo | Responsabilidade |
|---|---|
| `HeroSection.tsx` | `use(propertyPromise)`, chama `notFound()` se null, renderiza `PropertyHero` + `AmenityList` com seus skeletons |
| `AccessSection.tsx` | `use(propertyPromise)`, renderiza `AccessCard` |
| `RulesSection.tsx` | `use(propertyPromise)`, renderiza `RulesCard` |
| `ContactSection.tsx` | `use(propertyPromise)`, renderiza `ContactCard` |

Cada arquivo exporta o componente principal e um `*Skeleton` inline usado como fallback no `<Suspense>` do `page.tsx`.

### Tratamento de `notFound()`

O `notFound()` migra do `page.tsx` para o `HeroSection` (primeiro a renderizar). Se `use(propertyPromise)` retornar `null`, o `HeroSection` chama `notFound()`. As demais sections nao precisam checar, pois o `notFound()` lanca uma excecao que aborta o render da pagina.

### `loading.tsx`

Simplificado para cobrir apenas a navegacao inicial (antes do primeiro byte da page chegar). Mantem o shimmer do hero. Os cartoes abaixo nao precisam mais de skeleton global pois cada Section tem o proprio.

### `ExperienceGuideClient`

Inalterado. Com a page nao-bloqueante, o HTML inicial chega mais cedo ao browser, o componente hidrata antes e inicia seu fetch client-side mais cedo. O skeleton existente (`GuideSkeleton`) continua sendo o fallback visual.

## Efeito observavel

**Antes:**
1. Navegacao - tela em branco / `loading.tsx` global
2. `getProperty` resolve - pagina inteira aparece de uma vez
3. Cliente hidrata - `ExperienceGuideClient` inicia fetch
4. Guia aparece

**Depois:**
1. Navegacao - skeletons de cada secao aparecem imediatamente (streaming)
2. `getProperty` resolve - todas as secoes de propriedade revelam juntas (mesma Promise)
3. Cliente ja hidratou mais cedo - `ExperienceGuideClient` ja iniciou fetch
4. Guia aparece independentemente

## O que NAO muda

- `getProperty` em `src/lib/properties.ts` - sem alteracoes
- `ExperienceGuideClient` e `/api/guide/[code]` - sem alteracoes
- Todos os componentes presentacionais (`PropertyHero`, `AccessCard`, etc.) - sem alteracoes
- `generateStaticParams` e `generateMetadata` - sem alteracoes (podem usar `await getProperty` pois rodam em build time / fora do render path)

## Restricoes

- `use()` em Server Components requer React 19 (Next.js 15+ usa React 19 por padrao, satisfeito)
- Sections em `_sections/` sao Server Components por padrao - sem `"use client"`
- Nao introduzir `cache()` do React (desnecessario - a Promise e a mesma instancia)
