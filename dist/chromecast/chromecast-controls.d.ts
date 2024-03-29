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
    private totalDuration;
    private currentTime;
    constructor(player: cast.framework.RemotePlayer, controller: cast.framework.RemotePlayerController, selector?: string | HTMLElement);
    bindEvents(): void;
    createChromecastControlsTemplate(selector?: string | HTMLElement): void;
    setPlayButtonClass(): void;
    bindEventsToControls(): void;
    bindEventsToMenu(buttonSelector: string): void;
    renderTracks(): void;
    getTracksList(tracks: TrackInfo[], type: string): HTMLUListElement;
    getActiveTracksByType(type: string): number[];
    getTracksByType(type: string): {
        id: number;
        locale: string;
        active: boolean;
    }[];
    getTransformedDurationValue(value: number): string;
    setProgressBarValues(): void;
    checkChromecastContainerVisibility(): void;
    playPause(): void;
    seek(newTime: number): void;
    stop(): void;
    setActiveTrack(event: MouseEvent, type: string): void;
    setActiveTracks(trackIds: number[], type: string): void;
    toggleMenu(menuEl: HTMLElement, containerEl: HTMLElement): void;
    getElement(selector: string): HTMLElement;
}
export {};
