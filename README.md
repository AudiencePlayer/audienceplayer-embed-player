# AudiencePlayer Embed Player

This library allows you to play your AudiencePlayer video assets on your website via the "headless" solution of the [AudiencePlayer video platform](https://www.audienceplayer.com).

## Installation

There is no npm package, so install from the GitHub link:
`npm install git+https://github.com/AudiencePlayer/audienceplayer-embed-player`

## Usage

### Usage with dependency management `npm`

The dependencies are set up in such a way that they should be peer dependencies in your project. So make sure that your project contains `video.js` and `videojs-contrib-eme` in its `package.json` with matching versions.
You can also use the pre-packaged JavaScript if you do not want to use peer dependencies. In that case, instead of adding the peer dependencies, `dist/videojs-packaged.js` can be included in a way that suits you.

N.B. make sure not to use `videojs-packaged.js` when you have set up the peer dependencies.

For example, in JavaScript:

```javascript
import videojs from 'video.js';
import 'videojs-contrib-eme';
import {EmbedPlayer} from 'audienceplayer-embed-player';
```

The styling/CSS part:
Depending on your project, you should import the video-js style from:

`node_modules/video.js/dist/video-js.css`

`node_modules/audienceplayer-embed-player/dist/style.css`

### Manual usage

Make sure the `dist` folder from this library is copied into your project, so you can reference it.

The JavaScript part: import the pre-packaged video.js in your HTML from:

```html
<script src="dist/videojs-packaged.js"></script>
```

Then you can import `embed-player` in your JavaScript code:

`import {EmbedPlayer} from 'dist/bundle.js';`

The styling/CSS part:

```html
<link href="dist/videojs-packaged.css" rel="stylesheet" /> <link href="dist/style.css" rel="stylesheet" />
```

## Methods

Create a new instance of `embed-player`:

```javascript
const apiBaseUrl = '<your-audienceplayer-api-url-here>'; // default: 'https://api.audienceplayer.com'
const projectId = 8; // your AudiencePlayer project id

const player = new EmbedPlayer(videojs /* global instance of videojs */, {apiBaseUrl, projectId});
```

The `play()` method provides a promise that, in case of a successful asset fetch, returns the player's config. Otherwise, an error is thrown.

The `destroy()` method will clean up the player so that you can safely remove the element referred to by the `selector` from the DOM.
This is typically used when playing the video in a modal dialog or from a different element in the DOM.

#### Important

Call `.destroy()` to make sure the `finish` stream-pulse is sent, so that the user will continue playing from an accurate position.

## Demo / examples

- A hosted demo can be found here: https://static.audienceplayer.com/embed-demo/demo/

- The manual example implementations can be found in the `demo` folder. Note the difference in the `import` statement when used with `npm`, so these examples are applicable there as well.

### Default usage with a video player

```javascript
// if you want to preload the player and show the poster, call .initVideoPlayer
player.initVideoPlayer({
    selector: '.video-wrapper', // query selector for an element where you would like to embed your player
    options: {
        poster: 'https://posterImageUrl', // url of image that will be used as the initial player background image
        autoplay: true, // start playing automatically. this will work if play follows a user event
    },
});

// if you want to set a different poster image URL after the player was already initialized
player.setVideoPlayerPoster('https://anotherPosterImageUrl');

// or, if you want to use the poster image that comes with the Article
// width and height resolution must be an available resize config (see API GraphQL Config.image_resize_resolutions)
player.setVideoPlayerPosterFromArticle(articleId, {width: 1280, height: 720});

// initVideoPlayer above can be omitted and you can call only .play.
// In any case, the `selector` and `options` properties should be provided to both methods.
player
    .play({
        selector: '.video-wrapper', // query selector for an element where you would like to embed your player
        options: {
            poster: 'https://posterImageUrl', // url of image that will be used as the initial player background image
            autoplay: true, // start playing automatically. this will work if play follows a user event
        },
        articleId: 1234, // the ID of an article to which your intended video asset belongs
        assetId: 4321, // the ID of the video asset you want to play
        token: 'some token', // optional; your authentication token (only necessary if you intend to embed
        fullscreen: true, // start playback in fullscreen. this will work if play follows a user event
        continueFromPreviousPosition: true, // indicates if your player supports nomadic watching. It is true by default.
        retryConfig: {
            // optional, to let the player retry for `Error 3` cases, usually due to CDN/network issues.
            maxRetryNum: 5, // the number of retries
            retryWindowMs: 5000, // for a given time window of 5 seconds
        },
    })
    .then(config => {
        console.log('Config', config);
    })
    .catch(error => {
        console.log('Error', error);
    });
```

The `Promise` returns a `config` object that can be used for debugging purposes, but is not needed outside the player.

When an error occurs, the `error` object contains the message and error code returned by the API. If `error` is not an object, the API was not reachable.

To destroy the player:

```javascript
player.destroy();
// The DOM element referred to by the selector, e.g. `.video-wrapper`, can now safely be removed.
```

Please note that it is possible to create multiple instances of `EmbedPlayer` and play multiple videos at the same time. This, however, is not tested and is not officially supported.

## Usage with Chromecast

See `demo/chromecast` for the integrated chromecast demo.

In case you need a custom implementation of the Chromecast controls, check `demo/custom-chromecast`

The demo projects will be expanded in the future, also showing a "Casting to device" message.

### Supported browsers

The latest versions of the following browsers are supported:

- Microsoft Edge
- Chrome (supports Chromecast)
- Firefox
- Safari
