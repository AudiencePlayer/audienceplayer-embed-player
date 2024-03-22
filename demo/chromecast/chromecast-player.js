import {EmbedPlayer, ChromecastControls} from '../../dist/bundle.js';
// or if you use `npm`: `import {EmbedPlayer, ChromecastControls} from 'audienceplayer-embed-player';`;

(function() {
    const urlQueryString = window.location.search;
    const urlParams = new URLSearchParams(urlQueryString);
    const allProperties = [
        'articleId',
        'projectId',
        'assetId',
        'apiBaseUrl',
        'token',
        'posterImageUrl',
        'chromecastReceiverAppId',
        'continueFromPreviousPosition',
    ];

    loadValues();
    storeValues(false);

    const articleId = +localStorage.getItem('articleId');
    const projectId = +localStorage.getItem('projectId');
    const assetId = +localStorage.getItem('assetId');
    const apiBaseUrl = localStorage.getItem('apiBaseUrl');
    const token = localStorage.getItem('token');
    const posterImageUrl = localStorage.getItem('posterImageUrl');
    const chromecastReceiverAppId = localStorage.getItem('chromecastReceiverAppId');
    const continueFromPreviousPosition = localStorage.getItem('continueFromPreviousPosition');
    const tokenParameter = token ? {token} : {};

    const containerEl = document.querySelector('.media-player');
    const splashEl = document.querySelector('.media-player__overlay');
    const metaEl = document.querySelector('.media-player__meta');

    const initParam = {
        selector: '.media-player__video-player',
        options: {
            autoplay: true,
            overlay: {element: metaEl},
        },
    };

    document.getElementById('video-button-start').addEventListener('click', playVideo);
    document.getElementById('video-button-destroy').addEventListener('click', destroyVideo);
    document.getElementById('setButton').addEventListener('click', () => storeValues(true));

    if (posterImageUrl) {
        splashEl.style.backgroundImage = `url(${posterImageUrl})`;
    }

    const embedPlayer = new EmbedPlayer({projectId, apiBaseUrl, chromecastReceiverAppId});
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
                    containerEl.classList.add('media-player--video');
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

        containerEl.classList.remove('media-player--video');
        containerEl.classList.remove('media-player--chromecast');
        containerEl.classList.add('media-player--overlay');
    }

    function storeProperty(name) {
        const propertyEl = document.getElementById(name);
        const value = propertyEl.type === 'checkbox' ? (propertyEl.checked ? 'true' : 'false') : '' + propertyEl.value;
        localStorage.setItem(name, value);
    }

    function loadProperty(name) {
        const propertyEl = document.getElementById(name);
        if (propertyEl.type === 'checkbox') {
            propertyEl.checked = localStorage.getItem(name) === 'true';
        } else {
            propertyEl.value = urlParams.get(name) || localStorage.getItem(name) || '';
        }
    }

    function storeValues(reload) {
        allProperties.forEach(name => {
            storeProperty(name);
        });

        if (reload) {
            const qs = allProperties.map(name => name + '=' + encodeURIComponent(localStorage.getItem(name))).join('&');
            location.href = `${location.protocol}//${location.host}${location.pathname}?${qs}&${Math.random()}`;
        }
    }

    function loadValues() {
        allProperties.forEach(name => {
            loadProperty(name);
        });
    }
})();
