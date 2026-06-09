---
description: Mandatory Next.js App Router patterns. Loads when editing files in app/.
paths:
  - "app/**/*.tsx"
  - "app/**/*.ts"
---

# Next.js Patterns

> Mandatory patterns for Next.js App Router based on official Vercel documentation (Next.js 15+).

---

## Fundamental Rules

```
ALL COMPONENTS IN src/app/ ARE SERVER COMPONENTS BY DEFAULT
'use client' ONLY WHERE INTERACTIVITY IS NEEDED
PUSH 'use client' AS FAR DOWN THE TREE AS POSSIBLE
```

---

## 1. Server Components vs Client Components

### When to Use Each

| Need | Component |
|------|-----------|
| State (`useState`, `useReducer`) | Client |
| Event handlers (`onClick`, `onChange`) | Client |
| Lifecycle (`useEffect`) | Client |
| Browser APIs (`localStorage`, `window`) | Client |
| Custom hooks that use state/effects | Client |
| Fetch data close to the source | Server |
| Access secrets/API keys | Server |
| Reduce JS bundle size | Server |
| Static UI (no interactivity) | Server |

### Golden Rule

```
Server Component = default. Only add 'use client' when you NEED interactivity.
```

---

## 2. `'use client'` Directive

### Placement Rules

`'use client'` declares a **boundary** between server and client module graphs. Once a file has it, **all its imports and children are part of the client bundle**.

```tsx
// BAD - 'use client' on a page that is mostly static
'use client'

export default function PropertyPage({ property }) {
  // 200 lines of static UI...
  // 1 interactive button at the bottom
  return (
    <div>
      <h1>{property.name}</h1>
      <p>{property.description}</p>
      {/* ... lots of static content ... */}
      <button onClick={() => setLiked(true)}>Like</button>
    </div>
  )
}

// GOOD - push 'use client' to the leaf component
// page.tsx (Server Component - default)
export default function PropertyPage({ property }) {
  return (
    <div>
      <h1>{property.name}</h1>
      <p>{property.description}</p>
      {/* ... lots of static content stays on the server ... */}
      <LikeButton propertyId={property.id} />
    </div>
  )
}

// like-button/index.tsx (Client Component)
'use client'
export default function LikeButton({ propertyId }: { propertyId: string }) {
  const [liked, setLiked] = useState(false)
  return <button onClick={() => setLiked(true)}>Like</button>
}
```

### Push-Down Pattern

Always push `'use client'` to the **smallest possible component** that needs interactivity.

```
// BAD - large client boundary
page.tsx ('use client')
├── Header (now client too!)
├── PropertyDetails (now client too!)
├── AmenityList (now client too!)
└── BookingForm (the only part that needs it)

// GOOD - minimal client boundary
page.tsx (Server Component)
├── Header (Server Component)
├── PropertyDetails (Server Component)
├── AmenityList (Server Component)
└── BookingForm ('use client' - only this)
```

**Why?** Less JavaScript shipped to the browser = faster page load.

---

## 3. Composition Patterns

### Interleaving Server and Client Components

You can pass Server Components as `children` to Client Components. This keeps Server Components on the server.

```tsx
// modal/index.tsx — Client Component
'use client'

export default function Modal({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open</button>
      {isOpen && <div className="modal">{children}</div>}
    </>
  )
}

// page.tsx — Server Component
import Modal from './_domain/components/modal'
import PropertyDetails from './_domain/components/property-details'

export default function Page() {
  return (
    <Modal>
      <PropertyDetails /> {/* Rendered on server, passed as children */}
    </Modal>
  )
}
```

### Context Providers

React Context is NOT supported in Server Components. Providers must be Client Components.

```tsx
// BAD - trying to use context in a Server Component
export default function Layout({ children }) {
  const theme = useContext(ThemeContext) // Error!
  return <div>{children}</div>
}

// GOOD - Provider is a Client Component, used in Server Component layout
// _domain/providers/checkout-provider.tsx
'use client'
export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initialState)
  return (
    <CheckoutContext.Provider value={{ state, setState }}>
      {children}
    </CheckoutContext.Provider>
  )
}

// layout.tsx — Server Component
import { CheckoutProvider } from './_domain/providers/checkout-provider'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <CheckoutProvider>{children}</CheckoutProvider>
}
```

**Rule:** Render providers as deep as possible in the tree. Don't wrap the entire `<html>` if only a subtree needs it.

### Third-Party Components

Third-party components that use client features need a wrapper:

```tsx
// BAD - using a client-only library directly in Server Component
import { Carousel } from 'some-carousel-lib'

export default function Page() {
  return <Carousel /> // Error: uses useState internally
}

// GOOD - wrap it in a Client Component
// carousel/index.tsx
'use client'
import { Carousel } from 'some-carousel-lib'
export default Carousel

// page.tsx
import Carousel from './_domain/components/carousel'
export default function Page() {
  return <Carousel /> // Works!
}
```

---

## 4. Data Fetching

### Server Components — Fetch Directly

In Server Components, you can fetch data directly with `async/await`. No need for `useEffect` or React Query.

```tsx
// GOOD - direct fetch in Server Component
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const property = await getProperty(id)

  return (
    <div>
      <h1>{property.name}</h1>
      <PropertyDetails property={property} />
      <BookingForm propertyId={id} /> {/* Client Component for interactivity */}
    </div>
  )
}
```

### Client Components — Use React Query

In Client Components, always use React Query (already in our stack). Never use raw `useEffect` for data fetching.

```tsx
// BAD - useEffect for fetching in Client Component
'use client'
function PropertyList() {
  const [properties, setProperties] = useState([])

  useEffect(() => {
    fetch('/api/properties').then(r => r.json()).then(setProperties)
  }, [])

  return <List items={properties} />
}

// GOOD - React Query in Client Component
'use client'
function PropertyList() {
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => getProperties(),
  })

  return <List items={properties ?? []} />
}
```

### Parallel Data Fetching

When fetching multiple resources, use `Promise.all` to avoid waterfalls:

```tsx
// BAD - sequential fetches (waterfall)
export default async function Page({ params }) {
  const { id } = await params
  const property = await getProperty(id)      // waits...
  const reviews = await getReviews(id)         // then waits...
  const availability = await getAvailability(id) // then waits...
}

// GOOD - parallel fetches
export default async function Page({ params }) {
  const { id } = await params
  const [property, reviews, availability] = await Promise.all([
    getProperty(id),
    getReviews(id),
    getAvailability(id),
  ])
}
```

### Streaming with `use` API

Pass a promise from Server to Client Component and resolve it with React's `use`:

```tsx
// page.tsx (Server Component)
import { Suspense } from 'react'
import PropertyGallery from './_domain/components/property-gallery'

export default function Page({ params }) {
  const images = getPropertyImages(params.id) // Don't await!

  return (
    <Suspense fallback={<GallerySkeleton />}>
      <PropertyGallery images={images} />
    </Suspense>
  )
}

// property-gallery/index.tsx (Client Component)
'use client'
import { use } from 'react'

export default function PropertyGallery({ images }: { images: Promise<Image[]> }) {
  const allImages = use(images) // Resolves the promise
  return <Gallery items={allImages} />
}
```

---

## 5. Loading States (`loading.tsx`)

### How It Works

`loading.tsx` in a route folder automatically wraps `page.tsx` in a `<Suspense>` boundary. It shows instantly during navigation while the page loads.

```
app/v2/checkout/
├── layout.tsx
├── loading.tsx    ← Shows while page.tsx loads
├── page.tsx
└── _domain/
```

### Rules

1. **Always create `loading.tsx`** for routes with data fetching.
2. **Use meaningful skeletons**, not just "Loading..." text.
3. For granular control, use `<Suspense>` directly around slow components.

```tsx
// loading.tsx — skeleton that mirrors the page structure
import { Skeleton } from '@/components/UI/Shimmer'

export default function Loading() {
  return (
    <main className="max-w-[1200px] mx-auto p-4">
      <Skeleton className="h-8 w-48 rounded-full" />
      <div className="grid grid-cols-[2fr_1fr] gap-4 mt-4">
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </main>
  )
}
```

### Granular Suspense

For pages with multiple data sources, wrap each section individually:

```tsx
// GOOD - independent loading for each section
import { Suspense } from 'react'

export default function PropertyPage({ params }) {
  return (
    <div>
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection propertyId={params.id} />
      </Suspense>
      <Suspense fallback={<ReviewsSkeleton />}>
        <ReviewsSection propertyId={params.id} />
      </Suspense>
      <Suspense fallback={<AvailabilitySkeleton />}>
        <AvailabilitySection propertyId={params.id} />
      </Suspense>
    </div>
  )
}
```

---

## 6. Error Handling (`error.tsx`)

### Rules

1. `error.tsx` **must be a Client Component** (`'use client'`).
2. It wraps `page.tsx` in a React Error Boundary.
3. It does **NOT** catch errors in `layout.tsx` of the same segment.
4. For root layout errors, use `global-error.tsx`.

```tsx
// error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <h2>Something went wrong</h2>
      <p className="text-[var(--muted-foreground)]">{error.message}</p>
      <button
        className="rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-2"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  )
}
```

### File Hierarchy

```
error.tsx wraps:   loading.tsx → not-found.tsx → page.tsx → nested layouts
error.tsx does NOT wrap: layout.tsx or template.tsx of the SAME segment
```

---

## 7. Not Found (`not-found.tsx`)

Use `not-found.tsx` for 404 UI and call `notFound()` to trigger it:

```tsx
// not-found.tsx
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <h2>Page not found</h2>
      <a href="/" className="text-[var(--primary)]">Go home</a>
    </div>
  )
}

// page.tsx
import { notFound } from 'next/navigation'

export default async function Page({ params }) {
  const property = await getProperty(params.id)
  if (!property) notFound()

  return <PropertyDetails property={property} />
}
```

---

## 8. `next/image` and `next/link`

### Image

Always use `next/image` instead of `<img>`. It optimizes images automatically.

```tsx
import Image from 'next/image'

// Required: src, alt, width + height (or fill)
<Image src="/hero.jpg" alt="Property exterior" width={800} height={600} />

// For unknown dimensions, use fill + sizes
<div className="relative w-full h-64">
  <Image src={url} alt="Property" fill sizes="100vw" className="object-cover" />
</div>

// LCP images: add priority
<Image src="/hero.jpg" alt="Hero" width={1200} height={800} priority />
```

| Rule | Details |
|------|---------|
| Always provide `alt` | Accessibility requirement |
| Use `priority` for LCP images | Above-the-fold hero images |
| Use `fill` for dynamic sizes | Pair with `sizes` prop |
| Use `sizes` when using `fill` | Helps browser pick the right image size |

### Link

Always use `next/link` instead of `<a>` for internal navigation. It enables prefetching and client-side navigation.

```tsx
import Link from 'next/link'

// Internal navigation — always use Link
<Link href="/rooms/123">View property</Link>

// External links — use regular <a>
<a href="https://external.com" target="_blank" rel="noopener noreferrer">External</a>
```

| Rule | Details |
|------|---------|
| Internal routes → `<Link>` | Enables prefetching and SPA navigation |
| External URLs → `<a>` | `Link` is for internal routes only |
| `prefetch={false}` | For rarely visited links |
| `scroll={false}` | To preserve scroll position |

---

## 9. Environment Safety

### Environment Variables

Only variables prefixed with `NEXT_PUBLIC_` are included in the client bundle. Non-prefixed variables are replaced with empty strings on the client.

```tsx
// Server Component — safe
const data = await fetch(url, {
  headers: { authorization: process.env.API_KEY }  // Works, never sent to client
})

// Client Component — only NEXT_PUBLIC_ vars
'use client'
const analyticsId = process.env.NEXT_PUBLIC_POSTHOG_KEY  // Works
const secret = process.env.API_KEY  // undefined on client!
```

### Props Must Be Serializable

Data passed from Server to Client Components must be serializable (no functions, classes, or Date objects).

```tsx
// BAD - passing non-serializable data
<ClientComponent
  onClick={() => console.log('hi')}  // Functions are not serializable!
  date={new Date()}                   // Date is not serializable!
/>

// GOOD - pass serializable data
<ClientComponent
  propertyId={property.id}     // string
  price={property.price}       // number
  checkIn={checkIn.toISOString()}  // string
/>
```

---

## Decision Tree — Server or Client?

```
Does this component need...
│
├─ useState, useReducer, or useRef for UI state?
│  └─ CLIENT Component
│
├─ Event handlers (onClick, onChange, onSubmit)?
│  └─ CLIENT Component
│
├─ useEffect, or browser APIs (window, localStorage)?
│  └─ CLIENT Component
│
├─ Context (useContext)?
│  └─ CLIENT Component (but wrap children as Server Components)
│
├─ Data fetching only?
│  └─ SERVER Component (async/await directly)
│
├─ Static UI with no interactivity?
│  └─ SERVER Component
│
└─ Third-party component that uses client features?
   └─ Wrap in a CLIENT Component
```

---

## Decision Tree — Where to Place `'use client'`

```
Where should 'use client' go?
│
├─ The whole page needs interactivity?
│  └─ Unlikely. Split into server layout + client sections
│
├─ One section of the page needs state?
│  └─ Extract that section into its own Client Component
│
├─ A button or input needs onClick/onChange?
│  └─ Extract just that component as Client
│
├─ A third-party library needs client features?
│  └─ Create a thin wrapper: 'use client' + re-export
│
└─ A provider needs context?
   └─ Provider is Client Component, children stay Server
```

---

## Checklist

Before finalizing an App Router page:

### Components
```
[ ] Page and layout are Server Components (no 'use client')
[ ] 'use client' only on leaf components that need interactivity
[ ] Third-party client libraries wrapped in Client Components
[ ] Providers are Client Components placed as deep as possible
[ ] Server Components passed as children to Client Components (not imported inside)
```

### Data
```
[ ] Server Components fetch data directly (async/await)
[ ] Client Components use React Query (not useEffect for fetching)
[ ] Parallel fetches use Promise.all (no waterfalls)
[ ] Props from Server to Client are serializable
[ ] No secrets/API keys in Client Components
```

### File Conventions
```
[ ] loading.tsx exists for routes with data fetching (meaningful skeletons)
[ ] error.tsx exists for routes that can fail (must be 'use client')
[ ] not-found.tsx exists for routes with dynamic params
[ ] Suspense boundaries around individual slow sections
```

### Navigation & Media
```
[ ] Internal links use next/link (not <a>)
[ ] Images use next/image (not <img>)
[ ] LCP images have priority prop
[ ] fill images have sizes prop
```
