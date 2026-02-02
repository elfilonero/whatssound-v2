# New Architecture is here — React Native Blog
### Source: https://reactnative.dev/blog/2024/10/23/the-new-architecture-is-here

---

React Native 0.76 with the New Architecture by default is now available on npm!

The New Architecture adds full support for modern React features, including Suspense, Transitions, automatic batching, and useLayoutEffect. The New Architecture also includes new Native Module and Native Component systems that let you write type-safe code with direct access to native interfaces without a bridge.

This release is the result of a ground-up rewrite of React Native we've been working on since 2018, and we've taken extra care to make the New Architecture a gradual migration for most apps.

Most apps will be able to adopt React Native 0.76 with the same level of effort as any other release. The most popular React Native libraries already support the New Architecture. The New Architecture also includes an automatic interoperability layer to enable backward compatibility with libraries targeting the old architecture.

## What is the New Architecture

The New Architecture is a complete rewrite of the major systems that underpin React Native, including how components are rendered, how JavaScript abstractions communicates with native abstractions, and how work is scheduled across different threads.

In the old architecture, React Native communicated with the native platform using an asynchronous bridge. To render a component or call a native function, React Native needed to serialize and enqueue native functions calls with the bridge, which would be processed asynchronously.

However, users expect immediate feedback to interactions to feel like a native app. This means some updates need to render synchronously in response to user input, potentially interrupting any in-progress render.

The New Architecture includes four main parts:

- The New Native Module System
- The New Renderer
- The Event Loop
- Removing the Bridge

### New Native Modules

The new Native Module System is a major rewrite of how JavaScript and the native platform communicate. It's written entirely in C++, which unlocks:

- Synchronous access to and from the native runtime
- Type safety between JavaScript and native code
- Code sharing across platforms
- Lazy module loading by default

In the new Native Module system, JavaScript and the native layer can now synchronously communicate through the JavaScript Interface (JSI), without the need to use an asynchronous bridge.

```javascript
// Old Architecture
// ❌ Sync callback from Native Module
nativeModule.getValue(value => {
  nativeModule.doSomething(value);
});

// New Architecture
// ✅ Sync response from Native Module
const value = nativeModule.getValue();
nativeModule.doSomething(value);
```

### New Renderer

The updated Native Renderer now stores the view hierarchy in an immutable tree structure. This allows for thread-safe processing of updates and handling multiple in-progress trees. Benefits:

- Updates can be rendered on different threads at different priorities
- Layout can be read synchronously and across different threads
- The renderer is written in C++ and shared across all platforms

### The Event Loop

The New Architecture implements a well-defined event loop processing model following HTML Standard specifications. Benefits:

- The ability to interrupt rendering to process events and tasks
- Closer alignment with web specifications
- Foundation for more browser features (microtasks, MutationObserver, IntersectionObserver)

### Removing the Bridge

Replaced with direct, efficient communication between JavaScript and native code using JSI:

- Faster startup time
- Better error reporting
- Reduced crashes from undefined behavior

## New Features

### Transitions

```javascript
import {startTransition} from 'react';

// Urgent: Show the slider value
setCount(input);

// Mark any state updates inside as transitions
startTransition(() => {
  // Transition: Show the results
  setNumberOfTiles(input);
});
```

### Automatic Batching

React can batch together more state updates when rendering to avoid the rendering of intermediate states.

### useLayoutEffect

```javascript
// New Architecture - sync layout effect during commit
useLayoutEffect(() => {
  const rect = ref.current?.getBoundingClientRect();
  setPosition(rect);
}, []);
```

### Full Support for Suspense

```jsx
<Suspense fallback={<Spinner />}>
  <Comments />
</Suspense>
```

## How to Upgrade

To upgrade to 0.76, follow the steps in the release post. The overall strategy is to get your application running on the New Architecture without breaking existing code. You can then gradually migrate your app at your own pace.

More than 850 libraries are already compatible, including all libraries with over 200K weekly downloads.
