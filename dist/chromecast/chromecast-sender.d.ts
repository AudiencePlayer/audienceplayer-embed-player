/// <reference types="chrome/chrome-cast" />
/// <reference types="chromecast-caf-sender" />
import { PlayConfig } from '../models/play-config';
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
    onMediaInfoListener(callback: (info: any) => void): void;
    getSupportsHDR(): boolean;
    getCastMediaInfo(articlePlayConfig: PlayConfig, article: Article, extraInfo?: any): chrome.cast.media.MediaInfo;
    getLicenseUrlFromSrc(src: string, token: string): {
        licenseUrl: string;
        token: string;
    } | {
        licenseUrl?: undefined;
        token?: undefined;
    };
    castVideo(playConfig: PlayConfig, article: Article, continueFromPreviousPosition: boolean, extraInfo?: any): Promise<chrome.cast.ErrorCode>;
    isConnected(): boolean;
    stopCasting(): void;
    getCastPlayer(): cast.framework.RemotePlayer;
    getCastPlayerController(): cast.framework.RemotePlayerController;
}
