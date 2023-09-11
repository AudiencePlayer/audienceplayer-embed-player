import {PlayerOptions} from './player-options';

export interface InitParams {
    selector: string | HTMLElement;
    options: PlayerOptions;
}

export interface PlayParams extends InitParams {
    articleId: number;
    assetId: number;
    token: string;
    fullscreen?: boolean;
    continueFromPreviousPosition: boolean;
}

export interface PlayParamsChromecast {
    articleId: number;
    assetId: number;
    token: string;
    continueFromPreviousPosition: boolean;
}
