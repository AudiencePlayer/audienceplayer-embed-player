# Audienceplayer Embed Player

This library allows to play your videos assets via the `headless` solution of the [AudiencePlayer](https://www.audienceplayer.com) video platform on your website. 

## Dependencies in your HTML

Embed the Azure Media Player and the library in your `index.html`

```html
<script src="https://static.audienceplayer.com/embed-player/azure-media-player/amp.min.js"></script>
<script src="https://static.audienceplayer.com/embed-player/embed-player.js" type="module"></script>
```

The Azure Media Player comes with default css:

```html
<link href="https://static.audienceplayer.com/embed-player/azure-media-player/amp.min.css" rel="stylesheet" />
<link href="https://static.audienceplayer.com/embed-player/azure-media-player/amp-flush.min.css" rel="stylesheet" />
```

## Usage

The basic usage of the player can be taken from the `index.html`. The above dependencies are visible in this file.
For your project, use the absolute URLs of the hosted version, so you will benefit from the latest version of the player and in case of Graph API changes, the player will not break.

Import embeddable-player in your javascript code

```javascript
import EmbedPlayer from 'embed-player.js';
```

and create a new instance of embeddable player:

```javascript
const player = new EmbedPlayer();
```

once created, you it's ready to be used on your website. To play an asset, just call
the `play()` method, and pass the following parameters:

-   **selector** - query selector of an element where you would like to embed your player
    (e.g. `.video-wrapper`, `#video-wrapper`, etc)
-   **apiBaseUrl** - the url where your articles and assets are hosted on
-   **articleId** - the id of an article, your desired asset belongs to
-   **assetId** - the id of the asset, you want to play
-   **token (optional)** - your authentication token. It's needed only if you want to play
    authentication protected assets
-   **posterImageUrl (optional)** - image that will be used as a initial player's background
    The `play()` method mentioned before provides a promise that, in case of successful asset fetch will
    return the player's config, otherwise - the error occurred.

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
