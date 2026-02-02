# Shuffle: Making Random Feel More Human | Spotify Engineering
Source: https://engineering.atspotify.com/2025/11/shuffle-making-random-feel-more-human

## How we balanced statistical randomness with listener intuition

Shuffle has always been one of Spotify's most-used features, and also one of the most misunderstood. For years, listeners have debated whether Shuffle is "truly random," often noticing patterns or repeated tracks that didn't feel random enough.

For the last 5 years, Spotify's Shuffle was exactly that – random. We relied on a standard, publicly used randomization method to generate playlist orders that were mathematically sound. But statistical randomness doesn't always translate into perceived randomness.

Think of flipping a coin and getting five heads in a row. It's a completely valid random outcome, but it doesn't feel random.

## Understanding the problem
Users wanted Shuffle to feel more varied and less repetitive. Certain songs or artists seemed to surface again and again, while others felt buried.

From an engineering perspective: randomness by definition doesn't guarantee even distribution, but human expectations do.

## Our approach: fewer repeats, same randomness

1. Generate multiple random sequences
2. Score each sequence for freshness — check how recently you've listened to the songs
3. Pick the freshest version

We're not changing the math behind randomness; we're simply choosing the freshest sounding one.

The "Fewer Repeats" mode is now the default for Premium users.

## Standard Shuffle: still pure randomness

Uses the Mersenne Twister random number generator. Each song gets a unique value based on a randomly calculated "seed" number.

## Fine-tuning for the future
Experimenting with how we weight recent plays, artist diversity, and playlist size — all without adding complexity or latency for the listener.
