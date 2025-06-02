import { TrackInfo } from '../models/cast-info';
import { ChromecastSender } from "./chromecast-sender";
export declare class ChromecastControls {
    private castSender;
    private currentStatus;
    private playerController;
    private player;
    private rootElement;
    private totalDuration;
    private currentTime;
    constructor(castSender: ChromecastSender, selector?: string | HTMLElement);
    bindEvents(): void;
    createChromecastControlsTemplate(selector?: string | HTMLElement): void;
    setPlayButtonClass(): void;
    bindEventsToControls(): void;
    bindEventsToMenu(buttonSelector: string): void;
    renderTracks(): void;
    getTracksList(tracks: TrackInfo[], type: string): HTMLUListElement;
    getTransformedDurationValue(value: number): string;
    setProgressBarValues(): void;
    checkChromecastContainerVisibility(): void;
    playPause(): void;
    seek(newTime: number): void;
    stop(): void;
    setActiveTrack(event: MouseEvent, type: string): void;
    toggleMenu(menuEl: HTMLElement, containerEl: HTMLElement): void;
    getElement(selector: string): HTMLElement;
}
