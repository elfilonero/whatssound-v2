# Incident Report: Spotify Outage on April 16, 2025 | Spotify Engineering
Source: https://engineering.atspotify.com/2025/5/incident-report-spotify-outage-on-april-16-2025

On April 16, Spotify experienced an outage that affected users worldwide.

## Context
We use Envoy Proxy for our networking perimeter systems. The perimeter is the first piece of our software that receives user network traffic. It then distributes that traffic to other services. We use cloud regions to distribute traffic sensibly across the globe.

We develop and integrate custom filters to enhance Envoy's capabilities, including rate limiting.

## What happened?
On April 16 2025, between 12:20 and 15:45 UTC, we experienced an outage affecting the majority of users worldwide. Most traffic was disrupted, except to our Asia Pacific region due to timezone differences.

## What caused this outage?
We changed the order of our Envoy filters. This change was deemed low risk and applied to all regions simultaneously. Changing the order triggered a bug in one of our filters which caused Envoy to crash. This crash happened simultaneously on all Envoy instances.

The immediate restart of all Envoy instances, combined with client-side retry logic, created an unprecedented load spike. The surge exposed a misconfiguration: Envoy max heap size was set higher than the allowed Kubernetes memory limit. New instances started, received huge traffic, exceeded the memory limit, and Kubernetes shut them down — creating a continuous cycle.

Asia Pacific was unaffected due to lower traffic at that time of day.

## Timeline
- 12:18 UTC - Envoy filter order changed and all instances crash
- 12:20 UTC - Alarms triggered
- 12:28 UTC - No traffic worldwide except Asia Pacific
- 14:20 UTC - European regions recovered
- 15:10 UTC - US regions recovered
- 15:40 UTC - All traffic back to normal

## Mitigations
- Fixed the crash bug
- Fixed configuration mismatch between Envoy heap size and Kubernetes memory limits
- Improving rollout strategy for configuration changes
- Improving monitoring capabilities
