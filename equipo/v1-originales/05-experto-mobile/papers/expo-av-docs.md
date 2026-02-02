# Expo AV
Source: https://docs.expo.dev/versions/latest/sdk/av/

A universal library that provides separate APIs for Audio and Video playback.

**Platforms:** Android, iOS, tvOS, Web
**Bundled version:** ~16.0.8

**Deprecated:** The Video and Audio APIs from expo-av have now been deprecated and replaced by improved versions in expo-video and expo-audio. We recommend using those libraries instead. expo-av is not receiving patches and will be removed in SDK 55.

The Audio.Sound objects and Video components share a unified imperative API for media playback.

## Installation

```bash
npx expo install expo-av
```

## Configuration in app config

```json
{
  "expo": {
    "plugins": [
      [
        "expo-av",
        {
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone."
        }
      ]
    ]
  }
}
```

## Usage

### Example: Audio.Sound

```js
await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

const playbackObject = new Audio.Sound();
// OR
const { sound: playbackObject } = await Audio.Sound.createAsync(
  { uri: 'http://foo/bar.mp3' },
  { shouldPlay: true }
);
```

### Example: setOnPlaybackStatusUpdate()

```js
_onPlaybackStatusUpdate = playbackStatus => {
  if (!playbackStatus.isLoaded) {
    if (playbackStatus.error) {
      console.log(`Encountered a fatal error during playback: ${playbackStatus.error}`);
    }
  } else {
    if (playbackStatus.isPlaying) {
      // Update your UI for the playing state
    } else {
      // Update your UI for the paused state
    }
    if (playbackStatus.isBuffering) {
      // Update your UI for the buffering state
    }
    if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
      // The player has just finished playing
    }
  }
};

playbackObject.setOnPlaybackStatusUpdate(this._onPlaybackStatusUpdate);
```

## Default Initial Playback Status

```js
{
  progressUpdateIntervalMillis: 500,
  positionMillis: 0,
  shouldPlay: false,
  rate: 1.0,
  shouldCorrectPitch: false,
  volume: 1.0,
  isMuted: false,
  isLooping: false,
}
```

## API Methods

### getStatusAsync()
Gets the AVPlaybackStatus of the playbackObject.

### setStatusAsync(status)
Sets a new AVPlaybackStatusToSet on the playbackObject.

### loadAsync(source, initialStatus, downloadAsync)
Loads the media from source into memory and prepares it for playing.

### playAsync()
Equivalent to `playbackObject.setStatusAsync({ shouldPlay: true })`.

### pauseAsync()
Equivalent to `playbackObject.setStatusAsync({ shouldPlay: false })`.

### stopAsync()
Equivalent to `playbackObject.setStatusAsync({ shouldPlay: false, positionMillis: 0 })`.

### unloadAsync()
Unloads the media from memory.

### playFromPositionAsync(positionMillis, tolerances)
Play from specific position.

### replayAsync(status)
Replays the playback item from the beginning.

### setIsLoopingAsync(isLooping)
Set looping behavior.

### setIsMutedAsync(isMuted)
Set muted state.

### setPositionAsync(positionMillis, tolerances)
Seek to position.

### setRateAsync(rate, shouldCorrectPitch, pitchCorrectionQuality)
Set playback rate (0.0 to 32.0).

### setVolumeAsync(volume, audioPan)
Set volume (0.0 to 1.0) and optional pan (-1.0 to 1.0).

## Types

### AVPlaybackSource
- Network URL dictionary
- require('path/to/file')
- Asset object

### AVPlaybackStatus
Union of AVPlaybackStatusError | AVPlaybackStatusSuccess

### AVPlaybackStatusSuccess Properties
- androidImplementation, audioPan, didJustFinish, durationMillis
- isBuffering, isLoaded, isLooping, isMuted, isPlaying
- pitchCorrectionQuality, playableDurationMillis, positionMillis
- progressUpdateIntervalMillis, rate, shouldCorrectPitch
- shouldPlay, uri, volume

## Seek Tolerance (iOS)
When asked to seek, the native iOS player may seek to a slightly different time for performance. Use tolerance parameters for precision at the cost of increased delay.

## Permissions

### Android
- RECORD_AUDIO

### iOS
- NSMicrophoneUsageDescription
