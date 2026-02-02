# Why Discord is switching from Go to Rust
Source: https://discord.com/blog/why-discord-is-switching-from-go-to-rust

Rust is becoming a first class language in a variety of domains. At Discord, we've seen success with Rust on the client side and server side. Most recently, we drastically improved the performance of a service by switching its implementation from Go to Rust.

## The Read States service
The "Read States" service keeps track of which channels and messages you have read. It's accessed every time you connect to Discord, every time a message is sent and every time a message is read — it's in the hot path.

With Go, we saw large latency spikes every few minutes due to Go's memory model and garbage collector (GC).

## Why Go did not meet our performance targets
- There is one Read State per User per Channel. Discord has billions of Read States.
- Each Read States server has an LRU cache with millions of users and tens of millions of Read States.
- Hundreds of thousands of cache updates per second.
- Tens of thousands of database writes per second.

We observed latency and CPU spikes roughly every 2 minutes — Go forces a garbage collection run every 2 minutes at minimum.

The spikes were huge because the garbage collector needed to scan the entire LRU cache to determine if memory was truly free. Smaller LRU cache = faster GC but higher 99th percentile latency (more cache misses = more database loads).

## Memory management in Rust
Rust uses memory "ownership" — it knows when the program is using memory and immediately frees it once no longer needed. No garbage collector. When a user's Read State is evicted from the LRU cache, it is immediately freed from memory.

## Implementation, load testing, and launch
The rewrite was fairly straightforward. Even with just basic optimization, Rust outperformed the hyper hand-tuned Go version.

Performance optimizations included:
- Changing to BTreeMap instead of HashMap in the LRU cache
- Swapping the metrics library for one using modern Rust concurrency
- Reducing memory copies

## Results
- Go is purple, Rust is blue — massive improvement across all metrics
- After raising LRU cache capacity to 8 million Read States:
  - Average time measured in microseconds
  - Max @mention measured in milliseconds

## Closing thoughts
Discord uses Rust in many places: game SDK, video capturing/encoding for Go Live, Elixir NIFs, several backend services. When starting a new project, we consider using Rust where it makes sense.

Rust's type safety and borrow checker make it very easy to refactor code as product requirements change. The ecosystem and tooling are excellent.
