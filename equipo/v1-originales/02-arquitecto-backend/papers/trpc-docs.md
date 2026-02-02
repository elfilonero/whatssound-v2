# tRPC - End-to-end typesafe APIs made easy
Source: https://trpc.io/docs

## Introduction

tRPC allows you to easily build & consume fully typesafe APIs without schemas or code generation.

As TypeScript and static typing increasingly becomes a best practice in web development, API contracts present a major pain point. We need better ways to statically type our API endpoints and share those types between our client and server (or server-to-server). We set out to build a simple library for building typesafe APIs that leverages the full power of modern TypeScript.

### An alternative to traditional REST or GraphQL

Currently, GraphQL is the dominant way to implement typesafe APIs in TypeScript (and it's amazing!). Since GraphQL is designed as a language-agnostic specification for implementing APIs, it doesn't take full advantage of the power of a language like TypeScript.

If your project is built with full-stack TypeScript, you can share types directly between your client and server, without relying on code generation.

### Who is tRPC for?

tRPC is for full-stack TypeScript developers. It makes it easy to write endpoints that you can safely use in both the front and backend of your app. Type errors with your API contracts will be caught at build time, reducing the surface for bugs in your application at runtime.

## Features

- ✅ Well-tested and production ready.
- 🧙‍♂️ Full static typesafety & autocompletion on the client, for inputs, outputs, and errors.
- 🐎 Snappy DX - No code generation, run-time bloat, or build pipeline.
- 🍃 Light - tRPC has zero deps and a tiny client-side footprint.
- 🐻 For new and old projects - Easy to start with or add to your existing brownfield project.
- 🔋 Framework agnostic - The tRPC community has built adapters for all of the most popular frameworks.
- 🥃 Subscriptions support - Add typesafe observability to your application.
- ⚡️ Request batching - Requests made at the same time can be automatically combined into one.
- 👀 Examples - Check out an example to learn with or use as a starting point.
