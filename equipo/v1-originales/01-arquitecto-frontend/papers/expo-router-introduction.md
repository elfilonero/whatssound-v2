# Introduction to Expo Router
### Source: https://docs.expo.dev/router/introduction/

---

Expo Router is a file-based router for React Native and web applications. It allows you to manage navigation between screens in your app, allowing users to move seamlessly between different parts of your app's UI, using the same components on multiple platforms (Android, iOS, and web).

It brings the best file-system routing concepts from the web to a universal application — allowing your routing to work across every platform. When a file is added to the app directory, the file automatically becomes a route in your navigation.

## Features

- **Native**: Built on top of our powerful React Navigation suite, Expo Router navigation is truly native and platform-optimized by default.

- **Shareable**: Every screen in your app is automatically deep linkable. Making any route in your app shareable with links.

- **Offline-first**: Apps are cached and run offline-first, with automatic updates when you publish a new version. Handles all incoming native URLs without a network connection or server.

- **Optimized**: Routes are automatically optimized with lazy-evaluation in production, and deferred bundling in development.

- **Iteration**: Universal Fast Refresh across Android, iOS, and web, along with artifact memoization in the bundler to keep you moving fast at scale.

- **Universal**: Android, iOS, and web share a unified navigation structure, with the ability to drop-down to platform-specific APIs at the route level.

- **Discoverable**: Expo Router enables build-time static rendering on web, and universal linking to native. Meaning your app content can be indexed by search engines.

### Using a different navigation library

You can use any other navigation library, like React Navigation, in your Expo project. However, if you are building a new app, we recommend using Expo Router for all the features described above. With other navigation libraries, you might have to implement your own strategies for some of these features.

If you are looking to use React Native Navigation by Wix, it is not available in Expo Go and is not yet compatible with expo-dev-client. We recommend using createNativeStackNavigator from React Navigation to use Android and iOS native navigation APIs.

## Common questions

- Expo Router versus Expo versus React Native CLI
- Can I use Expo Router in my existing React Native app?
- What are the benefits of file-based routing?
- Why should I use Expo Router over React Navigation?
- How do I server-render my Expo Router website?

## Next steps

- **Quick start**: Learn how to quickly get started using Expo Router.
- **Manual installation**: Detailed instructions on how to get started and add Expo Router to your existing app.
- **Router 101**: For core concepts, notation patterns, navigation layouts, and common navigation patterns.
- **Example app**: See the source code for the example app on GitHub.
