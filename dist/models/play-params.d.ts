import { PlayerOptions } from './player-options';
export interface InitParams {
    selector: string | HTMLElement;
    options: PlayerOptions;
    fullscreen?: boolean;
}
export interface PlayParams extends InitParams {
    articleId: number;
    assetId: number;
    token: string;
    continueFromPreviousPosition: boolean;
}
export interface PlayParamsChromecast {
    articleId: number;
    assetId: number;
    token: string;
    continueFromPreviousPosition: boolean;
}
