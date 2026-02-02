# The Two Reacts — overreacted
## By Dan Abramov
### Source: https://overreacted.io/the-two-reacts/

---

Suppose I want to display something on your screen. Whether I want to display a web page like this blog post, an interactive web app, or even a native app that you might download from some app store, at least two devices must be involved.

Your device and mine.

It starts with some code and data on my device. For example, I am editing this blog post as a file on my laptop. If you see it on your screen, it must have already traveled from my device to yours. At some point, somewhere, my code and data turned into the HTML and JavaScript instructing your device to display this.

So how does that relate to React? React is a UI programming paradigm that lets me break down what to display (a blog post, a signup form, or even a whole app) into independent pieces called components, and compose them like LEGO blocks.

Components are code, and that code has to run somewhere. But wait—whose computer should they run on? Should they run on your computer? Or on mine?

Let's make a case for each side.

## Components should run on your computer

Here's a little counter button to demonstrate interactivity.

```jsx
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button
      className="dark:color-white rounded-lg bg-purple-700 px-2 py-1 font-sans font-semibold text-white focus:ring active:bg-purple-600"
      onClick={() => setCount(count + 1)}
    >
      You clicked me {count} times
    </button>
  );
}
```

Here, count is a piece of client state—a bit of information in your computer's memory that updates every time you press that button. I don't know how many times you're going to press the button so I can't predict and prepare all of its possible outputs on my computer.

When you build a user interface, you need to be able to respond to at least some interactions with guaranteed low latency and with zero network roundtrips.

The React mental model: UI is a function of state, or UI = f(state). Since the state "lives" on your computer, the code to compute the UI (your components) must also run on your computer.

## Components should run on my computer

```jsx
import { readFile } from "fs/promises";
import matter from "gray-matter";

export async function PostPreview({ slug }) {
  const fileContent = await readFile("./public/" + slug + "/index.md", "utf8");
  const { data, content } = matter(fileContent);
  const wordCount = content.split(" ").filter(Boolean).length;

  return (
    <section className="rounded-md bg-black/5 p-2">
      <h5 className="font-bold">
        <a href={"/" + slug} target="_blank">
          {data.title}
        </a>
      </h5>
      <i>{wordCount.toLocaleString()} words</i>
    </section>
  );
}
```

This component runs on my computer. When I want to read a file, I read a file with fs.readFile. Running my components close to their data source lets them read their own data and preprocess it before sending any of that information to your device.

With this mental model, the UI is a function of server data, or UI = f(data). That data only exists on my device, so that's where the components should run.

## The Two Visions

UI is made of components, but we argued for two very different visions:

- **UI = f(state)** where state is client-side, and f runs on the client. This approach allows writing instantly interactive components like `<Counter />`.

- **UI = f(data)** where data is server-side, and f runs on the server only. This approach allows writing data-processing components like `<PostPreview />`.

If we set aside the familiarity bias, both of these approaches are compelling at what they do best. Unfortunately, these visions seem mutually incompatible.

The problem to solve, then, is how to split our "f" across two very different programming environments. Is that even possible?

The real "formula" is closer to **UI = f(data, state)**. If you had no data or no state, it would generalize to those cases. But ideally, I'd prefer my programming paradigm to be able to handle both cases without having to pick another abstraction.

Is there some way we could split components between your computer and mine in a way that preserves what's great about React? Could we combine and nest components from two different environments? How would that work?

Give it some thought, and next time we'll compare our notes.
