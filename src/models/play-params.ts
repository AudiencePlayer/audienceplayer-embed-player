import {PlayerOptions} from './player-options';

export interface InitParams {
    selector: string | HTMLElement;
    options: PlayerOptions;
    fullscreen?: boolean;
    chromecastButton?: boolean;
    chromecastReceiverAppId?: string;
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
