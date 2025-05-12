# 4.0.0

`VideoPlayer.play()` method no longer needs `initParams` argument

Chromecast `mediaInfo.customData` should contain properties `articleId` and `assetId` instead of the JSON string `extraInfo` which contained the `articleId` and `assetId`.

`ChromecastSender` constructor gets the chromecast receiver id as argument instead of `ChromecastSender.init()`.

# 3.0.1

Expose logging as a package for internal use.

# 3.0.0

Updated video.js to 8.22.0 and the videojs-contrib-eme plugin to 5.5.1

Changes to handling with the global instance of `videojs` to enable projects to add 'videojs' as peer dependencies.

Split videojs packaged css and css that belongs to the library, allowing projects to completely use another theme and have a way to still leverage the css that is belongs to this library.

`EmbedPlayer` and `VideoPlayer` constructor now expect to get an instance of `videojs`.

### Upgrade instructions if you want to keep using the old pre packaged videojs dependencies:

The `dist` folder now contains `videojs-packaged.js`, `videojs-packaged.css` and `style.css` instead of the old `video.js` and `style.css`. Note that the `style.css` only contains the styles needed for this library and the videojs css will now come from the `videojs-packaged.css`, so make sure to include it as well.
Replace occurrences of the `EmbedPlayer` and `VideoPlayer` constructors with the extra `videojs` argument; e.g. `new EmbedPlayer(videojs, properties: {projectId: 8, apiBaseUrl: 'https://...'; chromecastReceiverAppId: 'A...'})`

# 2.5.0

Update `node` to `v22.14.0`, typescript to `5.4.5`

Distribution files built again.

# 2.4.0

Extended the `PlayConfig` with new optional `skipIntro` property to be able to show a "skip the intro button", which is implemented as a `ClickableComponent` videojs plugin.

```
skipIntro?: {
    start: number;
    end: number;
    label: string;
};
```

`start` and `end` in seconds.
The `label` contains the text for the skip button label.

# 2.3.0

Extended the `InitParam` with the video.js `skipButtons` configuration.
The below example shows a configuration with 10 seconds skip for both forward and backward buttons.

```
{
    skipButtons: {forward: 10, backward: 10}
}
```

`skipButtons` is optional, and can also have the value `false` to explicitly not set the skipButtons.

# 2.2.1

Hide progress bar and time when it's a LIVE stream

# 2.1

Added resolution to logging

# 2.0.4

Updated video.js to 8.11.8

# 2.0

The base player has changed from `azure-media-player` to `video-js`.
Any custom css that relies on elements of the azure-media player should be converted via the usage of a video-js skin (or the default skin `vjs-default-skin` is used).

## Breaking changes

### constructor

The API base URL and project id now become arguments of the constructor.

Old:

```
const player = new EmbedPlayer();
```

New:

```typescript
const projectId = 8; // replace with your project id
const apiBaseUrl = 'https://api.audienceplayer.com';
const player = new EmbedPlayer({apiBaseUrl, projectId});
```

### optional init before play

```typescript
// in case you want to preload the player and show the poster, call .initVideoPlayer
player.initVideoPlayer({
    selector: '.video-wrapper', // query selector of an element where you would like to embed your player
    options: {
        poster: 'https://posterImageUrl', // url of image that will be used as the initial player background image
        autoplay: true, // start playing automatically. this will work if play follows from a user event
    },
    defaultSkinClass: '', // optional, if not provided, `vjs-default-skin` is used
    chromecastButton: true, // if your project has a chromecast receiver app and you want a chromecast button in the play control bar
});
```

### play method arguments

Old:

```typescript
player.play({
    selector: '.video-wrapper',
    apiBaseUrl: '<your-audienceplayer-api-url-here>', // default: 'https://api.audienceplayer.com'
    projectId: 4,
    articleId: 1234,
    assetId: 4321,
    token: '',
    continueFromPreviousPosition: true,
});
```

`options` property is new, `apiBaseUrl` and `projectId` removed:
New:

```typescript
player.play({
    selector: '.video-wrapper', // query selector of an element where you would like to embed your player
    options: {
        poster: 'https://posterImageUrl', // url of image that will be used as the initial player background image
        autoplay: true, // start playing automatically. this will work if play follows from a user event
    },
    articleId: 1234, // the id of an article, to which your intended video asset belongs.
    assetId: 4321, // the id of the video asset, you want to play.
    token: 'some token', // optional; your authentication token (only necessary if you intend to embed
    fullscreen: true, // start play in fullscreen. this will work if play follows from a user event
    continueFromPreviousPosition: true, // indicates if your player supports nomadic watching. It is true by default.
    defaultSkinClass: '', // optional, if not provided, `vjs-default-skin` is used
    chromecastButton: true, // if your project has a chromecast receiver app and you want a chromecast button in the play control bar
});
```

## Important:

If you have used the `player.initVideoPlayer`, the properties to initialize the player will not be used to initialize the player again,
so e.g. no new skin will be applied if it's different from the call to init!

### Chromecast integration

The constructor gets an optional `chromecastReceiverAppId` property;

```typescript
const projectId = 8; // replace with your project id
const apiBaseUrl = 'https://api.audienceplayer.com';
const chromecastReceiverAppId = `000000`; // replace with your cast receiver id
const player = new EmbedPlayer({projectId, apiBaseUrl, chromecastReceiverAppId});
```

Initialize the chromecast controls

Old:

```typescript
player.setupChromecast('#cast-wrapper', chromecastReceiverAppId).then(() => {
    const controls = new ChromecastControls(player.getCastPlayer(), player.getCastPlayerController());
});
```

New:

```typescript
// the #cast-wrapper element will contain the ChromeCast button; you should place this in a recognisable spot next
// to the play-button/thumbnail or in the menu.
player.initChromecast().then(() => {
    const controls = new ChromecastControls(player.getCastPlayer(), player.getCastPlayerController());

    // add the chromecast button
    player.appendChromecastButton('#cast-wrapper');
});
```

Casting the video.

Old:

```typescript
player.castVideo({
    apiBaseUrl,
    articleId,
    projectId,
    assetId,
    ...tokenParameter,
    continueFromPreviousPosition: true,
});
```

New:

```typescript
player.castVideo({
    articleId,
    assetId,
    token,
    continueFromPreviousPosition: true,
});
```

Recommended is to have the chromecast controls as part of the player controls.
An example implementation can be found in `demo/chromecast/`
