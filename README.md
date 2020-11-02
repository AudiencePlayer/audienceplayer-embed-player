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
-   **autoplay (optional)** - if true, player will start playing once looaded (mobile devices may have this disabled to protect bandwidth)

The `play()` method mentioned before provides a promise that, in case of successful asset fetch will return the player's config, otherwise - the error occurred.

The `destroy()` method will clean-up the underlying Azure Media Player, so that you can safely remove the element referred by the `selector` from the DOM.
This is typically used when playing the video in a modal dialog or from a different element in the DOM.

## Example of usage

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
