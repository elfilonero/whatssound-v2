# Getting Started | React Navigation
Source: https://reactnavigation.org/docs/getting-started/

The Fundamentals section covers the most important aspects of React Navigation. It should be enough to build a typical mobile application and give you the background to dive deeper into the more advanced topics.

## Prior knowledge
If you're already familiar with JavaScript, React and React Native, you'll be able to get moving with React Navigation quickly! If not, we recommend gaining some basic knowledge first, then coming back here when you're done.

- [React Documentation](https://react.dev/learn)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)

## Minimum requirements

- react-native >= 0.72.0
- expo >= 52 (if you use Expo Go)
- typescript >= 5.0.0 (if you use TypeScript)

## Starter template

You can use the React Navigation template to quickly set up a new project:

```bash
npx create-expo-app@latest --template react-navigation/template
```

## Installation

The @react-navigation/native package contains the core functionality of React Navigation.

### Installing dependencies

Next, install the dependencies: react-native-screens and react-native-safe-area-context.

**Expo:**
```bash
npx expo install react-native-screens react-native-safe-area-context
```

## Setting up React Navigation

When using React Navigation, you configure navigators in your app. Navigators handle transitions between screens and provide UI such as headers, tab bars, etc.

### Static configuration
The static configuration API lets you write your navigation configuration in an object. This reduces boilerplate and simplifies TypeScript types and deep linking. This is the recommended way.

### Dynamic configuration
The dynamic configuration API lets you write your navigation configuration using React components that can change at runtime based on state or props. This offers more flexibility but requires significantly more boilerplate.
