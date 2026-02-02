# Please stop calling databases CP or AP — Martin Kleppmann's blog
Source: https://martin.kleppmann.com/2015/05/11/please-stop-calling-databases-cp-or-ap.html
Published: 11 May 2015

In his excellent blog post "Notes on Distributed Systems for Young Bloods", Jeff Hodges recommends that you use the CAP theorem to critique systems. A lot of people have taken that advice to heart, describing their systems as "CP", "AP", or sometimes "CA".

I must disagree. The CAP theorem is too simplistic and too widely misunderstood to be of much use for characterizing systems. Therefore I ask that we retire all references to the CAP theorem, stop talking about the CAP theorem, and put the poor thing to rest. Instead, we should use more precise terminology to reason about our trade-offs.

## CAP uses very narrow definitions

If you want to refer to CAP as a theorem, you have to be precise. The proof uses very particular definitions:

- **Consistency** in CAP actually means linearizability, which is a very specific (and very strong) notion of consistency. It has got nothing to do with the C in ACID.

- **Availability** in CAP is defined as "every request received by a non-failing node must result in a non-error response". Any non-failing node needs to be able to handle it.

- **Partition Tolerance** (terribly mis-named) basically means that you're communicating over an asynchronous network that may delay or drop messages.

The CAP system model is a single, read-write register. The only fault considered is a network partition. CAP says nothing about latency, which people tend to care about more than availability.

## Linearizability

The key idea: If operation B started after operation A successfully completed, then operation B must see the system in the same state as it was on completion of operation A, or a newer state.

Example: Alice and Bob checking football scores. Alice sees the winner, tells Bob. Bob refreshes but gets a stale result from a lagging replica. This is a violation of linearizability.

This is a fairly expensive guarantee to provide, because it requires a lot of coordination. Even the CPU in your computer doesn't provide linearizable access to your local RAM!

## CAP-Availability

With replicas in two datacenters and a network partition:
1. Continue writing (available) → violates linearizability
2. Stop accepting reads/writes in non-leader DC → not CAP-available

## Many systems are neither linearizable nor CAP-available

- Single-leader replication: not CAP-available (can't write when partitioned from leader), but reads from followers are not linearizable either → neither CP nor AP, just "P"
- MongoDB: single leader per shard, allows non-linearizable reads even at highest consistency setting
- Dynamo derivatives (Riak, Cassandra, Voldemort): depends on settings (R=W=1 is CAP-available, quorum may not be)

## Case study: ZooKeeper

ZooKeeper by default does not provide linearizable reads (each client connects to one node and sees only that node's data). It provides atomic broadcast combined with causal consistency — stronger than read your writes, monotonic reads and consistent prefix reads combined.

ZooKeeper is neither CAP-consistent nor CAP-available in the presence of partitions, and by default isn't even linearizable in the absence of partitions.

## CP/AP: a false dichotomy

We should stop putting datastores into "AP" or "CP" buckets because:
- Within one piece of software, you may have operations with different consistency characteristics
- Many systems are neither consistent nor available under CAP's definitions
- A huge amount of subtlety is lost by putting a system in one of two buckets
- Even Eric Brewer admits that CAP is misleading and oversimplified

## Learning to think for yourself

Recommendations for deeper learning:
- Doug Terry's paper explaining consistency levels using Baseball examples
- Hermitage project for transaction isolation models
- Peter Bailis et al. on connections between replica consistency, transaction isolation and availability
- "Designing Data-Intensive Applications" by Martin Kleppmann

I encourage you to be curious and patient — this stuff doesn't come easy. But it's rewarding, because you learn to reason about trade-offs, and thus figure out what kind of architecture works best for your particular application.
