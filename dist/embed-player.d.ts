/// <reference types="chromecast-caf-sender" />
import { ArticlePlayConfig } from './models/play-config';
import { InitParams, PlayParams, PlayParamsChromecast } from './models/play-params';
export declare class EmbedPlayer {
    private projectId;
    private apiBaseUrl;
    private chromecastReceiverAppId;
    private videoPlayer;
    private castSender;
    private apiService;
    constructor(properties: {
        projectId: number;
        apiBaseUrl: string;
        chromecastReceiverAppId: string;
    });
    initVideoPlayer(initParams: InitParams): void;
    setVideoPlayerPoster(posterUrl: string): void;
    setVideoPlayerPosterFromArticle(articleId: number, posterSize: {
        width: number;
        height: number;
    }): Promise<void>;
    play(playParams: PlayParams): Promise<ArticlePlayConfig>;
    destroy(): void;
    playVideo(config: ArticlePlayConfig, playParams: PlayParams): void;
    getVideoPlayer(): void;
    initChromecast(): Promise<void>;
    appendChromecastButton(selector: string | Element): void;
    castVideo({ articleId, assetId, token, continueFromPreviousPosition }: PlayParamsChromecast): Promise<ArticlePlayConfig>;
    getCastPlayer(): cast.framework.RemotePlayer;
    getCastPlayerController(): cast.framework.RemotePlayerController;
    isConnected(): boolean;
    stopCasting(): void;
}
