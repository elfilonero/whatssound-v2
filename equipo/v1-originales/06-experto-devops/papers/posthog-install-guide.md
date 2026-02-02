# Install PostHog
Source: https://posthog.com/docs/getting-started/install

## Quick Install with Wizard

Install PostHog in seconds with the wizard:

```bash
npx -y @posthog/wizard@latest --region us
```

### Supported Frameworks
| Framework | Status |
|-----------|--------|
| React | Beta |
| Next.js | Beta |
| Svelte | Beta |
| React Native | Beta |
| Django | Beta |

## Recommendations

### Reverse Proxy (recommended)
Set up a reverse proxy so events are less likely to be intercepted by tracking blockers. Options:
- PostHog managed reverse proxy service
- Cloudflare
- AWS Cloudfront
- Vercel

### Grouping products in one project (recommended)
If you have multiple customer-facing products (marketing website + mobile app + web app), install PostHog on all and group them in one project to track users across their entire journey.

### Firewall/WAF Allowlists
Add these IPs for features like heatmaps:
- **EU**: 3.75.65.221, 18.197.246.42, 3.120.223.253
- **US**: 44.205.89.55, 52.4.194.122, 44.208.188.173

## HTML Snippet Installation

```html
<script>
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  posthog.init('<ph_project_api_key>',{api_host:'https://us.i.posthog.com', defaults:'2025-11-30'})
</script>
```

Once added, PostHog automatically captures $pageview and other events like button clicks.

## API Direct Integration

```
POST https://[your-instance].com/i/v0/e/
Content-Type: application/json

{
  "api_key": "<ph_project_api_key>",
  "event": "event_name",
  "properties": {
    "distinct_id": "distinct_id_of_your_user",
    "key1": "value1",
    "key2": "value2"
  },
  "timestamp": "[optional timestamp in ISO 8601 format]"
}
```
