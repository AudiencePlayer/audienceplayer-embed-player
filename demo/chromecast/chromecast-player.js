import {VideoPlayer} from '../../dist/bundle.js';
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
        chromecastButton: true,
    };

    const playParams = {
        articleId,
        assetId,
        token,
        continueFromPreviousPosition,
    };

    document.getElementById('video-button-start').addEventListener('click', playVideo);
    document.getElementById('setButton').addEventListener('click', () => storeValues(true));

    if (posterImageUrl) {
        splashEl.style.backgroundImage = `url(${posterImageUrl})`;
    }

    // chromecastReceiverAppId

    const videoPlayer = new VideoPlayer(videojs, apiBaseUrl, projectId, chromecastReceiverAppId);
    videoPlayer.init(initParam);

    function playVideo() {
        videoPlayer
            .playByParams(playParams)
            .then(() => {
                // containerEl.classList.add('media-player--video');
            })
            .catch(e => {
                console.log('e', e);
            });
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
