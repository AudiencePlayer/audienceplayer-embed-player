import { PlayConfig } from '../models/play-config';
import { InitParams, PlayParams } from '../models/play-params';
export declare class VideoPlayer {
    private videojsInstance;
    private player;
    private apiService;
    private castSender;
    private playerLoggerService;
    private articlePlayConfig;
    private firstPlayingEvent;
    private currentTextTrack;
    private currentAudioTrack;
    private metadataLoaded;
    private currentTime;
    private initParams;
    constructor(videojsInstance: any, baseUrl: string, projectId: number);
    middleware: (player: any) => {
        setSource: (srcObj: any, next: any) => void;
    };
    init(initParams: InitParams): void;
    playByParams(playParams: PlayParams): Promise<number>;
    play(playConfig: PlayConfig): void;
    setPoster(posterUrl: string): void;
    destroy(): void;
    getPlayer(): any;
    private reset;
    private bindEvents;
    private checkSelectedTracks;
    private setDefaultTextTrack;
    private setDefaultAudioTrack;
}
