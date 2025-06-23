# Audienceplayer Embed Player

This library allows you to play your AudiencePlayer videos assets on your website, via the "headless" solution of the [AudiencePlayer video platform](https://www.audienceplayer.com).

## Installation

There is no npm package, so install from the GitHub link:
`npm install git+https://github.com/AudiencePlayer/audienceplayer-embed-player`

## Usage

### Usage with dependency management `npm`

The dependencies are set up in such a way that they should be peer dependencies in your project. So make sure that your project contains 'video.js' and 'videojs-contrib-eme' in it's package.json with matching versions.
You can also use the pre-packaged javascript if you do not want to use it as peer dependencies; then instead of adding the peer dependenices, the `dist/videojs-packaged.js` can also be included in a way that suits you.

N.B. make sure to NOT use the videojs-packaged.js when you have set up the peer dependencies.

E.g. for javascript:

```javascript
import videojs from 'video.js';
import 'videojs-contrib-eme';
import {EmbedPlayer} from 'audienceplayer-embed-player';
```

The styling/css part:
Depending on your project, you should import the video-js style from

`node_modules/video.js/dist/video-js.css`

`node_modules/audienceplayer-embed-player/dist/style.css`

### Manual usage

Make sure the `dist` folder from this library is copied into your project, so you can reference it.

The javascript part: import the pre-packaged videojs in your html from

```html
<script src="dist/videojs-packaged.js"></script>
```

Then you can import `embed-player` in your javascript code:

`import {EmbedPlayer} from 'bundle.js';`

The styling/css part:

```html
<link href="dist/videojs-packaged.css" rel="stylesheet" /> <link href="dist/style.css" rel="stylesheet" />
```

## Methods

Create a new instance of the `embed-player`:

```javascript
const apiBaseUrl = '<your-audienceplayer-api-url-here>'; // default: 'https://api.audienceplayer.com'
const projectId = 8; // your AudiencePlayer project id

const player = new EmbedPlayer(videojs /* global instance of videojs */, {apiBaseUrl, projectId});
```

The `play()` method provides a promise that, in case of successful asset fetch will return the player's config, otherwise - an error will be thrown.

The `destroy()` method will clean-up the player, so that you can safely remove the element referred by the `selector` from the DOM.
This is typically used when playing the video in a modal dialog or from a different element in the DOM.
####important: call .destroy() to make sure the `finish` stream-pulse is sent, so that the user will continue playing on an accurate position.

## Demo / examples

-   A hosted demo can be found here: https://static.audienceplayer.com/embed-demo/demo/

-   The manual example implementations can be found in the `demo` folder. Note the difference in `import` statement when used with `npm`, so these examples are applicable there as well.

### Default usage with a video player

```javascript
// in case you want to preload the player and show the poster, call .initVideoPlayer
player.initVideoPlayer({
    selector: '.video-wrapper', // query selector of an element where you would like to embed your player
    options: {
        poster: 'https://posterImageUrl', // url of image that will be used as the initial player background image
        autoplay: true, // start playing automatically. this will work if play follows from a user event
    },
});

// in case you want to set a different posterImage url after the player was already initialized
player.setVideoPlayerPoster('https://anotherPosterImageUrl');

// or in case you want to use the poster image that comes with the Article
// width and height resolution must be an available resize config (see API GraphQL Config.image_resize_resolutions)
player.setVideoPlayerPosterFromArticle(articleId, {width: 1280, height: 720});

// above initVideoPlayer can be omitted and you can only call .play.
// In any case, the `selector` and `options` properties should be provided to both methods.
player
    .play({
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
    })
    .then(config => {
        console.log('Config', config);
    })
    .catch(error => {
        console.log('Error', error);
    });
```

The `Promise` returns a `config` object that can be used for debugging purposes, but is not needed outside the player.

When an error occurs, the `error` object will contain the message and error code returned by the API. If the `error` is not an object, the API was not reachable.

To destroy the player:

```javascript
player.destroy();
// DOM element refered by the selector, e.g. `.video-wrapper` can now safely be removed.
```

Please take note that it is possible to create multiple instances of the EmbedPlayer and play multiple video's at the same time. This, however, is not tested and not officially supported.

## Usage with ChromeCast

See `demo/chromecast` for the integrated chromecast demo.

In case you need a custom implementation of the Chromecast controls, check `demo/custom-chromecast`

The demo projects will be expanded in the future, also showing a "Casting to device" message.

### Supported browsers

The latest versions of the following browsers are supported:

-   Microsoft Edge
-   Chrome (supports Chromecast)
-   Firefox
-   Safari
