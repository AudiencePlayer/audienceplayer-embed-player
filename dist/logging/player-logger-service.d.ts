import { PlayerDeviceTypes, PlayerEventTypes, PlayerProperties, PlaySession } from '../models/player';
export declare class PlayerLoggerService {
    private playerLogProcessor;
    protected playerProperties: PlayerProperties;
    protected playSession: PlaySession;
    protected intervalHandle: number;
    constructor(baseUrl: string, projectId: number);
    init(): void;
    destroy(): void;
    onStart(pulseToken: string, deviceType: PlayerDeviceTypes, encryption_type: string, protocol: string, localTimeDelta: number, isLive: boolean, onStopCallback?: (appr: number) => void): void;
    onCurrentTimeUpdated(currentTime: number): void;
    onDurationUpdated(duration: number): void;
    onPlaying(): void;
    onPause(): void;
    onError(error: string): void;
    onStop(): void;
    onTextTrackChanged(textTrack: string): void;
    onAudioTrackChanged(audioTrack: string): void;
    updateProperties(playerProperties: Partial<PlayerProperties>): void;
    updatePlaySource(protocol: string, encryptionType: string): void;
    protected startInterval(): void;
    protected stopInterval(): void;
    protected processPlaySession(): void;
    protected logEvent(eventType: PlayerEventTypes): void;
    protected reset(): void;
    protected getTimeStamp(): number;
}
