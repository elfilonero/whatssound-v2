# Introduction | Socket.IO
Source: https://socket.io/docs/v4/

Socket.IO is a library that enables low-latency, bidirectional and event-based communication between a client and a server.

The Socket.IO connection can be established with different low-level transports:
- HTTP long-polling
- WebSocket
- WebTransport

Socket.IO will automatically pick the best available option, depending on:
- the capabilities of the browser
- the network (some networks block WebSocket and/or WebTransport connections)

## Server implementations
- JavaScript (Node.js) — official
- JavaScript (Deno)
- Java (multiple implementations)
- Python
- Golang
- Rust

## Client implementations
- JavaScript (browser, Node.js or React Native) — official
- Java, C++, Swift, Dart, Python, .Net, Rust, Kotlin, PHP, Golang

> **caution:** Socket.IO is NOT a WebSocket implementation. Although Socket.IO uses WebSocket for transport when possible, it adds additional metadata to each packet.

> **caution:** Socket.IO is not meant to be used in a background service for mobile applications. It keeps an open TCP connection which may result in high battery drain.

## Features provided over plain WebSockets

### HTTP long-polling fallback
The connection will fall back to HTTP long-polling in case the WebSocket connection cannot be established. Even though most browsers now support WebSockets (more than 97%), some users are behind misconfigured proxies.

### Automatic reconnection
Socket.IO includes a heartbeat mechanism which periodically checks the status of the connection. When the client gets disconnected, it automatically reconnects with an exponential back-off delay.

### Packet buffering
Packets are automatically buffered when the client is disconnected, and will be sent upon reconnection.

### Acknowledgements
Socket.IO provides a convenient way to send an event and receive a response:

```js
// Sender
socket.emit("hello", "world", (response) => {
  console.log(response); // "got it"
});

// Receiver
socket.on("hello", (arg, callback) => {
  console.log(arg); // "world"
  callback("got it");
});
```

You can also add a timeout:
```js
socket.timeout(5000).emit("hello", "world", (err, response) => {
  if (err) {
    // the other side did not acknowledge the event in the given delay
  } else {
    console.log(response); // "got it"
  }
});
```

### Broadcasting
On the server-side, you can send an event to all connected clients or to a subset of clients:

```js
// to all connected clients
io.emit("hello");

// to all connected clients in the "news" room
io.to("news").emit("hello");
```

This also works when scaling to multiple nodes.

### Multiplexing
Namespaces allow you to split the logic of your application over a single shared connection.

```js
io.on("connection", (socket) => {
  // classic users
});

io.of("/admin").on("connection", (socket) => {
  // admin users
});
```

### Is Socket.IO still needed today?
We believe that if you use plain WebSockets for your application, you will eventually need to implement most of the features that are already included (and battle-tested) in Socket.IO, like reconnection, acknowledgements or broadcasting.

### Protocol overhead
`socket.emit("hello", "world")` will be sent as a single WebSocket frame containing `42["hello","world"]` with:
- 4 being Engine.IO "message" packet type
- 2 being Socket.IO "message" packet type
- `["hello","world"]` being the JSON.stringify()-ed version of the arguments array

The browser bundle is 10.4 kB (minified and gzipped).
