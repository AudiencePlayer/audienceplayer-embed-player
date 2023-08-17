export interface PlaySession {
    eventStack: PlayerEventState[];
    localTimeDelta: number;
    pulseToken: string;
    deviceType: PlayerDeviceTypes;
    isLive: boolean;
    onStopCallback?: (appr: number) => void;
}

export enum PlayingState {
    loading, // chromecast only
    playing,
    paused,
    idle,
    buffering, // chromecast only
    error,
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

export class PlayerLogPayload {
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

// generic abstraction of player events that are taken from Azure media player, Chromecast and mobile implementations
export enum PlayerEventTypes {
    playStart = 'playStart', // before attempt to play with given play configuration
    playing = 'playing', // play state is playing
    pause = 'pause', // play state is paused
    error = 'error', // an error occured
    stopped = 'stopped', // player was manually closed, or video was ended
    timeupdate = 'timeupdate', // play position of video updated
    buffering = 'buffering',
    durationChanged = 'durationChanged',
    textTrackChanged = 'textTrackChanged',
    audioTrackChanged = 'audioTrackChanged',
}

export enum PlayerDeviceTypes {
    chromecast = 'chromecast',
    airplay = 'airplay',
    mob_android = 'mob_android',
    mob_ios = 'mob_ios',
    default = '', // API should figure it out based on Navigator agent
}

export enum PlayerEventTypePayloads {
    play = 'play',
    playing = 'playing',
    paused = 'paused',
    stop = 'stop',
    error = 'error',
    configure = 'configure',
}

export enum PulseMode {
    live = 'live',
    archive = 'archive',
    offline = 'offline',
}
