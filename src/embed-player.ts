import {VideoPlayer} from './video-player/video-player';
import {ChromecastSender} from './chromecast/chromecast-sender';
import {ApiService} from './api/api-service';
import {ArticlePlayConfig} from './models/play-config';
import {PlayParams, PlayParamsChromecast} from './models/play-params';
import {toPlayConfigError} from "./api/converters";

export class EmbedPlayer {
    private videoPlayer: VideoPlayer;
    private castSender: ChromecastSender;
    private apiService: ApiService;

    constructor() {
        this.videoPlayer = new VideoPlayer();
        this.castSender = new ChromecastSender();
        this.apiService = new ApiService();
    }

    initPlayer(selector: string | Element) {
        this.destroy();
    }

    play({
        selector,
        apiBaseUrl,
        projectId,
        articleId,
        assetId,
        token,
        posterImageUrl,
        autoplay,
        fullScreen,
        continueFromPreviousPosition,
    }: PlayParams) {
        if (!selector) {
            return Promise.reject('selector property is missing');
        }
        if (!apiBaseUrl) {
            return Promise.reject('apiBaseUrl property is missing');
        }
        if (!articleId) {
            return Promise.reject('articleId property is missing');
        }
        if (!assetId) {
            return Promise.reject('assetId property is missing');
        }
        if (!projectId) {
            return Promise.reject('projectId property is missing');
        }
        this.apiService.init(apiBaseUrl, projectId);
        this.apiService.setToken(token);
        this.videoPlayer.init(selector, apiBaseUrl, projectId, {autoplay, poster: posterImageUrl});

        return this.apiService.getArticleAssetPlayConfig(articleId, assetId, continueFromPreviousPosition).then(config => {
            this.playVideo(config, posterImageUrl, fullScreen);
            return config;
        }).catch(error => {
            console.log(toPlayConfigError(error.code));
            throw error;
        });
    }

    destroy() {
        this.videoPlayer.destroy();
    }

    playVideo(config: ArticlePlayConfig, posterImageUrl: string, fullScreen: boolean) {
        this.videoPlayer.play(config, posterImageUrl, fullScreen);
    }

    setupChromecast(selector: string | Element, chromecastReceiverAppId: string) {
        const castButtonContaner = selector instanceof Element ? selector : document.querySelector(selector);
        const castButton = document.createElement('google-cast-launcher');
        castButtonContaner.appendChild(castButton);
        return this.castSender.init(chromecastReceiverAppId);
    }

    castVideo({apiBaseUrl, projectId, articleId, assetId, token, continueFromPreviousPosition}: PlayParamsChromecast) {
        if (!apiBaseUrl) {
            return Promise.reject('apiBaseUrl property is missing');
        }
        if (!articleId) {
            return Promise.reject('articleId property is missing');
        }
        if (!assetId) {
            return Promise.reject('assetId property is missing');
        }
        if (!projectId) {
            return Promise.reject('projectId property is missing');
        }

        this.apiService.init(apiBaseUrl, projectId);
        this.apiService.setToken(token);

        return Promise.all([
            this.apiService.getArticleAssetPlayConfig(articleId, assetId, continueFromPreviousPosition),
            this.apiService.getArticle(articleId, assetId),
        ]).then(([config, article]) => {
            this.castSender.castVideo(config, article, continueFromPreviousPosition);
            return config;
        }).catch(error => {
            console.log(toPlayConfigError(error.code));
            throw error;
        });
    }

    getCastPlayer() {
        return this.castSender.getCastPlayer();
    }

    getCastPlayerController() {
        return this.castSender.getCastPlayerController();
    }

    isConnected() {
        return this.castSender.isConnected();
    }

    stopCasting() {
        this.castSender.stopCasting();
    }
}
//*** Example of usage ***//

// const player = new EmbeddablePlayer();
//
// player
//     .play({
//         selector: '.video-wrapper',
//         apiBaseUrl: '',
//         projectId: '',
//         articleId: '',
//         assetId: '',
//         token: '',
//         posterImageUrl: '',
//         fullScreen: false
//         continueFromPreviousPosition: true
//     })
//     .then(config => {
//         console.log('Config', config);
//     })
//     .catch(error => {
//         console.log('Error', error);
//     });

//*** Example of usage with chromecast ***//

// const player = new EmbeddablePlayer();
// player.setupChromecast("#cast-wrapper", CHROMECAST_RECEIVER_APP_ID);
//
// player
//     .castVideo({
//         apiBaseUrl: '',
//         projectId: '',
//         articleId: '',
//         assetId: '',
//         token: '',
//         continueFromPreviousPosition: true
//     })
//     .then(config => {
//         console.log('Config', config);
//     })
//     .catch(error => {
//         console.log('Error', error);
//     });
