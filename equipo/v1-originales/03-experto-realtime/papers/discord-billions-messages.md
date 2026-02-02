# How Discord Stores Billions of Messages
Source: https://discord.com/blog/how-discord-stores-billions-of-messages

Discord continues to grow faster than we expected and so does our user-generated content. With more users comes more chat messages. In July, we announced 40 million messages a day, in December we announced 100 million, and as of this blog post we are well past 120 million. We decided early on to store all chat history forever so users can come back at any time and have their data available on any device. This is a lot of data that is ever increasing in velocity, size, and must remain available. How do we do it? Cassandra!

## What we were doing
The original version of Discord was built in just under two months in early 2015. Arguably, one of the best databases for iterating quickly is MongoDB. Everything on Discord was stored in a single MongoDB replica set and this was intentional, but we also planned everything for easy migration to a new database (we knew we were not going to use MongoDB sharding because it is complicated to use and not known for stability). This is actually part of our company culture: build quickly to prove out a product feature, but always with a path to a more robust solution.

The messages were stored in a MongoDB collection with a single compound index on channel_id and created_at. Around November 2015, we reached 100 million stored messages and at this time we started to see the expected issues appearing: the data and the index could no longer fit in RAM and latencies started to become unpredictable. It was time to migrate to a database more suited to the task.

## Choosing the Right Database
Before choosing a new database, we had to understand our read/write patterns and why we were having problems with our current solution.

- It quickly became clear that our reads were extremely random and our read/write ratio was about 50/50.
- Voice chat heavy Discord servers send almost no messages. This means they send a message or two every few days. In a year, this kind of server is unlikely to reach 1,000 messages.
- Private text chat heavy Discord servers send a decent number of messages, easily reaching between 100 thousand to 1 million messages a year.
- Large public Discord servers send a lot of messages. They have thousands of members sending thousands of messages a day and easily rack up millions of messages a year.

Requirements:
- Linear scalability
- Automatic failover
- Low maintenance
- Proven to work
- Predictable performance
- Not a blob store
- Open source

Cassandra was the only database that fulfilled all of our requirements.

## Data Modeling
The best way to describe Cassandra to a newcomer is that it is a KKV store. The two Ks comprise the primary key. The first K is the partition key and is used to determine which node the data lives on and where it is found on disk. The partition contains multiple rows within it and a row within a partition is identified by the second K, which is the clustering key.

channel_id became the partition key since all queries operate on a channel. The primary key became (channel_id, message_id), where the message_id is a Snowflake (chronologically sortable).

We decided to bucket our messages by time. Our new primary key became ((channel_id, bucket), message_id).

## Eventual Consistency
Cassandra is an AP database which means it trades strong consistency for availability. All writes in Cassandra are upserts. We discovered race conditions with edit/delete operations creating corrupt rows. Solution: choose a required column (author_id) and delete the message if it was null.

We also optimized by only writing non-null values to Cassandra, avoiding unnecessary tombstones.

## Performance
Writes were sub-millisecond and reads were under 5 milliseconds. Performance stayed consistent during a week of testing.

## The Big Surprise
About 6 months after rollout, Cassandra became unresponsive. A Discord channel had millions of deleted messages (tombstones), causing 10-second GC pauses. Solution: lowered tombstone lifespan from 10 to 2 days and tracked empty buckets to avoid scanning them.

## Conclusion
It has been smooth sailing. We went from over 100 million total messages to more than 120 million messages a day, with performance and stability staying consistent.
