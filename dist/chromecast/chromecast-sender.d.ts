/// <reference types="chrome/chrome-cast" />
/// <reference types="chromecast-caf-sender" />
import { PlayConfig } from '../models/play-config';
import { Article } from '../models/article';
import { PlayParams } from '../models/play-params';
import { ChromecastConnectionInfo, ChromecastPlayInfo, TrackInfo } from '../models/cast-info';
export declare class ChromecastSender {
    private chromecastReceiverAppId;
    private static initPromise;
    private castContext;
    private castPlayer;
    private castPlayerController;
    private lastConnectionInfo;
    private lastPlayStateInfo;
    private updateInterval;
    private supportsHDR;
    private onConnectedListeners;
    private onPlayStateListeners;
    private onCurrentTimeListeners;
    private onMediaTracksListeners;
    private onDurationListeners;
    private onApiErrorListeners;
    constructor(chromecastReceiverAppId: string);
    init(): Promise<void>;
    initializeCastApi(chromecastReceiverAppId: string): void;
    addOnConnectedListener(callback: (info: ChromecastConnectionInfo) => void): void;
    removeOnConnectedListener(callback: (info: ChromecastConnectionInfo) => void): void;
    addOnPlayStateListener(callback: (state: chrome.cast.media.PlayerState, info: ChromecastPlayInfo) => void): void;
    removeOnPlayStateListener(callback: (state: chrome.cast.media.PlayerState, info: ChromecastPlayInfo) => void): void;
    addOnCurrentTimeListener(callback: (currentTime: number) => void): void;
    removeOnCurrentTimeListener(callback: (currentTime: number) => void): void;
    addOnMediaTracksListener(callback: (audioTracks: TrackInfo[], textTracks: TrackInfo[]) => void): void;
    removeOnMediaTracksListener(callback: (audioTracks: TrackInfo[], textTracks: TrackInfo[]) => void): void;
    addOnDurationListener(callback: (duration: number) => void): void;
    removeOnDurationListener(callback: (duration: number) => void): void;
    addOnApiErrorListener(callback: (error: {
        code: number;
        message: string;
    }, playParams: PlayParams) => void): void;
    removeOnApiErrorListener(callback: (error: {
        code: number;
        message: string;
    }, playParams: PlayParams) => void): void;
    getSupportsHDR(): boolean;
    getCastMediaInfo(articlePlayConfig: PlayConfig, article: Article): chrome.cast.media.MediaInfo;
    getCastMediaInfoByParams(playParams: PlayParams): chrome.cast.media.MediaInfo;
    getCastSession(): cast.framework.CastSession;
    getCastMediaSession(): chrome.cast.media.Media;
    castVideo(playConfig: PlayConfig, article: Article, continueFromPreviousPosition: boolean): Promise<chrome.cast.ErrorCode>;
    castVideoByParams(playParams: PlayParams): Promise<void>;
    isConnected(): boolean;
    stopMedia(): Promise<void>;
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
    setActiveTracks(trackIds: number[], type: string): void;
    setActiveTrackById(selectedTrackId: number, type: string): void;
    private dispatchConnectionInfo;
    private dispatchPlayState;
}
