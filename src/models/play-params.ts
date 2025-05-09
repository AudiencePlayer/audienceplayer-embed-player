import {PlayerOptions} from './player-options';

export interface InitParams {
    selector: string | HTMLElement;
    options: PlayerOptions;
    fullscreen?: boolean;
    chromecastButton?: boolean;
    defaultSkinClass?: string;
    skipButtons?: {forward: number; backward: number} | false;
    chromecastReceiverAppId?: string;
}

export interface PlayParams {
    articleId: number;
    assetId: number;
    token: string;
    continueFromPreviousPosition: boolean;
}

export enum DeviceModelContextEnum {
    chromecast_legacy = 'chromecast_legacy',
    chromecast_4k = 'chromecast_4k',
    lg_legacy = 'lg_legacy',
    lg_webos = 'lg_webos',
    samsung_tizen = 'samsung_tizen',
    tpvision_tva = 'tpvision_tva',
}
