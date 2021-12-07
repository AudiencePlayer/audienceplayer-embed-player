# Audienceplayer Embed Player

This library allows you to play your AudiencePlayer videos assets on your website, via the "headless" solution of the [AudiencePlayer video platform](https://www.audienceplayer.com). 

## Hosted solution

There is no need to (npm) install anything into your project. It should be used as a remotely hosted solution, where you include the needed scripts and styles directly into your HTML.


## Dependencies in your HTML

Embed the Azure Media Player and this library in your `index.html`, using the absolute URL's:

```html
<script src="https://static.audienceplayer.com/embed-player/azure-media-player/amp.min.js"></script>
<script src="https://static.audienceplayer.com/embed-player/embed-player.min.js" type="module"></script>
```

The Azure Media Player comes with default css:

```html
<link href="https://static.audienceplayer.com/embed-player/azure-media-player/amp.min.css" rel="stylesheet" />
<link href="https://static.audienceplayer.com/embed-player/azure-media-player/amp-flush.min.css" rel="stylesheet" />
<link href="https://static.audienceplayer.com/embed-player/embed-player.min.css" rel="stylesheet" />
```

## Usage

The basic implementation is demonstrated in [index.html](src/index.html). The dependencies above are visible in this file (in this case with relative URL's).
For your project, use the absolute URLs of the hosted version, so you will benefit from the latest version of the player and in case of Graph API changes, the player will not break.

Import `embed-player` in your javascript code:

```javascript
import EmbedPlayer from 'embed-player.js';
```

and create a new instance of the `embed-player`:

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

The `play()` method mentioned before provides a promise that, in case of successful asset fetch will return the player's config, otherwise - the error occurred.

The `destroy()` method will clean-up the underlying Azure Media Player, so that you can safely remove the element referred by the `selector` from the DOM.
This is typically used when playing the video in a modal dialog or from a different element in the DOM.

## Example of usage

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

An example of this can be found in `src/index.html`, where the queryString params can be used to set the needed variables.

### Styling improvements of video player controls
Video player controls by default are well styled for all large/medium screen devices but on mobile viewport,
controls often disappear. To fix this, please add the following CSS code after all your CSS imports in a way to override the default
library styling:
```css
.amp-flush-skin .amp-logo {
    display: none !important;
}

.amp-closedcaption-control {
    display: none !important;
}

.azuremediaplayer.amp-flush-skin.amp-size-s .vjs-control-bar .amp-controlbaricons-left .vjs-play-control {
    display: block !important;
}

.amp-flush-skin .vjs-text-track-display > div > div > div {
    background-color: transparent !important;
    text-shadow: 0.1rem 0.1rem 0.05rem #000;
    }
```



### Usage with ChromeCast option

Besides just using the embedded player, when you have an AudiencePlayer ChromeCast receiver application, you can offer 
video playout via a ChromeCast device that is on the same local network.
In the below example, it is shown how you can set this up with the `chromecast receiver app id` which you will then have 
received from AudiencePlayer.


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

An example of this can be found in `demo/index.html`, where the queryString params can be used to set the needed variables.
When testing the demo, mind that this example uses relative imports to `../src`.

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

