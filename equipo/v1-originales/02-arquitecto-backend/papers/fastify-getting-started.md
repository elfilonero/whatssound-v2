# Getting Started | Fastify
Source: https://fastify.dev/docs/latest/Guides/Getting-Started/

## Getting Started

Hello! Thank you for checking out Fastify!

This document aims to be a gentle introduction to the framework and its features. It is an elementary preface with examples and links to other parts of the documentation.

Let's start!

### Install

Install with npm:

```
npm i fastify
```

Install with yarn:

```
yarn add fastify
```

### Your first server

Let's write our first server:

```js
// ESM
import Fastify from 'fastify'

const fastify = Fastify({
  logger: true
})

// Declare a route
fastify.get('/', function (request, reply) {
  reply.send({ hello: 'world' })
})

// Run the server!
fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})
```

Do you prefer to use async/await? Fastify supports it out-of-the-box.

```js
import Fastify from 'fastify'

const fastify = Fastify({
  logger: true
})

fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
})

const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
```

### Your first plugin

As with JavaScript, where everything is an object, with Fastify everything is a plugin.

The `register` API is the core of the Fastify framework. It is the only way to add routes, plugins, et cetera.

Fastify handles async bootstrapping internally, with minimum effort! It will load your plugins in the same order you declare them, and it will load the next plugin only once the current one has been loaded.

### Loading order of your plugins

```
└── plugins (from the Fastify ecosystem)
└── your plugins (your custom plugins)
└── decorators
└── hooks
└── your services
```

### Validate your data

Data validation is extremely important and a core concept of the framework. Fastify uses JSON Schema.

```js
const opts = {
  schema: {
    body: {
      type: 'object',
      properties: {
        someKey: { type: 'string' },
        someOtherKey: { type: 'number' }
      }
    }
  }
}

fastify.post('/', opts, async (request, reply) => {
  return { hello: 'world' }
})
```

### Serialize your data

Fastify has first-class support for JSON. It is extremely optimized to parse JSON bodies and serialize JSON output.

By specifying a response schema, you can speed up serialization by a factor of 2-3. This also helps protect against leakage of potentially sensitive data.

### Extend your server

Fastify is built to be extremely extensible and minimal. It relies on an amazing ecosystem!

### Test your server

Fastify does not offer a testing framework, but recommends a way to write tests that uses the features and architecture of Fastify.

### Run your server from CLI

Fastify also has CLI integration via fastify-cli.
