export interface PlaySession {
    eventStack: PlayerEventState[];
    localTimeDelta: number;
    pulseToken: string;
    deviceType: PlayerDeviceTypes;
    isLive: boolean;
    onStopCallback?: (appr: number) => void;
}
export declare enum PlayingState {
    loading = 0,// chromecast only
    playing = 1,
    paused = 2,
    idle = 3,
    buffering = 4,// chromecast only
    error = 5
}
export interface PlayerProperties {
    state: PlayingState;
    error: string | null;
    mediaDuration: number;
    playPosition: number;
    audioTrack: string;
    textTrack: string;
    resolution: string;
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
    resolution_tag?: string;
}
export declare enum PlayerEventTypes {
    playStart = "playStart",// before attempt to play with given play configuration
    playing = "playing",// play state is playing
    pause = "pause",// play state is paused
    error = "error",// an error occured
    stopped = "stopped",// player was manually closed, or video was ended
    timeupdate = "timeupdate",// play position of video updated
    textTrackChanged = "textTrackChanged",
    audioTrackChanged = "audioTrackChanged"
}
export declare enum PlayerDeviceTypes {
    chromecast = "chromecast",
    default = ""
}
export declare enum PlayerEventTypePayloads {
    play = "play",
    playing = "playing",
    paused = "paused",
    stop = "stop",
    error = "error",
    configure = "configure"
}
export declare enum PulseMode {
    live = "live",
    archive = "archive",
    offline = "offline"
}
