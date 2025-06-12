import {VideoPlayer} from './video-player/video-player';
import {ChromecastSender} from './chromecast/chromecast-sender';
import {ApiService} from './api/api-service';
import {PlayConfig} from './models/play-config';
import {InitParams, PlayParams} from './models/play-params';
import {getArticleBackgroundImage, getResizedUrl, toPlayConfigError} from './api/converters';

export class EmbedPlayer {
    private projectId: number;
    private apiBaseUrl: string;
    private videoPlayer: VideoPlayer;
    private castSender: ChromecastSender;
    private apiService: ApiService;

    constructor(videojsInstance: any, properties: {projectId: number; apiBaseUrl: string; chromecastReceiverAppId: string}) {
        this.projectId = properties.projectId;
        this.apiBaseUrl = properties.apiBaseUrl.replace(/\/*$/, '');
        this.apiService = new ApiService(this.apiBaseUrl, this.projectId);
        this.videoPlayer = new VideoPlayer(videojsInstance, this.apiBaseUrl, this.projectId, properties.chromecastReceiverAppId);
        this.castSender = this.videoPlayer.getCastSender();
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
        return this.videoPlayer.playByParams(playParams);
    }

    destroy() {
        this.videoPlayer.destroy();
    }

    playVideo(config: PlayConfig) {
        this.videoPlayer.play(config);
    }

    getVideoPlayer() {
        return this.videoPlayer.getPlayer();
    }

    appendChromecastButton(selector: string | Element) {
        const castButtonContaner = selector instanceof Element ? selector : document.querySelector(selector);
        const castButton = document.createElement('google-cast-launcher');
        castButtonContaner.appendChild(castButton);
    }

    castVideo(playParams: PlayParams) {
        if (!playParams.articleId) {
            return Promise.reject('articleId property is missing');
        }
        if (!playParams.assetId) {
            return Promise.reject('assetId property is missing');
        }

        this.apiService.setToken(playParams.token);

        return Promise.all([this.apiService.getArticleAssetPlayConfig(playParams), this.apiService.getArticle(playParams.articleId)])
            .then(([config, article]) => {
                this.castSender.castVideo(config, article, playParams.continueFromPreviousPosition);
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

    endSession(stopCasting: boolean) {
        this.castSender.endSession(stopCasting);
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
