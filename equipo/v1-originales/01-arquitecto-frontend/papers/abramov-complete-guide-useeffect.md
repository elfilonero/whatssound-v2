# A Complete Guide to useEffect — overreacted
## By Dan Abramov
### Source: https://overreacted.io/a-complete-guide-to-useeffect/

---

You wrote a few components with [Hooks](https://reactjs.org/docs/hooks-intro.html). Maybe even a small app. You're mostly satisfied. You're comfortable with the API and picked up a few tricks along the way. You even made some [custom Hooks](https://reactjs.org/docs/hooks-custom.html) to extract repetitive logic (300 lines gone!) and showed it off to your colleagues. "Great job", they said.

But sometimes when you useEffect, the pieces don't quite fit together. You have a nagging feeling that you're missing something. It seems similar to class lifecycles… but is it really? You find yourself asking questions like:

- 🤔 How do I replicate componentDidMount with useEffect?
- 🤔 How do I correctly fetch data inside useEffect? What is []?
- 🤔 Do I need to specify functions as effect dependencies or not?
- 🤔 Why do I sometimes get an infinite refetching loop?
- 🤔 Why do I sometimes get an old state or prop value inside my effect?

When I just started using Hooks, I was confused by all of those questions too. Even when writing the initial docs, I didn't have a firm grasp on some of the subtleties. I've since had a few "aha" moments that I want to share with you. This deep dive will make the answers to these questions look obvious to you.

To see the answers, we need to take a step back. The goal of this article isn't to give you a list of bullet point recipes. It's to help you truly "grok" useEffect. There won't be much to learn. In fact, we'll spend most of our time unlearning.

It's only after I stopped looking at the useEffect Hook through the prism of the familiar class lifecycle methods that everything came together for me.

"Unlearn what you have learned." — Yoda

This article assumes that you're somewhat familiar with [useEffect](https://reactjs.org/docs/hooks-effect.html) API.

It's also really long. It's like a mini-book. That's just my preferred format. But I wrote a TLDR just below if you're in a rush or don't really care.

If you're not comfortable with deep dives, you might want to wait until these explanations appear elsewhere. Just like when React came out in 2013, it will take some time for people to recognize a different mental model and teach it.

## TLDR

Here's a quick TLDR if you don't want to read the whole thing. If some parts don't make sense, you can scroll down until you find something related.

🤔 Question: How do I replicate componentDidMount with useEffect?

While you can useEffect(fn, []), it's not an exact equivalent. Unlike componentDidMount, it will capture props and state. So even inside the callbacks, you'll see the initial props and state. If you want to see "latest" something, you can write it to a ref. But there's usually a simpler way to structure the code so that you don't have to.

🤔 Question: How do I correctly fetch data inside useEffect? What is []?

[This article](https://www.robinwieruch.de/react-hooks-fetch-data/) is a good primer on data fetching with useEffect. [] means the effect doesn't use any value that participates in React data flow, and is for that reason safe to apply once.

🤔 Question: Do I need to specify functions as effect dependencies or not?

The recommendation is to hoist functions that don't need props or state outside of your component, and pull the ones that are used only by an effect inside of that effect.

🤔 Question: Why do I sometimes get an infinite refetching loop?

This can happen if you're doing data fetching in an effect without the second dependencies argument.

🤔 Why do I sometimes get an old state or prop value inside my effect?

Effects always "see" props and state from the render they were defined in.

## Each Render Has Its Own Props and State

Before we can talk about effects, we need to talk about rendering.

Here's a counter. Look at the highlighted line closely:

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
```

The first time our component renders, the count variable we get from useState() is 0. When we call setCount(1), React calls our component again. This time, count will be 1. And so on.

The key takeaway is that the count constant inside any particular render doesn't change over time. It's our component that's called again — and each render "sees" its own count value that's isolated between renders.

## Each Render Has Its Own Event Handlers

Each render returns its own "version" of event handlers. Each of those versions "remembers" its own count.

## Each Render Has Its Own Effects

It's not the count variable that somehow changes inside an "unchanging" effect. It's the effect function itself that's different on every render.

Conceptually, you can imagine effects are a part of the render result.

## Each Render Has Its Own… Everything

Every function inside the component render (including event handlers, effects, timeouts or API calls inside them) captures the props and state of the render call that defined it.

## Swimming Against the Tide

If you want to read the future props or state from a function in a past render, you're swimming against the tide. You can use refs for this.

## So What About Cleanup?

The effect cleanup doesn't read the "latest" props. It reads props that belong to the render it's defined in.

## Synchronization, Not Lifecycle

useEffect lets you synchronize things outside of the React tree according to our props and state. Think of effects as synchronization, not lifecycle events.

## Teaching React to Diff Your Effects

You can provide a dependency array to useEffect to avoid re-running effects unnecessarily.

## Don't Lie to React About Dependencies

If you specify deps, all values from inside your component that are used by the effect must be there.

## Two Ways to Be Honest About Dependencies

1. Fix the dependency array to include all values used inside the effect.
2. Change the effect code so that it doesn't need values that change more often than we want.

## Making Effects Self-Sufficient

Use functional updater form of setState: `setCount(c => c + 1)` instead of `setCount(count + 1)`.

## Decoupling Updates from Actions

Use useReducer to decouple expressing "actions" from how state updates in response.

## Why useReducer Is the Cheat Mode of Hooks

useReducer lets you decouple the update logic from describing what happened. This helps remove unnecessary dependencies from effects.

## Moving Functions Inside Effects

If you only use some functions inside an effect, move them directly into that effect.

---

*Note: This article was truncated during download. Visit the original URL for the complete content.*
