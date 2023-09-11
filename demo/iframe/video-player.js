import {EmbedPlayer} from '../../dist/bundle.js';
// or if you use `npm`: `import {EmbedPlayer} from 'audienceplayer-embed-player';`

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
    const continueFromPreviousPosition = urlParams.get('continueFromPreviousPosition');
    const tokenParameter = token ? {token} : {};
    const initParam = {
        selector: '.video-wrapper',
        options: {
            autoplay: autoplay && autoplay === 'true',
        }
    };

    const embedPlayer = new EmbedPlayer({projectId, apiBaseUrl});

    embedPlayer.initVideoPlayer(initParam);

    if (posterImageUrl) {
        embedPlayer.setVideoPlayerPoster(posterImageUrl);
    } else {
        embedPlayer.setVideoPlayerPosterFromArticle(articleId, {width: 1280, height: 720});
    }
    embedPlayer
        .play({
            ...initParam,
            articleId,
            assetId,
            ...tokenParameter,
            continueFromPreviousPosition: continueFromPreviousPosition ? continueFromPreviousPosition === 'true' : true,
        }).catch(error => {
            console.error(error);
        });
})();
