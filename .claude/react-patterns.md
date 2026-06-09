---
description: Mandatory React patterns for components. Loads when editing .tsx and .ts files.
paths:
  - "app/**/*.tsx"
  - "components/**/*.tsx"
  - "hooks/**/*.ts"
  - "lib/**/*.ts"
---

# React Patterns

> Mandatory patterns for efficient and testable React components.

---

## Fundamental Rules

```
COMPONENT > 150 LINES = MUST BE SPLIT
HOOK / FUNCTION > 150 LINES = MUST BE SPLIT
FUNCTION WITH > 2 PARAMETERS = MUST BE REFACTORED
```

---

## 1. Component Size

### Single Responsibility Principle

A component should do **one thing well**. If it exceeds ~150 lines, break it into smaller components.

```tsx
// BAD - 200+ lines, does everything
function CheckoutForm() {
  // 30 lines of state
  // 50 lines of handlers
  // 20 lines of validation
  // 100 lines of JSX
}

// GOOD - orchestrator component ~40 lines
function CheckoutForm() {
  return (
    <CheckoutProvider>
      <CustomerSection />
      <PaymentSection />
      <SummarySection />
      <SubmitButton />
    </CheckoutProvider>
  );
}
```

---

## 1b. Hooks & Functions Size

The 150-line limit applies to **everything**: components, hooks, utility functions, mutations files. A hook that does too much is as bad as a component that does too much.

```tsx
// BAD - 300+ line hook doing everything
function useCheckoutForm() {
  // fetch reservation data
  // save guest info
  // save payment method
  // apply coupon
  // calculate totals
  // submit reservation
  // track analytics
}

// GOOD - one hook per responsibility
function useReservationData() { /* fetch only */ }
function useSaveGuestInfo() { /* single mutation */ }
function useApplyCoupon() { /* single mutation */ }
function useSubmitReservation() { /* checkout submission */ }
```

### Max 2 Parameters Rule

Functions with more than 2 parameters should use an options object.

```tsx
// BAD - 4+ parameters, hard to read at call site
function saveReservation(propertyId: string, dates: DateRange, guests: GuestInfo, paymentId: string) { ... }

// GOOD - options object
function saveReservation(params: { propertyId: string; dates: DateRange; guests: GuestInfo }) { ... }

// GOOD - 2 params max
function cancelReservation(reservationId: string) { ... }
function updateGuestCount(reservationId: string, count: number) { ... }
```

### When to Split a Hook

| Signal | Action |
|--------|--------|
| Hook has 5+ `useMutation` calls | Split into one hook per mutation |
| Hook mixes fetching + mutations | Separate `useXData()` from `useXMutations()` |
| Hook file > 150 lines | Group related mutations into focused files |
| Function has > 2 params | Use options object or rethink the API |

---

## 2. Folder Structure

### Rule: Every Component in Its Own Folder

Components ALWAYS go in a folder with `index.tsx`, regardless of size.

```
// GOOD - each component in its own folder
checkout-form/
├── index.tsx
├── customer-section/
│   ├── index.tsx
│   ├── customer-input/
│   │   └── index.tsx
│   └── document-field/
│       └── index.tsx
├── payment-section/
│   ├── index.tsx
│   ├── card-form/
│   │   └── index.tsx
│   └── pix-option/
│       └── index.tsx
└── summary-card/
    └── index.tsx

// BAD - loose files
checkout-form/
├── CheckoutForm.tsx
├── CustomerSection.tsx
├── PaymentSection.tsx
└── SummaryCard.tsx
```

### Nesting Rule

- Child components go **inside the parent component's folder**
- This reflects the visual hierarchy in the folder structure
- Makes it easy to understand the architecture just by looking at folders

### Shared Components

When a component is used in **multiple places**:

| Scope | Location |
|-------|----------|
| Within the same domain | `_domain/shared/` |
| Across different domains | `src/components/` (global) |

```
// Used only in checkout
src/app/v2/checkout/_domain/shared/
└── price-display/
    └── index.tsx

// Used across multiple pages
src/components/
└── price-display/
    └── index.tsx
```

---

## 3. useState vs useRef

### Golden Rule

```
Will it appear on screen and change dynamically? → useState
Doesn't need to reflect in the UI? → useRef
```

### useRef - When to Use

`useRef` works like a **solid constant** that:
- Persists value between renders
- Does NOT cause re-render when changed
- Does NOT degrade performance like multiple states

```tsx
// GOOD - useRef for values that don't affect UI
const timerIdRef = useRef<NodeJS.Timeout | null>(null);
const previousValueRef = useRef<string>('');
const hasInitializedRef = useRef(false);
const isMountedRef = useRef(true);
const inputRef = useRef<HTMLInputElement>(null);
const scrollPositionRef = useRef(0);

// GOOD - useState for values that affect UI
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState({ name: '' });
const [error, setError] = useState<string | null>(null);
```

### Practical Examples

```tsx
// BAD - wasted re-renders
function Timer() {
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  const start = () => {
    const id = setTimeout(() => {}, 1000);
    setTimerId(id); // unnecessary re-render!
  };
}

// GOOD - no unnecessary re-render
function Timer() {
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    timerIdRef.current = setTimeout(() => {}, 1000);
    // no re-render, value stored silently
  };
}
```

### Common Use Cases for useRef

| Case | Example |
|------|---------|
| Timer/Interval IDs | `useRef<NodeJS.Timeout>` |
| Previous values | `previousValueRef.current = value` |
| Control flags | `hasInitializedRef`, `isMountedRef` |
| DOM references | `inputRef.current?.focus()` |
| Internal counters | `renderCountRef.current++` |
| Calculation cache | `cachedResultRef.current` |

---

## 4. Local Context for Prop Drilling

### When to Create a Context

Starting from **2 levels** of prop drilling, consider creating a local context.

```tsx
// BAD - prop drilling 2+ levels deep
<CheckoutForm>
  <PaymentSection total={total} fees={fees}>
    <PaymentDetails total={total} fees={fees}>
      <PriceBreakdown total={total} fees={fees} />
    </PaymentDetails>
  </PaymentSection>
</CheckoutForm>

// GOOD - local context distributes state
<CheckoutProvider>
  <PaymentSection>
    <PaymentDetails>
      <PriceBreakdown />  {/* uses useCheckoutContext() */}
    </PaymentDetails>
  </PaymentSection>
</CheckoutProvider>
```

### Context Structure

Local contexts go in `_domain/providers/`:

```
src/app/v2/checkout/_domain/
├── providers/
│   ├── checkout-context.tsx      # Context + Provider
│   └── index.ts                  # Re-export
├── hooks/
│   └── use-checkout.ts           # Hook that uses the context
└── components/
    └── checkout-form/
        └── index.tsx
```

### Implementation Pattern

```tsx
// _domain/providers/checkout-context.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface CheckoutContextType {
  total: number;
  fees: number;
  updateTotal: (value: number) => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [total, setTotal] = useState(0);
  const [fees, setFees] = useState(0);

  return (
    <CheckoutContext.Provider value={{ total, fees, updateTotal: setTotal }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckoutContext() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckoutContext must be within CheckoutProvider');
  }
  return context;
}
```

---

## 5. Advanced Performance

### Golden Rule of Performance

```
MEASURE BEFORE OPTIMIZING
Don't add useMemo/useCallback/memo by default.
Only optimize after identifying real bottlenecks.
```

---

### 5.1 Conscious Memoization

#### When NOT to use useMemo/useCallback

```tsx
// BAD - unnecessary overhead for simple calculations
const value = useMemo(() => a + b, [a, b]);
const handleClick = useCallback(() => console.log('clicked'), []);

// BAD - useCallback without memo on child is useless
const handleSubmit = useCallback(() => { /* ... */ }, []);
return <Form onSubmit={handleSubmit} />;  // Form re-renders anyway
```

#### When to USE useMemo

| Scenario | Use? |
|----------|------|
| Calculation takes > 1ms (measure with console.time) | Yes |
| Passing object/array to component with `memo` | Yes |
| Value is a dependency of another hook (useEffect, useMemo) | Yes |
| Simple calculation (sum, basic formatting) | No |

```tsx
// GOOD - expensive calculation (filtering thousands of items)
const visibleTodos = useMemo(
  () => filterTodos(todos, filter),  // > 1ms
  [todos, filter]
);

// GOOD - object passed to memoized component
const options = useMemo(() => ({
  theme,
  locale
}), [theme, locale]);

return <MemoizedChart options={options} />;
```

#### When to USE useCallback

| Scenario | Use? |
|----------|------|
| Function passed to component with `memo` | Yes |
| Function is a dependency of useEffect | Yes |
| Returning function from custom hook | Yes |
| Function used only locally | No |

```tsx
// GOOD - child uses memo
const handleSelect = useCallback((id: string) => {
  setSelected(id);
}, []);

return <MemoizedList onSelect={handleSelect} />;

// GOOD - function returned from hook
function useSearch() {
  const updateFilters = useCallback((filters) => {
    // ...
  }, []);

  return { updateFilters };
}
```

#### When to USE React.memo

| Scenario | Use? |
|----------|------|
| Component re-renders frequently with same props | Yes |
| Rendering is visibly slow | Yes |
| Props are always different on each render | No |
| Component is already fast | No |

```tsx
// GOOD - heavy component that receives stable props
const HeavyList = memo(function HeavyList({ items }: Props) {
  return items.map(item => <ComplexItem key={item.id} {...item} />);
});

// BAD - props always change (inline object)
<MemoizedComponent data={{ id: 123 }} />  // memo is useless!
```

---

### 5.2 Composition with children (Prevents Re-renders)

Powerful technique: passing components as `children` prevents unnecessary re-renders.

```tsx
// BAD - HeavyComponent re-renders when count changes
function Page() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <HeavyComponent />  {/* re-renders on every click! */}
    </div>
  );
}

// GOOD - HeavyComponent does NOT re-render
function Page() {
  return (
    <Counter>
      <HeavyComponent />  {/* stable between renders */}
    </Counter>
  );
}

function Counter({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      {children}  {/* not recreated when count changes */}
    </div>
  );
}
```

**Why does it work?** The `children` is created in the parent component (`Page`), which does not re-render. When `Counter` re-renders, the `children` is already a stable reference.

---

### 5.3 Updater Functions (Reduces Dependencies)

Use updater functions to eliminate dependencies in useCallback:

```tsx
// BAD - todos is a dependency that changes frequently
const handleAdd = useCallback((text: string) => {
  setTodos([...todos, { id: nextId++, text }]);
}, [todos]);  // recreated on every todos change

// GOOD - no dependency using updater function
const handleAdd = useCallback((text: string) => {
  setTodos(prev => [...prev, { id: nextId++, text }]);
}, []);  // never recreated
```

---

### 5.4 Optimized Effects

#### Move objects/functions INSIDE the Effect

```tsx
// BAD - needs useMemo to avoid infinite loop
const options = useMemo(() => ({
  serverUrl: 'https://api.example.com',
  roomId
}), [roomId]);

useEffect(() => {
  const connection = connect(options);
  return () => connection.disconnect();
}, [options]);

// GOOD - object created inside the Effect
useEffect(() => {
  const options = {
    serverUrl: 'https://api.example.com',
    roomId
  };
  const connection = connect(options);
  return () => connection.disconnect();
}, [roomId]);  // simple dependency
```

#### Avoid unnecessary Effects

```tsx
// BAD - Effect to derive state
const [items, setItems] = useState([]);
const [filteredItems, setFilteredItems] = useState([]);

useEffect(() => {
  setFilteredItems(items.filter(i => i.active));
}, [items]);

// GOOD - calculate during render
const [items, setItems] = useState([]);
const filteredItems = items.filter(i => i.active);  // no Effect!

// Or with useMemo if it's expensive
const filteredItems = useMemo(
  () => items.filter(i => i.active),
  [items]
);
```

---

### 5.5 Profiling: Measure Before Optimizing

#### console.time for calculations

```tsx
function FilteredList({ items, filter }) {
  console.time('filter');
  const filtered = filterItems(items, filter);
  console.timeEnd('filter');  // If > 1ms, consider useMemo

  return <List items={filtered} />;
}
```

#### React DevTools Profiler

1. Open React DevTools > Profiler
2. Click Record
3. Interact with the application
4. Stop the recording
5. Analyze which components re-render and how long they take

**Important:** Test in **production build** with realistic hardware. Development mode is slower.

---

### 5.6 Component Purity

Components should be **pure functions**: same input = same output.

```tsx
// BAD - mutates props
function List({ items }) {
  items.sort();  // NEVER mutate props!
  return items.map(item => <Item key={item.id} {...item} />);
}

// GOOD - creates new reference
function List({ items }) {
  const sorted = [...items].sort();
  return sorted.map(item => <Item key={item.id} {...item} />);
}
```

---

### 5.7 React Compiler (Future)

When we adopt the React Compiler, manual useMemo/useCallback/React.memo can be removed — the compiler handles memoization automatically. **Until then:** continue using them in the cases documented above.

---

## 6. useEffect — You Probably Don't Need It

> Based on [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) — official React documentation.

### Fundamental Rule

```
useEffect is for SYNCHRONIZING with external systems.
If there is no external system involved, you probably DON'T need an Effect.
```

**Legitimate uses of useEffect:**
- Synchronizing with browser APIs (event listeners, Intersection Observer)
- Connecting to servers (WebSocket, subscriptions)
- Data fetching (with cleanup for race conditions)
- Integration with non-React libraries

**Do NOT use useEffect for:**
- Transforming data for rendering
- Deriving state from props/state
- Reacting to user events
- Notifying parent components
- Resetting state when props change

---

### 6.1 Derive State — Calculate During Render

The most common case of unnecessary useEffect: deriving a value from another state.

```tsx
// BAD - Effect to derive state (causes extra re-render)
function Form() {
  const [firstName, setFirstName] = useState('Taylor');
  const [lastName, setLastName] = useState('Swift');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    setFullName(firstName + ' ' + lastName);
  }, [firstName, lastName]);
}

// GOOD - calculate during render
function Form() {
  const [firstName, setFirstName] = useState('Taylor');
  const [lastName, setLastName] = useState('Swift');

  const fullName = firstName + ' ' + lastName;  // no Effect, no extra state!
}
```

Same principle for filters and transformations:

```tsx
// BAD
const [list, setList] = useState(initialList);
const [filteredList, setFilteredList] = useState([]);

useEffect(() => {
  setFilteredList(list.filter(item => item.active));
}, [list]);

// GOOD - calculate directly (useMemo if expensive)
const [list, setList] = useState(initialList);
const filteredList = list.filter(item => item.active);

// GOOD - with useMemo if the list is large (> 1ms)
const filteredList = useMemo(
  () => list.filter(item => item.active),
  [list]
);
```

**Why is it bad?** The flow with Effect is: render → paint screen → Effect fires → setState → render again → paint screen again. That's **two render cycles** for something that can be calculated in one.

---

### 6.2 Reset State — Use `key` Instead of Effect

```tsx
// BAD - reset state via Effect
function ProfilePage({ userId }) {
  const [comment, setComment] = useState('');

  useEffect(() => {
    setComment('');
  }, [userId]);
  // Problem: briefly shows the old comment before clearing
}

// GOOD - use key to force React to recreate the component
function ProfilePage({ userId }) {
  return <Profile userId={userId} key={userId} />;
}

function Profile({ userId }) {
  const [comment, setComment] = useState('');  // resets automatically with key
}
```

---

### 6.3 Adjust Partial State — Calculate During Render

When only **part** of the state needs to change with a prop:

```tsx
// BAD - Effect to adjust selection
function List({ items }) {
  const [selection, setSelection] = useState(null);

  useEffect(() => {
    setSelection(null);
  }, [items]);
}

// GOOD - derive the selection from the data
function List({ items }) {
  const [selectedId, setSelectedId] = useState(null);

  // If the item exists in the new list, keep it; otherwise, null
  const selection = items.find(item => item.id === selectedId) ?? null;
}
```

---

### 6.4 Event Logic — Belongs in the Event Handler

If something happens **because the user clicked**, put it in the handler — not in an Effect.

```tsx
// BAD - event logic inside Effect
function ProductPage({ product, addToCart }) {
  useEffect(() => {
    if (product.isInCart) {
      showNotification(`Added ${product.name} to cart!`);
    }
  }, [product]);
  // Bug: notification appears on refresh if isInCart is already true!

  function handleBuyClick() {
    addToCart(product);
  }
}

// GOOD - logic in the event handler
function ProductPage({ product, addToCart }) {
  function buyProduct() {
    addToCart(product);
    showNotification(`Added ${product.name} to cart!`);
  }

  function handleBuyClick() {
    buyProduct();
  }

  function handleCheckoutClick() {
    buyProduct();
    navigateTo('/checkout');
  }
}
```

**Practical rule:** Ask "why does this code run?" If the answer is "because the user did X" → event handler. If the answer is "because the component appeared on screen" → Effect.

---

### 6.5 POST Requests — Belong in the Event Handler

```tsx
// BAD - Effect to submit form
function Form() {
  const [firstName, setFirstName] = useState('');
  const [jsonToSubmit, setJsonToSubmit] = useState(null);

  useEffect(() => {
    if (jsonToSubmit !== null) {
      post('/api/register', jsonToSubmit);
    }
  }, [jsonToSubmit]);

  function handleSubmit(e) {
    e.preventDefault();
    setJsonToSubmit({ firstName });
  }
}

// GOOD - POST directly in the handler
function Form() {
  const [firstName, setFirstName] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    post('/api/register', { firstName });
  }
}
```

---

### 6.6 Effect Chains — Consolidate in the Event Handler

```tsx
// BAD - chain of Effects triggering each other
function Game() {
  const [card, setCard] = useState(null);
  const [goldCardCount, setGoldCardCount] = useState(0);
  const [round, setRound] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    if (card?.gold) setGoldCardCount(c => c + 1);
  }, [card]);

  useEffect(() => {
    if (goldCardCount > 3) { setRound(r => r + 1); setGoldCardCount(0); }
  }, [goldCardCount]);

  useEffect(() => {
    if (round > 5) setIsGameOver(true);
  }, [round]);
  // Result: render → Effect → render → Effect → render → Effect...
}

// GOOD - all logic in the event handler, derived state in render
function Game() {
  const [card, setCard] = useState(null);
  const [goldCardCount, setGoldCardCount] = useState(0);
  const [round, setRound] = useState(1);

  const isGameOver = round > 5;  // derived!

  function handlePlaceCard(nextCard) {
    if (isGameOver) throw Error('Game is already over.');

    setCard(nextCard);
    if (nextCard.gold) {
      if (goldCardCount < 3) {
        setGoldCardCount(goldCardCount + 1);
      } else {
        setGoldCardCount(0);
        setRound(round + 1);
        if (round === 5) alert('Good game!');
      }
    }
  }
}
```

---

### 6.7 Notify Parent — Do It in the Handler, Not in an Effect

```tsx
// BAD - Effect to notify parent (onChange runs late)
function Toggle({ onChange }) {
  const [isOn, setIsOn] = useState(false);

  useEffect(() => {
    onChange(isOn);
  }, [isOn, onChange]);

  function handleClick() {
    setIsOn(!isOn);
  }
}

// GOOD - notify in the handler (everything in one batch)
function Toggle({ onChange }) {
  const [isOn, setIsOn] = useState(false);

  function handleClick() {
    const nextIsOn = !isOn;
    setIsOn(nextIsOn);
    onChange(nextIsOn);  // parent and child update in the same batch
  }
}

// BETTER - controlled component (no internal state)
function Toggle({ isOn, onChange }) {
  function handleClick() {
    onChange(!isOn);
  }
}
```

---

### 6.8 Pass Data to Parent — Lift the State

```tsx
// BAD - child fetches data and passes to parent via Effect
function Parent() {
  const [data, setData] = useState(null);
  return <Child onFetched={setData} />;
}

function Child({ onFetched }) {
  const data = useSomeAPI();

  useEffect(() => {
    if (data) onFetched(data);
  }, [onFetched, data]);
}

// GOOD - parent fetches the data and passes it to child
function Parent() {
  const data = useSomeAPI();
  return <Child data={data} />;
}
```

**Principle:** Data flows top-down in React. If the parent needs the data, the parent should fetch it.

---

### 6.9 External Stores — Use useSyncExternalStore

```tsx
// BAD - manual subscription via Effect
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    function update() { setIsOnline(navigator.onLine); }
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  return isOnline;
}

// GOOD - dedicated React hook
import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function useOnlineStatus() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,  // client value
    () => true                // server value (SSR)
  );
}
```

---

### 6.10 Data Fetching — Effect Is Acceptable, BUT with Cleanup

Data fetching is one of the **few legitimate cases** for useEffect (it's synchronization with an external system). But **always** handle race conditions:

```tsx
// BAD - no cleanup (race condition)
function SearchResults({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchResults(query).then(json => {
      setResults(json);  // may set result from an old query!
    });
  }, [query]);
}

// GOOD - with cleanup to ignore stale responses
function SearchResults({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    let ignore = false;

    fetchResults(query).then(json => {
      if (!ignore) {
        setResults(json);
      }
    });

    return () => { ignore = true; };  // cleanup: ignores response if query changed
  }, [query]);
}

// BEST - use React Query (already in our stack!)
function SearchResults({ query }) {
  const { data: results } = useQuery({
    queryKey: ['search', query],
    queryFn: () => fetchResults(query),
  });
}
```

**In our project:** Always prefer React Query (`useQuery`/`useMutation`) for data fetching. It already handles cache, race conditions, loading states, and error handling.

---

### 6.11 App Initialization — Don't Use an Effect

```tsx
// BAD - runs twice in Strict Mode
function App() {
  useEffect(() => {
    loadDataFromLocalStorage();
    checkAuthToken();
  }, []);
}

// GOOD - top-level code, runs once
if (typeof window !== 'undefined') {
  checkAuthToken();
  loadDataFromLocalStorage();
}

function App() {
  // ...
}
```

---

### Decision Tree — Do I Need useEffect?

```
Do I need useEffect?
│
├─ Am I deriving a value from props/state?
│  └─ NO → Calculate during render (or useMemo)
│
├─ Do I need to reset state when a prop changes?
│  └─ NO → Use key on the component
│
├─ Does something happen because the USER performed an action?
│  └─ NO → Put it in the event handler
│
├─ Do I need to notify a parent component?
│  └─ NO → Notify in the handler or lift the state
│
├─ Do I need to synchronize with a browser API or external store?
│  └─ Use useSyncExternalStore
│
├─ Do I need to fetch data?
│  └─ Prefer React Query → If you need an Effect, ALWAYS with cleanup
│
└─ Do I need to connect to an external system (WebSocket, timer, DOM API)?
   └─ YES → useEffect is the right approach. ALWAYS with cleanup.
```

---

### Decision Tree — Performance

```
Do I need to optimize performance?
│
├─ Did I measure and confirm it's slow? (console.time, Profiler)
│  ├─ NO → Don't optimize. Simple code > "optimized" code
│  └─ YES → Continue ↓
│
├─ Is it an expensive calculation (> 1ms)?
│  └─ YES → useMemo
│
├─ Is it a function passed to a component with memo?
│  └─ YES → useCallback
│
├─ Does a component re-render frequently with the same props?
│  └─ YES → React.memo on the child component
│
├─ Can I use composition with children?
│  └─ YES → Prefer this over memoization
│
└─ Can I move the object/function inside the Effect?
   └─ YES → Do that instead of useMemo
```

---

## Checklist

Before finalizing a component:

### Structure
```
[ ] Component is under ~150 lines
[ ] Hooks and utility functions are under ~150 lines
[ ] Functions have at most 2 parameters (use an options object for more)
[ ] Each function/hook does ONE thing (Single Responsibility)
[ ] Is in its own folder with index.tsx
[ ] Child components are nested inside the parent's folder
[ ] Shared components are in shared/ or src/components/
```

### State and Context
```
[ ] Values that don't affect UI use useRef (not useState)
[ ] Prop drilling > 2 levels uses local context
[ ] Contexts are in _domain/providers/
[ ] Updater functions used when possible (setX(prev => ...))
```

### useEffect
```
[ ] No Effect to derive state (use calculation in render or useMemo)
[ ] No Effect to reset state (use key)
[ ] No Effect to react to user events (use event handler)
[ ] No Effect to notify parent component (use handler or controlled component)
[ ] Data fetching uses React Query (not manual useEffect)
[ ] If useEffect is necessary, it has a cleanup function
[ ] If useEffect does fetch, it handles race conditions (let ignore = false)
```

### Performance
```
[ ] Measured before optimizing (console.time, Profiler)
[ ] useMemo only for calculations > 1ms or objects passed to memo components
[ ] useCallback only for functions passed to memo components
[ ] React.memo only on components that re-render with same props
[ ] Objects/functions moved inside Effects when possible
[ ] Composition with children used to avoid re-renders
[ ] Components are pure (no prop mutation, no side effects)
```
