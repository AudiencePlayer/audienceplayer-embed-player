/// <reference types="chrome/chrome-cast" />
/// <reference types="chromecast-caf-sender" />
import { PlayConfig } from '../models/play-config';
import { Article } from '../models/article';
import { PlayParams } from '../models/play-params';
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
    onMediaInfoListener(callback: (state: chrome.cast.media.PlayerState, info: {
        articleId: number;
        assetId: number;
    }) => void): void;
    onCurrentTimeListener(callback: (currentTime: number, duration: number) => void): void;
    getSupportsHDR(): boolean;
    getCastMediaInfo(articlePlayConfig: PlayConfig, article: Article): chrome.cast.media.MediaInfo;
    getCastMediaInfoByParams(playParams: PlayParams, article?: Article): chrome.cast.media.MediaInfo;
    castVideo(playConfig: PlayConfig, article: Article, continueFromPreviousPosition: boolean): Promise<chrome.cast.ErrorCode>;
    castVideoByParams(playParams: PlayParams): Promise<chrome.cast.ErrorCode>;
    isConnected(): boolean;
    stopMedia(): void;
    endSession(stopCasting: boolean): void;
    stopCasting(): void;
    getCastPlayer(): cast.framework.RemotePlayer;
    getCastPlayerController(): cast.framework.RemotePlayerController;
    addMediaInfoToMetaData(article: Article, mediaInfo: chrome.cast.media.MediaInfo): void;
}
