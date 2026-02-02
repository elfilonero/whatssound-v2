# Application State Management with React
## By Kent C. Dodds
### Source: https://kentcdodds.com/blog/application-state-management-with-react

---

Managing state is arguably the hardest part of any application. It's why there are so many state management libraries available and more coming around every day. Despite the fact that state management is a hard problem, I would suggest that one of the things that makes it so difficult is that we often over-engineer our solution to the problem.

There's one state management solution that I've personally tried to implement for as long as I've been using React, and with the release of React hooks (and massive improvements to React context) this method of state management has been drastically simplified.

We often talk about React components as lego building blocks to build our applications, and I think that when people hear this, they somehow think this excludes the state aspect. The "secret" behind my personal solution to the state management problem is to think of how your application's state maps to the application's tree structure.

One of the reasons redux was so successful was the fact that react-redux solved the prop drilling problem. The fact that you could share data across different parts of your tree by simply passing your component into some magical connect function was wonderful.

This is the reason that I only ever used redux on one project: I consistently see developers putting all of their state into redux. Not just global application state, but local state as well. This leads to a lot of problems, not the least of which is that when you're maintaining any state interaction, it involves interacting with reducers, action creators/types, and dispatch calls, which ultimately results in having to open many files and trace through the code in your head.

To be clear, this is fine for state that is truly global, but for simple state (like whether a modal is open or form input value state) this is a big problem. To make matters worse, it doesn't scale very well.

Having all your application state in a single object can also lead to other problems, even if you're not using Redux. When a React `<Context.Provider>` gets a new value, all the components that consume that value are updated and have to render, even if it's a function component that only cares about part of the data.

Here's the real kicker, if you're building an application with React, you already have a state management library installed in your application. You don't even need to npm install (or yarn add) it. It costs no extra bytes for your users, it integrates with all React packages on npm, and it's already well documented by the React team. It's React itself.

> **React is a state management library**

When you build a React application, you're assembling a bunch of components to make a tree of components starting at your `<App />` and ending at your `<input />`s, `<div />`s and `<button />`s.

```jsx
function Counter() {
  const [count, setCount] = React.useState(0)
  const increment = () => setCount((c) => c + 1)
  return <button onClick={increment}>{count}</button>
}

function App() {
  return <Counter />
}
```

### Lifting State Up

"Lifting State Up" is legitimately the answer to the state management problem in React and it's a rock solid one:

```jsx
function Counter({ count, onIncrementClick }) {
  return <button onClick={onIncrementClick}>{count}</button>
}

function CountDisplay({ count }) {
  return <div>The current counter count is {count}</div>
}

function App() {
  const [count, setCount] = React.useState(0)
  const increment = () => setCount((c) => c + 1)
  return (
    <div>
      <CountDisplay count={count} />
      <Counter count={count} onIncrementClick={increment} />
    </div>
  )
}
```

### Using Context

```jsx
import * as React from 'react'

const CountContext = React.createContext()

function useCount() {
  const context = React.useContext(CountContext)
  if (!context) {
    throw new Error(`useCount must be used within a CountProvider`)
  }
  return context
}

function CountProvider(props) {
  const [count, setCount] = React.useState(0)
  const value = React.useMemo(() => [count, setCount], [count])
  return <CountContext.Provider value={value} {...props} />
}

export { CountProvider, useCount }
```

Important things to remember:

- Not everything in your application needs to be in a single state object. Keep things logically separated (user settings does not necessarily have to be in the same context as notifications). You will have multiple providers with this approach.

- Not all of your context needs to be globally accessible! Keep state as close to where it's needed as possible.

```jsx
function App() {
  return (
    <ThemeProvider>
      <AuthenticationProvider>
        <Router>
          <Home path="/" />
          <About path="/about" />
          <UserPage path="/:userId" />
          <UserSettings path="/settings" />
          <Notifications path="/notifications" />
        </Router>
      </AuthenticationProvider>
    </ThemeProvider>
  )
}

function Notifications() {
  return (
    <NotificationsProvider>
      <NotificationsTab />
      <NotificationsTypeList />
      <NotificationsList />
    </NotificationsProvider>
  )
}

function UserPage({ username }) {
  return (
    <UserProvider username={username}>
      <UserInfo />
      <UserNav />
      <UserActivity />
    </UserProvider>
  )
}
```

## Server Cache vs UI State

There are various categories of state, but every type of state can fall into one of two buckets:

- **Server Cache** - State that's actually stored on the server and we store in the client for quick-access (like user data).
- **UI State** - State that's only useful in the UI for controlling the interactive parts of our app (like modal isOpen state).

We make a mistake when we combine the two. Server cache has inherently different problems from UI state and therefore needs to be managed differently.

This is why I use and recommend [react-query](https://github.com/tannerlinsley/react-query) for this kind of state. I consider it to be a cache. And it's a darn good one.

## What about performance?

When you follow the advice above, performance will rarely be an issue. Particularly when you're following the recommendations around colocation. However, there are definitely use cases where performance can be problematic.

Approaches to solving performance issues with state in React context:

- Separate your state into different logical pieces rather than in one big store
- Optimize your context provider
- Bring in [jotai](https://github.com/react-spring/jotai)

## Conclusion

Keep state as local as possible and use context only when prop drilling really becomes a problem. Doing things this way will make it easier for you to maintain state interactions.
