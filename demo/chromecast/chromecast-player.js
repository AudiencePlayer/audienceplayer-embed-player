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

    const splashEl = document.querySelector('.splash-overlay');
    const metaEl = document.querySelector('.meta');

    const initParam = {
        selector: '.video-wrapper',
        options: {
            autoplay: autoplay && autoplay === 'true',
        },
        overlayElement: metaEl,
    };
    if (posterImageUrl) {
        initParam.options.poster = posterImageUrl;
    }

    const embedPlayer = new EmbedPlayer({projectId, apiBaseUrl, chromecastReceiverAppId});

    const containerEl = document.getElementById('buttons-container');
    document.getElementById('video-button-start').addEventListener('click', playVideo);
    document.getElementById('video-button-destroy').addEventListener('click', destroyVideo);

    if (posterImageUrl) {
        splashEl.style.backgroundImage = `url(${posterImageUrl})`;
    }

    embedPlayer.initVideoPlayer(initParam);

    embedPlayer
        .initChromecast()
        .then(() => {
            const controls = new ChromecastControls(embedPlayer.getCastPlayer(), embedPlayer.getCastPlayerController(), '.container');
            document.getElementById('cast-button').style.visibility = 'visible';

            embedPlayer.appendChromecastButton('#cast-button');

            const castSender = embedPlayer.getCastSender();
            castSender.onConnectedListener(({connected, friendlyName}) => {
                console.log('CC onConnected', connected, friendlyName);
                embedPlayer.initVideoPlayer({
                    ...initParam,
                    chromecastButton: !!chromecastReceiverAppId,
                });
                splashEl.style.display = 'flex';
                metaEl.style.display = 'block';
            });
        })
        .catch(e => {
            console.log('e', e);
        });

    function playVideo() {
        metaEl.style.display = 'block';
        splashEl.style.display = 'none';

        if (embedPlayer.isConnected()) {
            embedPlayer
                .castVideo({
                    articleId,
                    assetId,
                    ...tokenParameter,
                    continueFromPreviousPosition: continueFromPreviousPosition ? continueFromPreviousPosition === 'true' : true,
                })
                .catch(error => console.error(error));
        } else {
            metaEl.style.display = 'none';

            embedPlayer
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
        embedPlayer.endSession(true);
    }

    function destroyVideo() {
        embedPlayer.destroy();
        splashEl.style.display = 'flex';
        metaEl.style.display = 'block';
    }
})();
