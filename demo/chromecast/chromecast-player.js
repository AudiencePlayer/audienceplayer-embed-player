import {EmbedPlayer, ChromecastControls} from '../../dist/bundle.js';
// or if you use `npm`: `import {EmbedPlayer, ChromecastControls} from 'audienceplayer-embed-player';`;

(function() {
    const urlQueryString = window.location.search;
    const urlParams = new URLSearchParams(urlQueryString);

    const articleId = +urlParams.get('articleId');
    const projectId = +urlParams.get('projectId');
    const assetId = +urlParams.get('assetId');
    const apiBaseUrl = urlParams.get('apiBaseUrl');
    const token = urlParams.get('token');
    const posterImageUrl = urlParams.get('posterImageUrl');
    const autoplay = urlParams.get('autoplay');
    const chromecastReceiverAppId = urlParams.get('chromecastReceiverAppId');
    const continueFromPreviousPosition = urlParams.get('continueFromPreviousPosition');
    const tokenParameter = token ? {token} : {};

    const initParam = {
        selector: '.video-wrapper',
        options: {
            autoplay: autoplay && autoplay === 'true',
        }
    };
    if (posterImageUrl) {
        initParam.options.poster = posterImageUrl;
    }

    const player = new EmbedPlayer({projectId, apiBaseUrl, chromecastReceiverAppId});

    const containerEl = document.getElementById('buttons-container');
    document.getElementById('video-button-start').addEventListener('click', playVideo);
    document.getElementById('video-button-stop').addEventListener('click', stopCastVideo);
    document.getElementById('video-button-destroy').addEventListener('click', destroyVideo);

    player.initChromecast().then(() => {
        const controls = new ChromecastControls(player.getCastPlayer(), player.getCastPlayerController());
        document.getElementById('cast-wrapper').style.visibility = 'visible';

        player.appendChromecastButton('#cast-wrapper');

        controls.onConnectedListener(connected => {
            player.initVideoPlayer(initParam);
            console.log('connected ', connected);
        });

    });

    function playVideo() {
        if (player.isConnected()) {
            player
                .castVideo({
                    articleId,
                    assetId,
                    ...tokenParameter,
                    continueFromPreviousPosition: continueFromPreviousPosition ? continueFromPreviousPosition === 'true' : true,
                })
                .catch(error => console.error(error));
        } else {
            player
                .play({
                    ...initParam,
                    articleId,
                    assetId,
                    ...tokenParameter,
                    continueFromPreviousPosition: continueFromPreviousPosition ? continueFromPreviousPosition === 'true' : true,
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }

    function stopCastVideo() {
        player.stopCasting();
    }

    function destroyVideo() {
        player.destroy();
    }
})();
