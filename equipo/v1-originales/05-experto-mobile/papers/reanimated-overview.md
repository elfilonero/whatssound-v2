# React Native Reanimated
Source: https://docs.swmansion.com/react-native-reanimated/

## React Native

## Create smooth animations with an excellent developer experience.

### Declarative
Reanimated comes with declarative API for creating animations. Complexity reduced from tens of methods to just a few. Define what the animation should look like and leave Reanimated to animate the styles and properties for you.

### Performant
Reanimated lets you define animations in plain JavaScript which run natively on the UI thread by default. Smooth animations and interactions up to 120 fps and beyond. Reanimated delivers a native experience your users deserve.

### Feature-rich
Reanimated's power doesn't end on animating only simple views or images. Hook your animations into device sensors or keyboard. Create amazing experiences using Layout Animations or animate elements between navigation screens with ease.

#### Learn more about the features in the newest article about Reanimated 4
[See blog post](https://blog.swmansion.com/reanimated-4-stable-release-the-future-of-react-native-animations-ba68210c3713)

#### Animations
Animate every React Native prop on iOS, Android and the Web up to 120 fps.

```js
function App() {
  const width = useSharedValue(100);
  const handlePress = () => {
    width.value = withSpring(width.value + 50);
  };
  return <Animated.View style={{ ...styles.box, width }} />
}
```

#### Gestures
Gesture smoothly thanks to Reanimated's integration with React Native Gesture Handler.

```js
import { Gesture, GestureDetector } from "react-native-gesture-handler";

function App() {
  const pan = Gesture.Pan();
  return (
    <GestureDetector gesture={pan}>
      <Animated.View />
    </GestureDetector>
  );
}
```

#### Layout animations
Animate views when they are added and removed from the view hierarchy.

```js
function App() {
  return <Animated.View entering={FadeIn} exiting={FadeOut} />;
}
```

#### Sensor-based animations
Connect your animations to a gyroscope or accelerometer with just one hook.

```js
const gyroscope = useAnimatedSensor(SensorType.GYROSCOPE);

useDerivedValue(() => {
  const { x, y, z } = gyroscope.sensor.value;
});
```

#### Keyboard-based animations
Create animations based on the device keyboard state and position.

```js
function App() {
  const keyboard = useAnimatedKeyboard();
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -keyboard.height.value }],
  });
}
```

## We are Software Mansion
React Native Core Contributors and experts in dealing with all kinds of React Native issues.
