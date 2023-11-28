# Audienceplayer Embed Player

This library allows you to play your AudiencePlayer videos assets on your website, via the "headless" solution of the [AudiencePlayer video platform](https://www.audienceplayer.com).

## Installation

There is no npm package, so install from the GitHub link:
`npm install git+https://github.com/AudiencePlayer/audienceplayer-embed-player`

Check below section `Example of usage` or check out the example project https://github.com/AudiencePlayer/audienceplayer-embed-player-projects

Please mind that `dist/video.js` and `dist/style.css` from this library should be treated as "static files". They should be included directly into your HTML or added as static files via a framework (e.g. Angular, Webpack).
The library comes with a compiled `dist/bundle.js`, so no `npm prepare` or more dependencies are needed or installed.

## Manual implementation without dependency management

Copy all files from `dist/` to your project, next to your `index.html`. (in our `demo` folders we link to `../../dist` for simplicity)

Include the static scripts in your `index.html`:

```html
<script src="video.js"></script>
```

The player comes with default css:

```html
<link href="style.css" rel="stylesheet" />
```

Import `embed-player` in your javascript code:

`import {EmbedPlayer} from 'bundle.js';`

or if you have used npm:

`import {EmbedPlayer} from 'audienceplayer-embed-player';`

## Methods

Create a new instance of the `embed-player`:

```javascript
const apiBaseUrl = '<your-audienceplayer-api-url-here>'; // default: 'https://api.audienceplayer.com'
const projectId = 8; // your AudiencePlayer project id

const player = new EmbedPlayer({apiBaseUrl, projectId});
```

The `play()` method provides a promise that, in case of successful asset fetch will return the player's config, otherwise - an error will be thrown.

The `destroy()` method will clean-up the player, so that you can safely remove the element referred by the `selector` from the DOM.
This is typically used when playing the video in a modal dialog or from a different element in the DOM.
####important: call .destroy() to make sure the `finish` stream-pulse is sent, so that the user will continue playing on an accurate position.

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

An example of this can be found in https://github.com/AudiencePlayer/audienceplayer-embed-player-projects/tree/main/src, where the queryString params can be used to set the needed variables.

Please take note that it is possible to create multiple instances of the EmbedPlayer and play multiple video's at the same time. This however is not tested and not officially supported.

## Usage with ChromeCast

Besides just using the embedded player, when you have an AudiencePlayer ChromeCast receiver application, you can offer
video playout via a ChromeCast device that is on the same local network.
In the below example, it is shown how you can set this up with the `chromecast receiver app id` which you will then have
received from AudiencePlayer.

Add the `ChromecastControls` class;

### using npm

```js
import {ChromecastControls} from 'embed-player';
```

### manual implementation

In the manual implementation the ChromecastControls are available from the main bundle.

```javascript
import {ChromecastControls} from 'bundle.js';
```

### example

```javascript
const chromecastReceiverAppId = `000000`; // replace with the receiver app id
const token = ''; // replace with your JWT access token or do not provide the `token` property
const posterImageUrl = 'https://path/to/image'; // or do not provide the `posterImageUrl` property
const player = new EmbedPlayer({projectId, apiBaseUrl, chromecastReceiverAppId});

// the #cast-wrapper element will contain the ChromeCast button; you should place this in a recognisable spot next
// to the play-button/thumbnail or in the menu.
player.initChromecast().then(() => {
    const controls = new ChromecastControls(player.getCastPlayer(), player.getCastPlayerController());

    // add the chromecast button
    player.appendChromecastButton('#cast-wrapper');
});

// call the playVideo function `onClick` of the play-button/thumbnail
function playVideo() {
    if (player.isConnected()) {
        // there is a ChromeCast connection; cast the video
        player
            .castVideo({
                apiBaseUrl,
                articleId,
                projectId,
                assetId,
                token,
                continueFromPreviousPosition: true,
            })
            .catch(error => console.error(error));
    } else {
        // ChromeCast is not connected; play the video directly
        player
            .play({
                selector: '.video-wrapper',
                options: {
                    poster: posterImageUrl,
                    autoplay: true,
                },
                articleId,
                projectId,
                assetId,
                token,
                continueFromPreviousPosition: true,
            })
            .catch(error => {
                console.error(error);
            });
    }
}

// to stop casting (the cast controls contain a stop button)
function stopCastVideo() {
    player.stopCasting();
    player.destroy();
}
```

The manual example implementations can be found in the `demo` folder. Note the difference in `import` statement when used with `npm`, so these examples are applicable there as well.

### Important to note:

In the demo/chromecast, a number of layers are used and shown depending of the state of the player (e.g. when chromecast is connected the chromecast controls are shown).
For your own implementation, you can customize this behavior.

### Supported browsers

The latest versions of the following browsers are supported:

-   Microsoft Edge
-   Chrome (supports Chromecast)
-   Firefox
-   Safari
