# How Discord Stores Trillions of Messages
Source: https://discord.com/blog/how-discord-stores-trillions-of-messages
Author: Bo Ingram, March 6, 2023

In 2017, we wrote a blog post on how we store billions of messages. We shared our journey of how we started out using MongoDB but migrated our data to Cassandra because we were looking for a database that was scalable, fault-tolerant, and relatively low maintenance.

Almost six years later, we've changed a lot, and how we store messages has changed as well.

## Our Cassandra Troubles
In 2017, we ran 12 Cassandra nodes, storing billions of messages. At the beginning of 2022, it had 177 nodes with trillions of messages. It was a high-toil system — our on-call team was frequently paged for issues, latency was unpredictable, and maintenance operations became too expensive.

Hot partitions affected latency across the entire database cluster. Cluster maintenance tasks also frequently caused trouble — we were prone to falling behind on compactions. We frequently performed the "gossip dance" and spent time tuning the JVM's garbage collector.

## Changing Our Architecture
We were intrigued by ScyllaDB, a Cassandra-compatible database written in C++. Its promise: better performance, faster repairs, stronger workload isolation via shard-per-core architecture, and no garbage collection.

By 2020, we had migrated every database but cassandra-messages to ScyllaDB. The last migration required:
- ScyllaDB to implement performant reverse queries
- Improvements to our upstream systems

## Data Services Serving Data
We wrote data services in Rust — intermediary services between our API monolith and database clusters. Key feature: **request coalescing**. If multiple users request the same row simultaneously, we only query the database once. Combined with consistent hash-based routing, this significantly reduces traffic spikes.

## A Very Big Migration
Requirements: migrate trillions of messages with no downtime.

We wrote a custom data migrator in Rust that could migrate at speeds of up to 3.2 million messages per second. The migration completed in about 9 days.

We performed automated data validation by sending a small percentage of reads to both databases and comparing results.

## Several Months Later…
Results after switching to ScyllaDB:
- From 177 Cassandra nodes to just 72 ScyllaDB nodes
- Each ScyllaDB node: 9 TB disk (up from 4 TB per Cassandra node)
- Fetching historical messages: p99 from 40-125ms (Cassandra) to 15ms (ScyllaDB)
- Message insert: p99 from 5-70ms (Cassandra) to steady 5ms (ScyllaDB)

The system handled the 2022 World Cup Final traffic without breaking a sweat, with message send spikes for every goal and event in the match.
