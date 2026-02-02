# Colocation
## By Kent C. Dodds
### Source: https://kentcdodds.com/blog/colocation

---

We all want to have codebases that are easy to maintain, so we start out with the best of intentions to make our codebase (or our corner of the codebase) maintainable and easy to understand. Over time, as a codebase grows, it can become more and more difficult to manage dependencies (JS, CSS, images, etc.). As projects grow, an increasing amount of your codebase becomes "tribal knowledge" and this sort of knowledge contributes to "technical debt".

I like to keep my codebases manageable for not only me (the one who wrote it), but also my teammates, future maintainers, and myself in 6 months.

## The Problems with Separation

Consider if we placed code comments in a totally separate file — a massive DOCUMENTATION.md file or perhaps even a docs/ directory that maps back to our src/ directory. There would be serious problems:

- **Maintainability**: They'd get out of sync or out of date quicker. We'd move or delete a src/ file without updating the corresponding docs/ file.

- **Applicability**: People looking at the code in src/ might miss an important comment in docs/ or not comment their own code because they don't realize that there's an existing docs/ file.

- **Ease of use**: Context switching from one location to the next would be a challenge.

## So what?

The benefits of co-location are everywhere:

### HTML/View

Before modern frameworks like React, you'd have your view logic and your view templates in totally separate directories. These days it's far more common to put these things in the exact same file with React and Vue.

### CSS

CSS-in-JS applies this principle to styles. The benefits are significant.

### Tests

This concept of file co-location applies great to unit tests as well. How common is it to find a project with a src/ directory and a test/ directory filled with unit tests that attempts to mirror the src/ directory? All the pitfalls described above apply here as well.

To help enable a more maintainable codebase, we should co-locate our tests files with the file or group of files they are testing.

### State

Application/Component state experiences the same benefits. The more disconnected/indirect your state is from the UI that's using it, the harder it is to maintain. Localizing state has even more benefits than maintainability, it also improves the performance of your application. A state change in one corner of your application component tree will re-render a lot fewer components than a state change at the top of the tree. **Localize your state.**

### "Reusable" utility files

This applies to "utility" files and functions as well. Imagine you're writing a component and see a nice bit of code that could be extracted into its own function. You extract it and put it into your app's utils/ directory. Later, your component is deleted, but the utility you wrote remains because the person who deleted it assumed it was more widely used. Over the years, engineers work hard to maintain that function without realizing it's no longer needed at all.

If instead you had just left that function directly in the file that used it, the story would be completely different.

## The principle

The concept of co-location can be boiled down to this fundamental principle:

> **Place code as close to where it's relevant as possible**

You might also say: "Things that change together should be located as close as reasonable." (Dan Abramov said something like this to me once).

## Open Source made easy(-er)

Taking a component and turning it into an open source project is often as simple as copy/pasting the folder to another project and publishing that to npm. Then you just install it in your project and update your require/import statements and you're good to go.

## Exceptions

Sure there's a good argument for documentation that spans the whole or part of a system. If I have a part of my app associated with user authentication and I want to document that flow, I can put a README.md file in the folder that has all of the modules associated with user authentication.

For end-to-end tests, those generally make more sense to go at the root of the project. They span beyond the project itself and into other parts of the system.

## Conclusion

Our goal here is to build software that is as simple to maintain as possible. The same benefits of maintainability, applicability, and ease of use we get from co-locating our comments we get by co-location of other things as well. If you've never tried it out, I recommend you give it a shot.

P.S. If you're concerned about violating "separation of concerns" I recommend you check out [this talk](https://youtu.be/x7cQ3mrcKaY) by Pete Hunt and re-evaluate what that means 😀.
