import {VideoPlayer} from './video-player/video-player';
import {ChromecastSender} from './chromecast/chromecast-sender';
import {ApiService} from './api/api-service';
import {PlayConfig} from './models/play-config';
import {InitParams, PlayParams, PlayParamsChromecast} from './models/play-params';
import {getArticleBackgroundImage, getResizedUrl, toPlayConfigError} from './api/converters';

export class EmbedPlayer {
    private projectId: number;
    private apiBaseUrl: string;
    private chromecastReceiverAppId: string;
    private videoPlayer: VideoPlayer;
    private castSender: ChromecastSender;
    private apiService: ApiService;

    constructor(properties: {projectId: number; apiBaseUrl: string; chromecastReceiverAppId: string}) {
        this.projectId = properties.projectId;
        this.apiBaseUrl = properties.apiBaseUrl.replace(/\/*$/, '');
        this.chromecastReceiverAppId = properties.chromecastReceiverAppId ? properties.chromecastReceiverAppId : null;
        this.apiService = new ApiService(this.apiBaseUrl, this.projectId);
        this.videoPlayer = new VideoPlayer(this.apiBaseUrl, this.projectId);
        this.castSender = new ChromecastSender();
    }

    initVideoPlayer(initParams: InitParams) {
        this.videoPlayer.init(initParams);
    }

    setVideoPlayerPoster(posterUrl: string) {
        this.videoPlayer.setPoster(posterUrl);
    }

    setVideoPlayerPosterFromArticle(articleId: number, posterSize: {width: number; height: number}) {
        return this.apiService.getArticle(articleId).then(article => {
            this.videoPlayer.setPoster(getResizedUrl(getArticleBackgroundImage(article), posterSize));
        });
    }

    play(playParams: PlayParams) {
        if (!playParams.articleId) {
            return Promise.reject('articleId property is missing');
        }
        if (!playParams.assetId) {
            return Promise.reject('assetId property is missing');
        }
        this.apiService.setToken(playParams.token ? playParams.token : null);

        return this.apiService
            .getArticleAssetPlayConfig(playParams.articleId, playParams.assetId, playParams.continueFromPreviousPosition)
            .then(config => {
                this.playVideo(config, playParams);
                return config;
            })
            .catch(error => {
                console.log(toPlayConfigError(error.code));
                throw error;
            });
    }

    destroy() {
        this.videoPlayer.destroy();
    }

    playVideo(config: PlayConfig, playParams: PlayParams) {
        this.videoPlayer.play(config, playParams);
    }

    getVideoPlayer() {
        return this.videoPlayer.getPlayer();
    }

    initChromecast() {
        if (!this.chromecastReceiverAppId) {
            return Promise.reject('No Chromecast receiver app id');
        }
        return this.castSender.init(this.chromecastReceiverAppId);
    }

    appendChromecastButton(selector: string | Element) {
        const castButtonContaner = selector instanceof Element ? selector : document.querySelector(selector);
        const castButton = document.createElement('google-cast-launcher');
        castButtonContaner.appendChild(castButton);
    }

    castVideo({articleId, assetId, token, continueFromPreviousPosition}: PlayParamsChromecast) {
        if (!articleId) {
            return Promise.reject('articleId property is missing');
        }
        if (!assetId) {
            return Promise.reject('assetId property is missing');
        }

        this.apiService.setToken(token);

        return Promise.all([
            this.apiService.getArticleAssetPlayConfig(articleId, assetId, continueFromPreviousPosition),
            this.apiService.getArticle(articleId),
        ])
            .then(([config, article]) => {
                this.castSender.castVideo(config, article, continueFromPreviousPosition);
                return config;
            })
            .catch(error => {
                console.log(toPlayConfigError(error.code));
                throw error;
            });
    }

    getCastSender() {
        return this.castSender;
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
