# Audienceplayer Embed Player

This library allows you to play your AudiencePlayer videos assets on your website, via the "headless" solution of the [AudiencePlayer video platform](https://www.audienceplayer.com). 

## Installation

There is no npm package, so install from the GitHub link:
`npm install git+https://github.com/AudiencePlayer/audienceplayer-embed-player`

Check below section `Example of usage` or check out the example project https://github.com/AudiencePlayer/audienceplayer-embed-player-projects

Please mind that the Azure Media Player library should be treated using "static files", meaning that they should be included directly into your HTML instead of a framework (e.g. Angular) or build tool (e.g. Webpack)


## Manual implementation without dependency management

Copy all files and folders from `src/` to your project, next to your `index.html`.

Include the Azure Media Player and this library in your `index.html`:

```html
<script src="azure-media-player-[version]/amp.min.js"></script>
<script src="embed-player.js" type="module"></script>
```

The Azure Media Player comes with default css:

```html
<link href="azure-media-player-[version]/amp.min.css" rel="stylesheet" />
<link href="azure-media-player-[version]/amp-flush.min.css" rel="stylesheet" />
<link href="embed-player.css" rel="stylesheet" />
```

Mind to replace the [version] with the latest (or desired) version


Import `embed-player` in your javascript code:

## Methods

Create a new instance of the `embed-player`:

```javascript
const player = new EmbedPlayer();
```

Once created it is ready for use on your website. To play an asset, just call the `play()` method, and pass the following parameters:

-   **selector** - query selector of an element where you would like to embed your player
    (e.g. `.video-wrapper`, `#video-wrapper`, etc).
-   **apiBaseUrl** - the url where your articles and assets are hosted on.
-   **articleId** - the id of an article, to which your intended video asset belongs.
-   **assetId** - the id of the video asset, you want to play.
-   **token (optional)** - your authentication token (only necessary if you intend to embed
    video assets that require authentication/authorization)
-   **posterImageUrl (optional)** - image that will be used as the initial player background image.
-   **autoplay (optional)** - if true, player will start playing once loaded (mobile devices may have this disabled to protect bandwidth)
-   **fullScreen (optional)** - if true, player will start in full screen once loaded
-   **hasNomadics (option)** - indicates if your player supports nomadic watching. It is true by default.

The `play()` method mentioned before provides a promise that, in case of successful asset fetch will return the player's config, otherwise - the error occurred.

The `destroy()` method will clean-up the underlying Azure Media Player, so that you can safely remove the element referred by the `selector` from the DOM.
This is typically used when playing the video in a modal dialog or from a different element in the DOM.
####important: call .destroy() to make sure the `finish` stream-pulse is sent, so that the user will continue playing on an accurate position.

## Example of usage

Import the class; 

using npm

```js
import {EmbedPlayer} from 'embed-player';
```

or via the manual implementation
```javascript
import EmbedPlayer from 'embed-player.js';
```


### Default usage with a video player
```javascript
const player = new EmbedPlayer();

player
    .play({
        selector: '.video-wrapper',
        apiBaseUrl: 'https://<your-audienceplayer-api-url-here>',
        projectId: 4,
        articleId: 1234,
        assetId: 4321,
        token: '',
        hasNomadics: true
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

````javascript
player.destroy();
// DOM element refered by the selector, e.g. `.video-wrapper` can now safely be removed. 
````

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
In the manual implementation make sure to add the extra dependencies in `index.html`

```html
<script src="chromecast-controls.js" type="module"></script>
<link href="chromecast-controls.css" rel="stylesheet" />
```

and import via the js module:

```javascript
import ChromecastControls from 'chromecast-controls.js';
```

### example

```javascript

const chromecastReceiverAppId = `000000`; // replace with the receiver app id
const player = new EmbedPlayer();
// the #cast-wrapper element will contain the ChromeCast button; you should place this in a recognisable spot next
// to the play-button/thumbnail or in the menu.
player
    .setupChromecast('#cast-wrapper', chromecastReceiverAppId)
    .then(() => {
            const controls = new ChromecastControls(player.getCastPlayer(), player.getCastPlayerController());
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
                ...tokenParameter,
            })
            .catch((error) => console.error(error));
    } else {
        // ChromeCast is not connected; play the video directly
        player
            .play({
                selector: '.video-wrapper',
                apiBaseUrl,
                articleId,
                projectId,
                assetId,
                ...tokenParameter,
                ...posterImageUrlParameter,
                autoplay: autoplay && autoplay === 'true',
                hasNomadics: true
            })
            .catch((error) => {
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

A complete implementation example of the above can be found here:

https://github.com/AudiencePlayer/audienceplayer-embed-player-projects/tree/main/src/demo

### Important to note: 
 
In this demo, the `embed-player` is only used when there is no ChromeCast session. 
The reason for this is that the Azure Media Player is unaware of the ChromeCast session, so pressing play inside the player will
always just play the video in the player, regardless of the session.

In the situation where you already show the `embed-player` and want to make used of ChromeCast, we advise to show a thumbnail
with a play icon instead and use this as the button to cast the video or start the video with the autoplay option to true.
We also advise to then show the player inside a modal dialog, so that when the dialog is closed, the user will see the thumbnail again. 

#### Styling the ChromeCast controls

The chromecast controls have a default styling, which can be changed via the css variables (prefixed with `--chromecast-`).
Another option is to completely replace the chromecast-controls.css with your own implementation.

### Supported browsers
The latest versions of the following browsers are supported:

* Microsoft Edge
* Chrome (supports Chromecast)
* Firefox
* Safari

