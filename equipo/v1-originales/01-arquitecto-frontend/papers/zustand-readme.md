# Zustand — Bear necessities for state management in React
### Source: https://github.com/pmndrs/zustand

---

A small, fast and scalable bearbones state-management solution using simplified flux principles. Has a comfy API based on hooks, isn't boilerplatey or opinionated.

Don't disregard it because it's cute. It has quite the claws, lots of time was spent dealing with common pitfalls, like the dreaded zombie child problem, react concurrency, and context loss between mixed renderers. It may be the one state-manager in the React space that gets all of these right.

```
npm install zustand
```

## First create a store

Your store is a hook! You can put anything in it: primitives, objects, functions. State has to be updated immutably and the set function merges state to help it.

```javascript
import { create } from 'zustand'

const useBearStore = create((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
}))
```

## Then bind your components, and that's it!

Use the hook anywhere, no providers are needed. Select your state and the component will re-render on changes.

```jsx
function BearCounter() {
  const bears = useBearStore((state) => state.bears)
  return <h1>{bears} around here ...</h1>
}

function Controls() {
  const increasePopulation = useBearStore((state) => state.increasePopulation)
  return <button onClick={increasePopulation}>one up</button>
}
```

### Why zustand over redux?

- Simple and un-opinionated
- Makes hooks the primary means of consuming state
- Doesn't wrap your app in context providers
- Can inform components transiently (without causing render)

### Why zustand over context?

- Less boilerplate
- Renders components only on changes
- Centralized, action-based state management

## Recipes

### Selecting multiple state slices

```javascript
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

const useBearStore = create((set) => ({
  nuts: 0,
  honey: 0,
  treats: {},
}))

// Object pick, re-renders when either state.nuts or state.honey change
const { nuts, honey } = useBearStore(
  useShallow((state) => ({ nuts: state.nuts, honey: state.honey })),
)

// Array pick
const [nuts, honey] = useBearStore(
  useShallow((state) => [state.nuts, state.honey]),
)
```

### Async actions

```javascript
const useFishStore = create((set) => ({
  fishies: {},
  fetch: async (pond) => {
    const response = await fetch(pond)
    set({ fishies: await response.json() })
  },
}))
```

### Read from state in actions

```javascript
const useSoundStore = create((set, get) => ({
  sound: 'grunt',
  action: () => {
    const sound = get().sound
    // ...
  }
}))
```

### Reading/writing state outside of components

```javascript
const useDogStore = create(() => ({ paw: true, snout: true, fur: true }))

// Getting non-reactive fresh state
const paw = useDogStore.getState().paw
// Listening to all changes
const unsub1 = useDogStore.subscribe(console.log)
// Updating state
useDogStore.setState({ paw: false })
// Unsubscribe
unsub1()
```

### Transient updates (for often occurring state-changes)

```javascript
const useScratchStore = create((set) => ({ scratches: 0, ... }))

const Component = () => {
  const scratchRef = useRef(useScratchStore.getState().scratches)
  useEffect(() => useScratchStore.subscribe(
    state => (scratchRef.current = state.scratches)
  ), [])
}
```

### Using Immer

```javascript
import { produce } from 'immer'

const useLushStore = create((set) => ({
  lush: { forest: { contains: { a: 'bear' } } },
  clearForest: () =>
    set(
      produce((state) => {
        state.lush.forest.contains = null
      }),
    ),
}))
```

### Persist middleware

```javascript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useFishStore = create(
  persist(
    (set, get) => ({
      fishes: 0,
      addAFish: () => set({ fishes: get().fishes + 1 }),
    }),
    {
      name: 'food-storage',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
```

### Immer middleware

```javascript
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

const useBeeStore = create(
  immer((set) => ({
    bees: 0,
    addBees: (by) =>
      set((state) => {
        state.bees += by
      }),
  })),
)
```

### Redux devtools

```javascript
import { devtools } from 'zustand/middleware'

const usePlainStore = create(devtools((set) => ...))
const useReduxStore = create(devtools(redux(reducer, initialState)))
```

### TypeScript Usage

```typescript
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface BearState {
  bears: number
  increase: (by: number) => void
}

const useBearStore = create<BearState>()(
  devtools(
    persist(
      (set) => ({
        bears: 0,
        increase: (by) => set((state) => ({ bears: state.bears + by })),
      }),
      {
        name: 'bear-storage',
      },
    ),
  ),
)
```

## Best practices

- Splitting the store into separate slices
- Flux inspired practice
- Testing
