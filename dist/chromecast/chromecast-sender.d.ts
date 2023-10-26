/// <reference types="chrome/chrome-cast" />
/// <reference types="chromecast-caf-sender" />
import { ArticlePlayConfig } from '../models/play-config';
import { Article } from '../models/article';
export declare class ChromecastSender {
    private castContext;
    private castPlayer;
    private castPlayerController;
    private supportsHDR;
    init(chromecastReceiverAppId: string): Promise<void>;
    initializeCastApi(chromecastReceiverAppId: string): void;
    onConnectedListener(callback: (info: {
        connected: boolean;
        friendlyName: string;
    }) => void): void;
    getSupportsHDR(): boolean;
    getCastMediaInfo(articlePlayConfig: ArticlePlayConfig, article: Article): chrome.cast.media.MediaInfo;
    getLicenseUrlFromSrc(src: string, token: string): {
        licenseUrl: string;
        token: string;
    } | {
        licenseUrl?: undefined;
        token?: undefined;
    };
    castVideo(playConfig: ArticlePlayConfig, article: Article, continueFromPreviousPosition: boolean): Promise<chrome.cast.ErrorCode>;
    isConnected(): boolean;
    stopCasting(): void;
    getCastPlayer(): cast.framework.RemotePlayer;
    getCastPlayerController(): cast.framework.RemotePlayerController;
}
