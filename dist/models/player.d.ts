export interface PlaySession {
    eventStack: PlayerEventState[];
    localTimeDelta: number;
    pulseToken: string;
    deviceType: PlayerDeviceTypes;
    isLive: boolean;
    onStopCallback?: (appr: number) => void;
}
export declare enum PlayingState {
    loading = 0,
    playing = 1,
    paused = 2,
    idle = 3,
    buffering = 4,
    error = 5,
}
export interface PlayerProperties {
    state: PlayingState;
    error: string | null;
    mediaDuration: number;
    playPosition: number;
    audioTrack: string;
    textTrack: string;
}
export interface PlayerEventState extends PlayerProperties {
    eventType: PlayerEventTypes;
    timeStamp: number;
}
export declare class PlayerLogPayload {
    pulse_token: string;
    event_stack: PlayerEventPayload[];
    device_type: PlayerDeviceTypes;
    pulse_mode: PulseMode;
}
export interface PlayerEventPayload {
    timestamp: number;
    event_type: PlayerEventTypePayloads;
    appa?: number;
    appr?: number;
    time_delta?: number;
    subtitle_locale?: string;
    audio_locale?: string;
    event_payload?: string;
}
export declare enum PlayerEventTypes {
    playStart = 'playStart',
    playing = 'playing',
    pause = 'pause',
    error = 'error',
    stopped = 'stopped',
    timeupdate = 'timeupdate',
    textTrackChanged = 'textTrackChanged',
    audioTrackChanged = 'audioTrackChanged',
}
export declare enum PlayerDeviceTypes {
    chromecast = 'chromecast',
    default = '',
}
export declare enum PlayerEventTypePayloads {
    play = 'play',
    playing = 'playing',
    paused = 'paused',
    stop = 'stop',
    error = 'error',
    configure = 'configure',
}
export declare enum PulseMode {
    live = 'live',
    archive = 'archive',
    offline = 'offline',
}
