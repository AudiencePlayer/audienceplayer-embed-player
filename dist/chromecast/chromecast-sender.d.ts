/// <reference types="chrome/chrome-cast" />
/// <reference types="chromecast-caf-sender" />
import { PlayConfig } from '../models/play-config';
import { Article } from '../models/article';
import { PlayParams } from '../models/play-params';
import { TrackInfo } from '../models/cast-info';
export declare class ChromecastSender {
    private chromecastReceiverAppId;
    private castContext;
    private castPlayer;
    private castPlayerController;
    private supportsHDR;
    private onConnectedListener;
    private onMediaInfoListener;
    private onCurrentTimeListener;
    private onMediaTracksListener;
    private onDurationListener;
    constructor(chromecastReceiverAppId: string);
    init(): Promise<void>;
    initializeCastApi(chromecastReceiverAppId: string): void;
    setOnConnectedListener(callback: (info: {
        connected: boolean;
        friendlyName: string;
    }) => void): void;
    setOnMediaInfoListener(callback: (state: chrome.cast.media.PlayerState, info: {
        articleId: number;
        assetId: number;
    }) => void): void;
    setOnCurrentTimeListener(callback: (currentTime: number) => void): void;
    setOnMediaTracksListener(callback: (audioTracks: TrackInfo[], textTracks: TrackInfo[]) => void): void;
    setOnDurationListener(callback: (duration: number) => void): void;
    getSupportsHDR(): boolean;
    getCastMediaInfo(articlePlayConfig: PlayConfig, article: Article): chrome.cast.media.MediaInfo;
    getCastMediaInfoByParams(playParams: PlayParams, article?: Article): chrome.cast.media.MediaInfo;
    getCastSession(): chrome.cast.media.Media;
    castVideo(playConfig: PlayConfig, article: Article, continueFromPreviousPosition: boolean): Promise<chrome.cast.ErrorCode>;
    castVideoByParams(playParams: PlayParams): Promise<chrome.cast.ErrorCode>;
    isConnected(): boolean;
    stopMedia(): void;
    endSession(stopCasting: boolean): void;
    stopCasting(): void;
    getCastPlayer(): cast.framework.RemotePlayer;
    getCastPlayerController(): cast.framework.RemotePlayerController;
    addMediaInfoToMetaData(article: Article, mediaInfo: chrome.cast.media.MediaInfo): void;
    getActiveTracksByType(type: string): number[];
    getTracksByType(type: string): {
        id: number;
        locale: string;
        active: boolean;
    }[];
}
