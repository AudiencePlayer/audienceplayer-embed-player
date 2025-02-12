import {PlayerOptions} from './player-options';

export interface InitParams {
    selector: string | HTMLElement;
    options: PlayerOptions;
    fullscreen?: boolean;
    chromecastButton?: boolean;
    defaultSkinClass?: string;
    skipButtons?: {forward: number; backward: number} | false;
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
