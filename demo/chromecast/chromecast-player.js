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

    const containerEl = document.querySelector('.media-player');
    const splashEl = document.querySelector('.media-player__overlay');
    const metaEl = document.querySelector('.media-player__meta');

    const initParam = {
        selector: '.media-player__video-player',
        options: {
            autoplay: autoplay && autoplay === 'true',
            overlay: {element: metaEl},
        },
    };

    const embedPlayer = new EmbedPlayer({projectId, apiBaseUrl, chromecastReceiverAppId});

    document.getElementById('video-button-start').addEventListener('click', playVideo);
    document.getElementById('video-button-destroy').addEventListener('click', destroyVideo);

    if (posterImageUrl) {
        splashEl.style.backgroundImage = `url(${posterImageUrl})`;
    }

    embedPlayer.initVideoPlayer(initParam);

    embedPlayer
        .initChromecast()
        .then(() => {
            const controls = new ChromecastControls(
                embedPlayer.getCastPlayer(),
                embedPlayer.getCastPlayerController(),
                '.media-player__chromecast-controls'
            );
            document.getElementById('cast-button').style.visibility = 'visible';

            embedPlayer.appendChromecastButton('#cast-button');

            const castSender = embedPlayer.getCastSender();
            castSender.onConnectedListener(({connected, friendlyName}) => {
                embedPlayer.initVideoPlayer({
                    ...initParam,
                    chromecastButton: !!chromecastReceiverAppId,
                });

                containerEl.classList.remove(connected ? 'media-player--video' : 'media-player--chromecast');
                containerEl.classList.add(connected ? 'media-player--chromecast' : 'media-player--video');
            });

            castSender.onCurrentTimeListener((currentTime, duration) => {
                if (currentTime > 0 && duration > 0 && currentTime + 1 > duration) {
                    // only update if currentTime > 0 due to chromecast bug sending last event of stream with 0
                    console.log('cc ended');
                    destroyVideo();
                }
            });
        })
        .catch(e => {
            console.log('e', e);
        });

    function playVideo() {
        containerEl.classList.remove('media-player--overlay');
        containerEl.classList.add('media-player--loading');

        if (embedPlayer.isConnected()) {
            embedPlayer
                .castVideo({
                    articleId,
                    assetId,
                    ...tokenParameter,
                    continueFromPreviousPosition: continueFromPreviousPosition ? continueFromPreviousPosition === 'true' : true,
                })
                .catch(error => console.error(error))
                .finally(() => {
                    containerEl.classList.remove('media-player--loading');
                });
        } else {
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
                })
                .finally(() => {
                    containerEl.classList.remove('media-player--loading');
                });

            const playerInstance = embedPlayer.getVideoPlayer();
            playerInstance.on('ended', () => {
                console.log('video ended');
            });
        }
    }

    function stopCastVideo() {
        embedPlayer.endSession(true);
    }

    function destroyVideo() {
        embedPlayer.destroy();

        containerEl.classList.add('media-player--overlay');
    }
})();
