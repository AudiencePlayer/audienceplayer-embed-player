import EmbedPlayer from './embed-player.js';

(function () {
    const urlQueryString = window.location.search;
    const urlParams = new URLSearchParams(urlQueryString);

    const articleId = +urlParams.get('articleId');
    const projectId = +urlParams.get('projectId');
    const assetId = +urlParams.get('assetId');
    const apiBaseUrl = urlParams.get('apiBaseUrl');
    const token = urlParams.get('token');
    const posterImageUrl = urlParams.get('posterImageUrl');
    const autoplay = urlParams.get('autoplay');

    const tokenParameter = token ? {token} : {};
    const posterImageUrlParameter = posterImageUrl ? {posterImageUrl} : {};

    const player = new EmbedPlayer();

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
})();
