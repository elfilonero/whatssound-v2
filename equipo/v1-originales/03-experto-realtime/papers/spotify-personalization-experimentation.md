# Why We Use Separate Tech Stacks for Personalization and Experimentation | Spotify Engineering
Source: https://engineering.atspotify.com/2026/1/why-we-use-separate-tech-stacks-for-personalization-and-experimentation

## Introduction
Personalized apps have become essential for improving user experience across diverse user bases. Rather than providing a one-size-fits-all experience, personalization delivers unique experiences tailored to individual preferences.

Modern recommendation systems leverage deep neural networks and LLMs to process rich feature sets, determining the optimal experience for each user in specific contexts.

At Spotify, we've ended up with clear separation between these domains. We build personalization systems using our ML/AI stack and improve them through our experimentation stack (Confidence).

## What is personalization?
Spotify examples include:
- Personal audio recommendations (playlists, weekly discovery, next-song suggestions)
- Personalized search (results tailored to listening and search history)
- Personalized home screen (shortcuts to frequently used features)

Reinforcement learning (RL) has become increasingly central to modern recommendation systems — sequentially recommending content based on user characteristics and context, then using responses to improve future recommendations.

## The overlap between personalization and experimentation
- **A/B tests:** Users randomized into variants to find the best-performing option on average
- **Multi-armed bandits:** Like A/B tests but adjust treatment proportions during the experiment
- **Contextual bandits:** Condition on user features when deciding which arm to serve — this is fundamentally personalization

## Why we separate experimentation and personalization at Spotify

### The technical side
Personalization needs access to all model types (boosting, random forests, neural networks, LLMs, regression, contextual bandits) with rich feature sets. Model inference needs low-latency feature access with real-time data collection. ML stacks are built for this.

### Why we still need to evaluate everything
Even if you use a contextual bandit within experimentation tools, you still need to evaluate it as a system through A/B tests.

### How we make it work together
Each tech stack does what it's good at. The ML stack serves recommendations; the experimentation stack evaluates them.

## The one-dimensional focus of multi-armed bandits
Most bandits optimize for a single metric. Most companies need variants that balance multiple competing objectives.

Example: A recommendation algorithm might boost immediate listening time by only suggesting familiar songs, but this reduces music discovery and harms long-term satisfaction.

At Spotify, reliable A/B testing across 300+ teams running thousands of experiments delivers more value than complex tools.

Also: most meaningful business metrics require patience. At Spotify, retention after several weeks or long-term listening behavior matters. Bandit weights can't be updated until outcomes are observed, potentially weeks later.

## How we run personalization experiments efficiently

### Start with separate stacks from day one
You need data architecture for collecting and using features at scale, with near-real-time features feeding into RL loops. You need compute infrastructure for fast inference.

### Build tools that actually scale
Last year, 58 teams ran 520 experiments just on the mobile app's home page.

### Make ML and experimentation platform integrations smooth
Custom integrations with any system. Sometimes integrations handle all experiment steps through UIs outside Confidence using API integrations.

## Wrapping up
Both personalization and experimentation are critical but work better with distinct approaches. The ML stack serves recommendations; the experimentation stack evaluates them. This lets multiple teams experiment at scale without getting in each other's way.
