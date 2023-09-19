import { PlayerEventPayload, PlayerEventState, PlayerEventTypePayloads, PlayerEventTypes, PlayerLogPayload, PlaySession } from '../models/player';
export declare class PlayerLogProcessor {
    protected apiUrl: string;
    protected playLogs: PlayerLogPayload[];
    protected apiCallInProgress: boolean;
    protected intervalHandle: any;
    constructor(baseUrl: string, projectId: number);
    init(): void;
    destroy(): void;
    processPlaySession(playSession: PlaySession, timeStamp: number): void;
    processFirstPlayLog(): void;
    protected processPlayLog(currentLog: PlayerLogPayload, playSession: PlaySession): Promise<void>;
    protected getPlayerLogPayloadWithPulseToken(pulseToken: string): PlayerLogPayload;
    protected removePlayLog(logPayload: PlayerLogPayload): void;
    protected isEventTypeWithoutTimeDelta(eventType: PlayerEventTypes): boolean;
    protected createBaseEventPayload(playerEvent: PlayerEventState, eventType: PlayerEventTypePayloads): PlayerEventPayload;
    protected convertEventToEventPayload(playerEvent: PlayerEventState): PlayerEventPayload;
    protected createDeltaEventPayload(playerEvent: PlayerEventState, timestamp: number, timeDelta: number): PlayerEventPayload;
    protected getEventTypePayloadFromEventState(playerEvent: PlayerEventState): PlayerEventTypePayloads;
    protected convertEventTypeToEventTypePayload(playerEvent: PlayerEventState): PlayerEventTypePayloads;
}
