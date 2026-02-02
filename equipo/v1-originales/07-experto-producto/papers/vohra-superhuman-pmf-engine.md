# How Superhuman Built an Engine to Find Product Market Fit — Rahul Vohra
Source: https://review.firstround.com/how-superhuman-built-an-engine-to-find-product-market-fit

This article is by Rahul Vohra, the founder and CEO of Superhuman — a startup building the fastest email experience in the world.

We've all heard that product-market fit drives startup success — and that the lack thereof is what's lurking behind almost every failure.

For founders, achieving product-market fit is an obsession from day one. It's both the hefty hurdle we're racing to clear and the festering fear keeping us up at night, worried that we'll never make it. But when it comes to understanding what product-market fit really is and how to get there, most of us quickly realize that there isn't a battle-tested approach.

In the summer of 2017, I was waist-deep in my search for a way to find product-market fit for my startup, Superhuman. Turning to the classic blog posts and seminal thought pieces, a few observations stuck out to me. Y Combinator founder Paul Graham described product-market fit as when you've made something that people want, while Sam Altman characterized it as when users spontaneously tell other people to use your product. But of course, the most cited description comes from Marc Andreessen's 2007 blog post:

> "You can always feel when product-market fit is not happening. The customers aren't quite getting value out of the product, word of mouth isn't spreading, usage isn't growing that fast, press reviews are kind of 'blah,' the sales cycle takes too long, and lots of deals never close.
>
> And you can always feel product-market fit when it is happening. The customers are buying the product just as fast as you can make it — or usage is growing just as fast as you can add more servers. Money from customers is piling up in your company checking account. You're hiring sales and customer support staff as fast as you can. Reporters are calling because they've heard about your hot new thing and they want to talk to you about it."

## ANCHORING AROUND A METRIC: A LEADING INDICATOR FOR PRODUCT-MARKET FIT

On my quest to understand product-market fit, I read all I could and spoke with every expert I could find. Everything changed when I found Sean Ellis, who ran early growth at Dropbox, LogMeIn, and Eventbrite and later coined the term "growth hacker."

The product-market fit definitions I had found were vivid and compelling, but they were lagging indicators. Instead, Ellis had found a leading indicator: just ask users **"how would you feel if you could no longer use the product?"** and measure the percent who answer **"very disappointed."**

After benchmarking nearly a hundred startups with his customer development survey, Ellis found that the magic number was **40%**. Companies that struggled to find growth almost always had less than 40% of users respond "very disappointed," whereas companies with strong traction almost always exceeded that threshold.

A helpful example comes from Hiten Shah, who posed Ellis' question to 731 Slack users in a 2015 open research project. 51% of these users responded that they would be very disappointed without Slack, revealing that the product had indeed reached product-market fit.

We identified users who recently experienced the core of our product, following Ellis' recommendation to focus on those who used the product at least twice in the last two weeks. We then emailed these users a survey asking:

1. How would you feel if you could no longer use Superhuman? A) Very disappointed B) Somewhat disappointed C) Not disappointed
2. What type of people do you think would most benefit from Superhuman?
3. What is the main benefit you receive from Superhuman?
4. How can we improve Superhuman for you?

With only 22% opting for the "very disappointed" answer, it was clear that Superhuman had not reached product-market fit. But I was energized — I had a tool and a plan.

## THE FOUR-STEP MANUAL FOR OPTIMIZING PRODUCT-MARKET FIT

### 1) Segment to find your supporters and paint a picture of your high-expectation customers.

We grouped the survey responses by their answer to the first question, then assigned a persona to each person. We focused on the personas in the very disappointed group — founders, managers, executives and business development.

With this more segmented view, our product-market fit score jumped by 10% to 33%.

We then used Julie Supan's high-expectation customer (HXC) framework to paint a vivid picture:

> Nicole is a hard-working professional who deals with many people. She may be an executive, founder, manager, or in business development. She works long hours, often into the weekend. She considers herself very busy, and wishes she had more time. She spends much of her work day in her inbox, reading 100–200 emails and sending 15–40 on a typical day. She considers it part of her job to be responsive, and prides herself on being so. She aims to get to Inbox Zero, but gets there at most two or three times a week.

Paul Graham's wisdom: "It's better to make something that a small number of people want a large amount, rather than a product that a large number of people want a small amount."

### 2) Analyze feedback to convert on-the-fence users into fanatics.

We focused on two key questions:
- Why do people love the product?
- What holds people back from loving the product?

From the "very disappointed" group's answers about main benefits, common themes emerged: **speed, focus and keyboard shortcuts**.

We then looked at the "somewhat disappointed" group, splitting them by whether speed was their main benefit:

- **Somewhat disappointed, speed NOT main benefit**: politely disregard — our main benefit didn't resonate
- **Somewhat disappointed, speed IS main benefit**: pay close attention — something small held them back

The main thing holding back our users was simple: our lack of a mobile app. Other requests: integrations, attachment handling, calendaring, unified inbox, better search, read receipts.

> Politely disregard those who would not be disappointed without your product. They are so far from loving you that they are essentially a lost cause.

### 3) Build your roadmap by doubling down on what users love and addressing what holds others back.

**Half the roadmap — doubling down on what users love:**
- More speed (UI response < 50ms, instant search)
- More shortcuts (comprehensive, pipelining keystrokes)
- More automation (Snippets with attachments, CC, CRM/ATS integration)
- More design flourishes (hundreds of small touches like `-->` → `→`)

**Other half — addressing what holds people back:**
- Mobile app
- Integrations
- Attachment handling
- Calendaring features
- Unified inbox
- Better search
- Read receipts

Stack-ranked using simple cost-impact analysis (low/medium/high for each).

> Spend half your time doubling down on what users already love and the other half on addressing what's holding others back.

### 4) Repeat the process and make the product-market fit score the most important metric.

We constantly surveyed new users to track our score (careful not to survey users more than once). The "very disappointed" percentage became our most important number, tracked weekly, monthly and quarterly.

**Results**: Starting at 22%, after segmenting we reached 33%. Within just three quarters of focused work, the score nearly doubled to **58%**.

## KEY TAKEAWAYS

- **Investors**: Avoid pushing for growth ahead of product-market fit
- **Founders**: When you hit your target product-market fit score, push the pedal all the way down and grow as fast as you can

The PMF survey question: "How would you feel if you could no longer use the product?" — with the magic threshold of 40% answering "very disappointed."
