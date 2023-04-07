const MAX_EVENTS = 30;

export default class PlayerLogProcessor {
    constructor() {
        this.playLogs = [];
        this.apiCallInProgress = false;
    }

    setApiUrl(url) {
        this.apiUrl = url;
    }

    init() {
        setInterval(() => {
            this.processFirstPlayLog();
        }, 3000);
    }

    processPlaySessionLog(playSession, timeStamp) {
        if (!playSession) {
            return;
        }

        const eventStack = playSession.eventStack;

        if (eventStack.length === 0) {
            return;
        }

        const eventStackPayload = [];
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
                lastLogEvent.event_type = 'error';
                lastLogEvent.event_payload = '{code: 429, message: "Too many events"}'; // runaway
                eventStackPayload.push(lastLogEvent);
            }

            // check if there is already a log for this session
            let playLogPayload = this.getPlayerLogPayloadWithPulseToken(playSession.pulseToken);
            if (!playLogPayload) {
                playLogPayload = {
                    event_stack: [],
                    pulse_token: playSession.pulseToken,
                    pulse_mode: 'live',
                    device_type: playSession.deviceType,
                };
                this.playLogs.push(playLogPayload);
            }
            // keep the event_stack pointer in tact by using push
            eventStackPayload.forEach(e => playLogPayload.event_stack.push(e));
            this.processPlayLog(playLogPayload);
        }
    }

    processFirstPlayLog() {
        if (this.playLogs.length > 0) {
            this.processPlayLog(this.playLogs[0]);
        }
    }



    processPlayLog(currentLog) {
        if (!!this.apiUrl) {
            if (!currentLog || this.apiCallInProgress) {
                return;
            }

            if (currentLog.event_stack.length === 0) {
                this.removePlayLog(currentLog);
                return;
            }

            const logToSend = {
                ...currentLog,
                event_stack: [],
            };

            let eventStackIndex = 0,
                isStopCutOff = false;

            while (
                eventStackIndex < currentLog.event_stack.length &&
                logToSend.event_stack.length < MAX_EVENTS &&
                !isStopCutOff
                ) {
                const currentEvent = currentLog.event_stack[eventStackIndex];
                eventStackIndex++;
                logToSend.event_stack.push(currentEvent);

                if (currentEvent.event_type === 'stop') {
                    isStopCutOff = true;
                }
            }

            // transaction start
            this.apiCallInProgress = true;

            return fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify(logToSend),
            })
                .then(() => {
                    return true
                })
                .catch((error) => {
                    return error.status !== 0
                })
                .then((response) => {
                    if(response) {
                        currentLog.event_stack.splice(0, eventStackIndex);
                        if (currentLog.event_stack.length === 0) {
                            this.removePlayLog(currentLog);
                        }
                    } else {
                        currentLog.pulse_mode = 'archive';
                    }
                this.apiCallInProgress = false;
            })
        }
    }

    getPlayerLogPayloadWithPulseToken(pulseToken) {
        return this.playLogs.find(log => log.pulse_token === pulseToken);
    }

    removePlayLog(logPayload) {
        const index = this.playLogs.findIndex(log => log.pulse_token === logPayload.pulse_token);
        if (index >= 0) {
            this.playLogs.splice(index, 1);
        }
    }

    isEventTypeWithoutTimeDelta(eventType) {
        return ['textTrackChanged', 'audioTrackChanged', 'playStart'].indexOf(eventType) >= 0;
    }

    createBaseEventPayload(playerEvent, eventType) {
        return {
            timestamp: playerEvent.timeStamp,
            event_type: eventType,
            appa: playerEvent.playPosition,
            appr: Math.min(playerEvent.playPosition / playerEvent.mediaDuration, 1),
        };
    }

    convertEventToEventPayload(playerEvent) {
        if (playerEvent.eventType === 'playStart') {
            return {
                timestamp: playerEvent.timeStamp,
                event_type: 'play',
            };
        }
        const eventType = this.convertEventTypeToEventTypePayload(playerEvent);
        const baseEvent = this.createBaseEventPayload(playerEvent, eventType);
        switch (playerEvent.eventType) {
            case 'audioTrackChanged':
                return {
                    ...baseEvent,
                    audio_locale: playerEvent.audioTrack,
                };
            case 'textTrackChanged':
                return {
                    ...baseEvent,
                    subtitle_locale: playerEvent.textTrack,
                };
            default:
                return baseEvent;
        }
    }

    createDeltaEventPayload(playerEvent, timestamp, timeDelta) {
        const eventType = this.getEventTypePayloadFromEventState(playerEvent);
        const baseEvent = this.createBaseEventPayload(playerEvent, eventType);
        const errorPart = playerEvent.state === 'error' ? {event_payload: playerEvent.error} : {};

        return {
            ...baseEvent,
            ...errorPart,
            timestamp,
            time_delta: timeDelta / 1000,
        };
    }

    getEventTypePayloadFromEventState(playerEvent) {
        switch (playerEvent.state) {
            case 'playing':
                return 'playing';
            case 'paused':
                return 'paused';
            case 'error':
                return 'error';
            case 'buffering':
            case 'loading':
                return 'paused'; // buffering and loading converted to paused for API
            case 'idle':
                return 'stop';
        }
    }

    convertEventTypeToEventTypePayload(playerEvent) {
        switch (playerEvent.eventType) {
            case 'playStart':
                return 'play';
            case 'audioTrackChanged':
            case 'textTrackChanged':
                return 'configure';

            // because e.g. `timeupdate` events can happen while paused / playing, base the rest on state.
            default: {
                this.getEventTypePayloadFromEventState(playerEvent);
            }
        }
    }
}
