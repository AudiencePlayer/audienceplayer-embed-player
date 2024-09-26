import {PlayerLogProcessor} from './player-log-processor';
import {PlayerDeviceTypes, PlayerEventTypes, PlayerProperties, PlayingState, PlaySession} from '../models/player';

export class PlayerLoggerService {
    private playerLogProcessor: PlayerLogProcessor;
    protected playerProperties: PlayerProperties;
    protected playSession: PlaySession;
    protected intervalHandle = 0;

    constructor(baseUrl: string, projectId: number) {
        this.playerLogProcessor = new PlayerLogProcessor(baseUrl, projectId);
        this.reset();
    }

    init() {
        this.playerLogProcessor.init();
    }

    destroy() {
        this.playerLogProcessor.destroy();
    }

    onStart(
        pulseToken: string,
        deviceType: PlayerDeviceTypes,
        localTimeDelta: number,
        isLive: boolean,
        onStopCallback?: (appr: number) => void
    ) {
        this.reset();

        this.playSession = {
            pulseToken,
            deviceType,
            eventStack: [],
            localTimeDelta,
            isLive,
            onStopCallback,
        };
    }

    onCurrentTimeUpdated(currentTime: number) {
        this.playerProperties.playPosition = currentTime;

        if (this.playerProperties.mediaDuration > 0 && this.playerProperties.state !== PlayingState.idle) {
            this.logEvent(PlayerEventTypes.timeupdate);
        }
    }

    onDurationUpdated(duration: number) {
        this.playerProperties.mediaDuration = duration;
    }

    onPlaying() {
        if (this.playerProperties.state !== PlayingState.playing) {
            if (this.playerProperties.state === PlayingState.idle) {
                this.playerProperties.state = PlayingState.playing;
                this.logEvent(PlayerEventTypes.playStart);
                this.processPlaySession();
                this.startInterval();
            } else {
                this.playerProperties.state = PlayingState.playing;
                this.logEvent(PlayerEventTypes.playing);
            }
        }
    }

    onPause() {
        if (this.playerProperties.state !== PlayingState.paused && this.playerProperties.state !== PlayingState.idle) {
            this.playerProperties.state = PlayingState.paused;
            this.logEvent(PlayerEventTypes.pause);
        }
    }

    onError(error: string) {
        if (this.playerProperties.state !== PlayingState.error) {
            this.playerProperties.state = PlayingState.error;
            this.playerProperties.error = error;
            this.logEvent(PlayerEventTypes.error);
        }
    }

    onStop() {
        if (this.playerProperties.state !== PlayingState.idle) {
            this.playerProperties.state = PlayingState.idle;
            this.logEvent(PlayerEventTypes.stopped);
            this.stopInterval();
            this.processPlaySession();
        }
    }

    onTextTrackChanged(textTrack: string) {
        if (this.playerProperties.state === PlayingState.idle) {
            return;
        }
        this.playerProperties.textTrack = textTrack;
        this.logEvent(PlayerEventTypes.textTrackChanged);
    }

    onAudioTrackChanged(audioTrack: string) {
        if (this.playerProperties.state === PlayingState.idle) {
            return;
        }
        this.playerProperties.audioTrack = audioTrack;

        this.logEvent(PlayerEventTypes.audioTrackChanged);
    }

    updateProperties(playerProperties: Partial<PlayerProperties>) {
        this.playerProperties = {
            ...this.playerProperties,
            ...playerProperties,
        };
    }

    protected startInterval() {
        this.stopInterval();
        // @ts-ignore
        this.intervalHandle = setInterval(() => {
            this.processPlaySession();
        }, 30000);
    }

    protected stopInterval() {
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
        }
    }

    protected processPlaySession() {
        this.playerLogProcessor.processPlaySession({...this.playSession}, this.getTimeStamp());
        this.playSession.eventStack = [];
    }

    protected logEvent(eventType: PlayerEventTypes) {
        if (this.playSession) {
            this.playSession.eventStack.push({
                ...this.playerProperties,
                eventType,
                timeStamp: this.getTimeStamp(),
            });
        }
    }

    protected reset() {
        this.playSession = null;

        this.playerProperties = {
            state: PlayingState.idle,
            error: null,
            mediaDuration: 0,
            playPosition: 0,
            audioTrack: null,
            textTrack: null,
            resolution: null,
        };
    }

    protected getTimeStamp() {
        return Date.now() - (this.playSession ? this.playSession.localTimeDelta : 0);
    }
}
