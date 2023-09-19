/// <reference types="chromecast-caf-sender" />
interface TrackInfo {
    id: number;
    locale: string;
    active: boolean;
}
export declare class ChromecastControls {
    private currentStatus;
    private playerController;
    private player;
    private rootElement;
    private controlInitialized;
    private totalDuration;
    private currentTime;
    constructor(player: cast.framework.RemotePlayer, controller: cast.framework.RemotePlayerController, selector?: string);
    bindEvents(): void;
    createChromecastControlsTemplate(selector?: string): void;
    onConnectedListener(callback: (info: {connected: boolean; friendlyName: string}) => void): void;
    setPlayButtonClass(): void;
    bindEventsToControls(): void;
    renderTracksButton(): void;
    renderTracks(): void;
    removeTracks(): void;
    toggleTracksDialogue(): void;
    getTracksList(tracks: TrackInfo[], type: string): HTMLUListElement;
    getActiveTracksByType(type: string): number[];
    getTracksByType(
        type: string
    ): {
        id: number;
        locale: string;
        active: boolean;
    }[];
    setTitle(): void;
    getTransformedDurationValue(value: number): string;
    setProgressBarValues(): void;
    checkChromecastContainerVisibility(): void;
    playPause(): void;
    seek(newTime: number): void;
    stop(): void;
    setActiveTrack(event: MouseEvent, type: string): void;
    setActiveTracks(trackIds: number[]): void;
    getElement(selector: string): HTMLElement;
}
export {};
