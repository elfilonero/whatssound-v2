# Reimagining Design Systems at Spotify
Source: https://spotify.design/article/reimagining-design-systems-at-spotify

Article credits: Marina Posniak, Shaun Bent, Gerrit Kaiser

In November we introduced Encore, Spotify's new approach to design systems. Encore is a family of design systems, managed by distributed teams.

## How We Got Here

### Early Days (pre-2013)
No design system — building everything for the first time. When the mobile app launched in 2009, there were few standards or shared patterns, and the Spotify experience got increasingly inconsistent.

### First Alignment (2013)
Kicked off first real attempt to align visual design across platforms. Introduced the signature dark experience.

### Brand Refresh (2014-2015)
New color palette, new typeface (Circular), lots of visual updates. Set up a fully-staffed team: **GLUE (Global Language Unified Experience)**.

GLUE was successful in many ways:
- Refreshed look and feel
- Standardized components across mobile and desktop
- Grew from handful of people to 30+ full-time engineers and designers

**The catch**: GLUE was a single, centralized team — great for consistency but became a bottleneck. Didn't fit Spotify's "aligned autonomy" culture.

### Growth Phase (2018)
- 200 designers
- 2000 engineers
- 45 different platforms (cars, smartwatches, speakers, smart fridges)
- Strategy: ubiquity — Spotify accessible anywhere

### Grassroots Phase
After GLUE disbanded, designers and engineers made their own systems:
- Tape (web design system, from New York team)
- Separate system for design tokens (Stockholm team)
- And more...

Result: **22 different design systems** floating around. Very confusing.

## Introducing Encore

Encore is the **family of design systems** that has everything teams need to build beautiful, scalable Spotify apps.

It isn't a single monolithic thing — it's a framework that brings existing design systems under one brand, a **"system of systems."**

Multiple design systems inside Encore, each managed by a different team. Anyone building products at Spotify can contribute.

### Structure

#### Encore Foundation
The center — color, type styles, motion, spacing, plus guidelines for writing and accessibility. Home of **design tokens**. This is the minimum bar for every Spotify product.

#### Encore Web
Typical web design system components: buttons, dialogs, form controls. Used in web apps, websites, desktop client, and even the fridge app. Includes everything from Foundation.

#### Encore Mobile
Common components shared across multiple mobile apps (still being defined).

#### Local Design Systems
Design elements tailored for specific products or audiences. Examples:
- Spotify for Artists (special navigation, table layouts)
- Main Spotify app (shared mobile components for iOS and Android)

Systems stay connected because they're all built using **design tokens** and live on the same website.

### Each System Provides:
- Design assets, code, and documentation
- Builds on the other systems
- Is actively maintained by a dedicated team
- Has a defined interface for engineers

## Key Lessons

> A design system isn't one-size-fits-all — it needs to be tailored to the company's needs.

The biggest lesson: **understand the company culture and adapt to it**. For Spotify, that meant:
- Acknowledging the huge product landscape
- Embracing autonomous team ways of working
- Having a family of design systems instead of a single system
- Distributed team ownership instead of centralized control
