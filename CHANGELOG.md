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
