import EmbeddablePlayer from './embeddable-player.js';
(function() {
    const urlQueryString = window.location.search;
    const urlParams = new URLSearchParams(urlQueryString);

    const articleId = +urlParams.get('articleId');
    const projectId = +urlParams.get('projectId');
    const assetId = +urlParams.get('assetId');
    const apiBaseUrl = urlParams.get('apiBaseUrl');
    const token = urlParams.get('token');
    const posterImageUrl = urlParams.get('posterImageUrl');

    const tokenParameter = token ? {token} : {};
    const posterImageUrlParameter = posterImageUrl ? {posterImageUrl} : {};

    const player = new EmbeddablePlayer();

    player
        .play({
            selector: '.video-wrapper',
            apiBaseUrl,
            articleId,
            projectId,
            assetId,
            ...tokenParameter,
            ...posterImageUrlParameter,
        })
        .then(config => {
            console.log('Config', config);
        })
        .catch(error => {
            console.log('Error', error);
        });
})();
