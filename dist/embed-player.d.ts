/// <reference types="chromecast-caf-sender" />
import { ChromecastSender } from './chromecast/chromecast-sender';
import { PlayConfig } from './models/play-config';
import { InitParams, PlayParams } from './models/play-params';
export declare class EmbedPlayer {
    private projectId;
    private apiBaseUrl;
    private videoPlayer;
    private castSender;
    private apiService;
    constructor(videojsInstance: any, properties: {
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
    play(playParams: PlayParams): Promise<void>;
    destroy(): void;
    playVideo(config: PlayConfig): void;
    getVideoPlayer(): any;
    appendChromecastButton(selector: string | Element): void;
    castVideo(playParams: PlayParams): Promise<PlayConfig>;
    getCastSender(): ChromecastSender;
    getCastPlayer(): cast.framework.RemotePlayer;
    getCastPlayerController(): cast.framework.RemotePlayerController;
    isConnected(): boolean;
    endSession(stopCasting: boolean): void;
}
