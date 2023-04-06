import PlayerLogProcessor from './player-log-processor.js'

export default class PlayerLoggerService {
    constructor() {
        this.intervalHandle = null;
        this.logProcessor = new PlayerLogProcessor();
        this.logProcessor.init();
    }


    setApiUrl(apiUrl) {
        this.logProcessor.setApiUrl(apiUrl);
    }

    onStart(pulseToken, deviceType, localTimeDelta) {
        this.reset();

        this.playSession = {
            pulseToken,
            deviceType,
            eventStack: [],
            localTimeDelta
        };

        this.logEvent('playStart');

        this.processPlaySession();
        this.startInterval();
    }

    onCurrentTimeUpdated(currentTime) {
        this.playerProperties.playPosition = currentTime;

        if (this.playerProperties.mediaDuration > 0 && this.playerProperties.state !== 'idle') {
            this.logEvent('timeupdate');
        }
    }

    onDurationUpdated(duration) {
        this.playerProperties.mediaDuration = duration;
    }

    onPlaying() {
        if (this.playerProperties.state !== 'playing') {
            this.playerProperties.state = 'playing';
            this.logEvent('playing');
        }
    }

    onPause() {
        if (this.playerProperties.state !== 'paused') {
            this.playerProperties.state = 'paused';
            this.logEvent('pause');
        }
    }

    onError(error) {
        if (this.playerProperties.state !== 'error') {
            this.playerProperties.state = 'error';
            this.playerProperties.error = error;
            this.logEvent('error');
        }
    }

    onStop() {
        if (this.playerProperties.state !== 'idle') {
            this.playerProperties.state = 'idle';
            this.logEvent('stopped');
            this.stopInterval();
            this.processPlaySession();
        }
    }

    onTextTrackChanged(textTrack) {
        if (this.playerProperties.state === 'idle') {
            return;
        }
        this.playerProperties.textTrack = textTrack;
        this.logEvent('textTrackChanged');
    }

    onAudioTrackChanged(audioTrack) {
        if (this.playerProperties.state === 'idle') {
            return;
        }
        this.playerProperties.audioTrack = audioTrack;

        this.logEvent('audioTrackChanged');
    }

    updateProperties(playerProperties) {
        this.playerProperties = {
            ...this.playerProperties,
            ...playerProperties,
        };
    }

    startInterval() {
        this.stopInterval();
        this.intervalHandle = setInterval(() => {
            this.processPlaySession();
        }, 30000);
    }

    stopInterval() {
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
        }
    }

    processPlaySession() {
        this.logProcessor.processPlaySessionLog({...this.playSession}, this.getTimeStamp());
        this.playSession.eventStack = [];
    }

    logEvent(eventType) {
        if (this.playSession) {
            this.playSession.eventStack.push({
                ...this.playerProperties,
                eventType,
                timeStamp: this.getTimeStamp(),
            });
        }
    }

    reset() {
        this.playSession = null;

        this.playerProperties = {
            state: 'idle',
            error: null,
            mediaDuration: 0,
            playPosition: 0,
            audioTrack: null,
            textTrack: null,
        };
    }

    getTimeStamp() {
        return Date.now() - (this.playSession ? this.playSession.localTimeDelta : 0);
    }
}
