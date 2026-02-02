# React Native | Sentry for React Native
Source: https://docs.sentry.io/platforms/react-native/

## Learn how to set up Sentry's React Native SDK.

Sentry's React Native SDK automatically reports errors and exceptions in your application.

In addition to capturing errors, you can monitor interactions between multiple services or applications by enabling tracing. You can also collect and analyze performance profiles from real users with profiling.

## Installation

```bash
npx @sentry/wizard@latest -i reactNative
```

Sentry Wizard will patch your project accordingly. The following tasks will be performed:

- Install the @sentry/react-native package
- Add @sentry/react-native/metro to metro.config.js
- Add @sentry/react-native/expo to app.json Expo configuration
- Enable Sentry React Native Gradle build step for Android (source maps + debug symbols)
- Wrap Bundle React Native code Xcode build phase script
- Add Upload Debug Symbols to Sentry Xcode build phase
- Run pod install
- Store build credentials in ios/sentry.properties, android/sentry.properties and env.local
- Configure Sentry for the supplied DSN

## Configuration

```js
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: "___PUBLIC_DSN___",
  sendDefaultPii: true,
  // Tracing
  tracesSampleRate: 1.0,
  // Logs
  enableLogs: true,
  // Profiling
  profilesSampleRate: 1.0,
  // Session Replay
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [Sentry.mobileReplayIntegration()],
});
```

## Auto-instrumentation

Wrap your app with Sentry.wrap for touch event tracking and automatic tracing:

```js
export default Sentry.wrap(App);
```

## Verify

```js
throw new Error("My first Sentry error!");
```

## Next Steps

- Learn about features of Sentry's React Native SDK
- Add readable stack traces to errors
- Add Apple Privacy manifest
