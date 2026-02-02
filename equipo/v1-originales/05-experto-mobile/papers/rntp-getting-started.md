# Getting Started | React Native Track Player
Source: https://rntp.dev/docs/basics/getting-started

## Starting off
First, you need to register a playback service right after registering the main component of your app (typically in your index.js file):

```js
// AppRegistry.registerComponent(...);
TrackPlayer.registerPlaybackService(() => require('./service'));

// service.js
module.exports = async function() {
  // This service needs to be registered for the module to work
  // but it will be used later in the "Receiving Events" section
}
```

Then, you need to set up the player:
```js
import TrackPlayer from 'react-native-track-player';

await TrackPlayer.setupPlayer()
// The player is ready to be used
```

## Controlling the Player

### Adding Tracks to the Playback Queue
```js
var track1 = {
  url: 'http://example.com/avaritia.mp3',
  title: 'Avaritia',
  artist: 'deadmau5',
  album: 'while(1<2)',
  genre: 'Progressive House, Electro House',
  date: '2014-05-20T07:00:00+00:00',
  artwork: 'http://example.com/cover.png',
  duration: 402
};

const track2 = {
  url: require('./coelacanth.ogg'),
  title: 'Coelacanth I',
  artist: 'deadmau5',
  artwork: require('./cover.jpg'),
  duration: 166
};

const track3 = {
  url: 'file:///storage/sdcard0/Downloads/artwork.png',
  title: 'Ice Age',
  artist: 'deadmau5',
  artwork: 'file:///storage/sdcard0/Downloads/cover.png',
  duration: 411
};

await TrackPlayer.add([track1, track2, track3]);
```

### Player Information
```js
import TrackPlayer, { State } from 'react-native-track-player';

const state = await TrackPlayer.getState();
if (state === State.Playing) {
  console.log('The player is playing');
};

let trackIndex = await TrackPlayer.getCurrentTrack();
let trackObject = await TrackPlayer.getTrack(trackIndex);
console.log(`Title: ${trackObject.title}`);

const position = await TrackPlayer.getPosition();
const duration = await TrackPlayer.getDuration();
console.log(`${duration - position} seconds left.`);
```

### Changing Playback State
```js
TrackPlayer.play();
TrackPlayer.pause();
TrackPlayer.reset();
TrackPlayer.seekTo(12.5);
TrackPlayer.setVolume(0.5);
```

### Controlling the Queue
```js
await TrackPlayer.skip(trackIndex);
await TrackPlayer.skipToNext();
await TrackPlayer.skipToPrevious();
await TrackPlayer.remove([trackIndex1, trackIndex2]);
const tracks = await TrackPlayer.getQueue();
```

### Playback Events
```js
import TrackPlayer, { Event } from 'react-native-track-player';

const PlayerInfo = () => {
  const [trackTitle, setTrackTitle] = useState<string>();

  useTrackPlayerEvents([Event.PlaybackTrackChanged], async event => {
    if (event.type === Event.PlaybackTrackChanged && event.nextTrack != null) {
      const track = await TrackPlayer.getTrack(event.nextTrack);
      const {title} = track || {};
      setTrackTitle(title);
    }
  });

  return (<Text>{trackTitle}</Text>);
}
```

## Progress Updates
```js
import TrackPlayer, { useProgress } from 'react-native-track-player';

const MyPlayerBar = () => {
  const progress = useProgress();
  return (
    <View>
      <Text>{formatTime(progress.position)}</Text>
      <ProgressBar progress={progress.position} buffered={progress.buffered} />
    </View>
  );
}
```

## Track Player Options
```js
import TrackPlayer, { Capability } from 'react-native-track-player';

TrackPlayer.updateOptions({
  capabilities: [
    Capability.Play,
    Capability.Pause,
    Capability.SkipToNext,
    Capability.SkipToPrevious,
    Capability.Stop,
  ],
  compactCapabilities: [Capability.Play, Capability.Pause],
  playIcon: require('./play-icon.png'),
  pauseIcon: require('./pause-icon.png'),
  stopIcon: require('./stop-icon.png'),
  previousIcon: require('./previous-icon.png'),
  nextIcon: require('./next-icon.png'),
  icon: require('./notification-icon.png')
});
```
