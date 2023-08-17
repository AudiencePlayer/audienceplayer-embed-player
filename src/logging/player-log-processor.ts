import {
    PlayerEventPayload,
    PlayerEventState,
    PlayerEventTypePayloads,
    PlayerEventTypes,
    PlayerLogPayload,
    PlayingState,
    PlaySession,
    PulseMode,
} from '../models/player';

const MAX_EVENTS = 30;

export class PlayerLogProcessor {
    protected apiUrl: string;
    protected playLogs: PlayerLogPayload[] = [];
    protected apiCallInProgress = false;

    init(baseUrl: string, projectId: number) {
        this.apiUrl = `${baseUrl}/service/${projectId}/analytics/stream/pulse/log`.replace(/\/*$/, '');
        setInterval(() => {
            this.processFirstPlayLog();
        }, 3000);
    }

    processPlaySession(playSession: PlaySession, timeStamp: number) {
        if (!playSession) {
            return;
        }

        const eventStack = playSession.eventStack;

        if (eventStack.length === 0) {
            return;
        }

        const eventStackPayload: PlayerEventPayload[] = [];
        let i = 0,
            sumDelta = 0,
            lastEventWasProcessed = false;

        while (i < eventStack.length) {
            const currentEvent = eventStack[i];

            if (this.isEventTypeWithoutTimeDelta(currentEvent.eventType)) {
                // directly process these events. they have no sumDelta and do not affect the play state
                eventStackPayload.push(this.convertEventToEventPayload(currentEvent));
                lastEventWasProcessed = true;
            } else {
                lastEventWasProcessed = false;
                if (i - 1 >= 0) {
                    const previousEvent = eventStack[i - 1];

                    sumDelta += currentEvent.timeStamp - previousEvent.timeStamp;

                    if (currentEvent.state !== previousEvent.state) {
                        eventStackPayload.push(this.createDeltaEventPayload(previousEvent, previousEvent.timeStamp, sumDelta));
                        sumDelta = 0;
                    }
                }
            }
            i++;
        }

        const lastEvent = eventStack[eventStack.length - 1];

        if (sumDelta > 0 || !lastEventWasProcessed) {
            eventStackPayload.push(this.createDeltaEventPayload(lastEvent, timeStamp, sumDelta));
        }

        if (eventStackPayload.length > 0) {
            if (eventStackPayload.length > MAX_EVENTS) {
                // if event stack too big, add error with runaway info and slice nr of items
                const lastLogEvent = eventStackPayload[eventStackPayload.length - 1];
                eventStackPayload.splice(MAX_EVENTS - 1);
                lastLogEvent.event_type = PlayerEventTypePayloads.error;
                lastLogEvent.event_payload = '{code: 429, message: "Too many events"}'; // runaway
                eventStackPayload.push(lastLogEvent);
            }

            // check if there is already a log for this session
            let playLogPayload = this.getPlayerLogPayloadWithPulseToken(playSession.pulseToken);
            if (!playLogPayload) {
                playLogPayload = {
                    event_stack: [],
                    pulse_token: playSession.pulseToken,
                    pulse_mode: playSession.isLive ? PulseMode.live : PulseMode.offline,
                    device_type: playSession.deviceType,
                };
                this.playLogs.push(playLogPayload);
            }
            // keep the event_stack pointer in tact by using push
            eventStackPayload.forEach(e => playLogPayload.event_stack.push(e));

            this.processPlayLog(playLogPayload, playSession);
        }
    }

    processFirstPlayLog() {
        if (this.playLogs.length > 0) {
            this.processPlayLog(this.playLogs[0], null);
        }
    }

    protected processPlayLog(currentLog: PlayerLogPayload, playSession: PlaySession) {
        if (!currentLog || this.apiCallInProgress) {
            return;
        }

        if (currentLog.event_stack.length === 0) {
            this.removePlayLog(currentLog);
            return;
        }

        const logToSend: PlayerLogPayload = {
            ...currentLog,
            event_stack: [],
        };

        let eventStackIndex = 0,
            isStopCutOff = false;

        while (eventStackIndex < currentLog.event_stack.length && logToSend.event_stack.length < MAX_EVENTS && !isStopCutOff) {
            const currentEvent = currentLog.event_stack[eventStackIndex];
            eventStackIndex++;
            logToSend.event_stack.push(currentEvent);

            if (currentEvent.event_type === PlayerEventTypePayloads.stop) {
                isStopCutOff = true;
            }
        }

        // for offline logging, always accumulate until MAX_EVENTS before sending unless it's a stop cut off.
        if (logToSend.pulse_mode === PulseMode.offline && logToSend.event_stack.length < MAX_EVENTS && !isStopCutOff) {
            return;
        }

        // transaction start
        this.apiCallInProgress = true;

        return fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(logToSend),
        })
            .then(() => {
                return true;
            })
            .catch(error => {
                return error.status !== 0;
            })
            .then(response => {
                if (response) {
                    currentLog.event_stack.splice(0, eventStackIndex);
                    if (currentLog.event_stack.length === 0) {
                        this.removePlayLog(currentLog);
                    }
                } else {
                    currentLog.pulse_mode = PulseMode.archive;
                }
                this.apiCallInProgress = false;
            });
    }

    protected getPlayerLogPayloadWithPulseToken(pulseToken: string): PlayerLogPayload {
        return this.playLogs.find(log => log.pulse_token === pulseToken);
    }

    protected removePlayLog(logPayload: PlayerLogPayload) {
        const index = this.playLogs.findIndex(log => log.pulse_token === logPayload.pulse_token);
        if (index >= 0) {
            this.playLogs.splice(index, 1);
        }
    }

    protected isEventTypeWithoutTimeDelta(eventType: PlayerEventTypes) {
        return [PlayerEventTypes.textTrackChanged, PlayerEventTypes.audioTrackChanged, PlayerEventTypes.playStart].indexOf(eventType) >= 0;
    }

    protected createBaseEventPayload(playerEvent: PlayerEventState, eventType: PlayerEventTypePayloads): PlayerEventPayload {
        return {
            timestamp: playerEvent.timeStamp,
            event_type: eventType,
            appa: playerEvent.playPosition,
            appr: Math.min(playerEvent.playPosition / playerEvent.mediaDuration, 1),
        };
    }

    protected convertEventToEventPayload(playerEvent: PlayerEventState): PlayerEventPayload {
        if (playerEvent.eventType === PlayerEventTypes.playStart) {
            return {
                timestamp: playerEvent.timeStamp,
                event_type: PlayerEventTypePayloads.play,
            };
        }
        const eventType = this.convertEventTypeToEventTypePayload(playerEvent);
        const baseEvent = this.createBaseEventPayload(playerEvent, eventType);
        switch (playerEvent.eventType) {
            case PlayerEventTypes.audioTrackChanged:
                return {
                    ...baseEvent,
                    audio_locale: playerEvent.audioTrack,
                };
            case PlayerEventTypes.textTrackChanged:
                return {
                    ...baseEvent,
                    subtitle_locale: playerEvent.textTrack,
                };
            default:
                return baseEvent;
        }
    }

    protected createDeltaEventPayload(playerEvent: PlayerEventState, timestamp: number, timeDelta: number): PlayerEventPayload {
        const eventType = this.getEventTypePayloadFromEventState(playerEvent);
        const baseEvent = this.createBaseEventPayload(playerEvent, eventType);
        const errorPart = playerEvent.state === PlayingState.error ? {event_payload: playerEvent.error} : {};

        return {
            ...baseEvent,
            ...errorPart,
            timestamp,
            time_delta: timeDelta / 1000,
        };
    }

    protected getEventTypePayloadFromEventState(playerEvent: PlayerEventState): PlayerEventTypePayloads {
        switch (playerEvent.state) {
            case PlayingState.playing:
                return PlayerEventTypePayloads.playing;
            case PlayingState.paused:
                return PlayerEventTypePayloads.paused;
            case PlayingState.error:
                return PlayerEventTypePayloads.error;
            case PlayingState.buffering:
            case PlayingState.loading:
                return PlayerEventTypePayloads.paused; // buffering and loading converted to paused for API
            case PlayingState.idle:
                return PlayerEventTypePayloads.stop;
        }
    }

    protected convertEventTypeToEventTypePayload(playerEvent: PlayerEventState): PlayerEventTypePayloads {
        switch (playerEvent.eventType) {
            case PlayerEventTypes.playStart:
                return PlayerEventTypePayloads.play;
            case PlayerEventTypes.audioTrackChanged:
            case PlayerEventTypes.textTrackChanged:
                return PlayerEventTypePayloads.configure;

            // because e.g. `timeupdate` events can happen while paused / playing, base the rest on state.
            default: {
                this.getEventTypePayloadFromEventState(playerEvent);
            }
        }
    }
}
