import { PlayConfig } from '../models/play-config';
import { InitParams } from '../models/play-params';
export declare class VideoPlayer {
    private videojsInstance;
    private player;
    private playerLoggerService;
    private articlePlayConfig;
    private firstPlayingEvent;
    private currentTextTrack;
    private currentAudioTrack;
    private metadataLoaded;
    private currentTime;
    private castSender;
    private chromecastTech;
    constructor(videojsInstance: any, baseUrl: string, projectId: number);
    init(initParams: InitParams): void;
    play(playConfig: PlayConfig, initParams: InitParams): void;
    setPoster(posterUrl: string): void;
    destroy(): void;
    getPlayer(): any;
    private bindEvents;
    private checkSelectedTracks;
    private setDefaultTextTrack;
    private setDefaultAudioTrack;
}
