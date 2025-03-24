import { PlayerOptions } from './player-options';
import { PlayConfig } from './play-config';
export type DeviceModelContext = 'chromecast_legacy' | 'chromecast_4k' | null;
export interface InitParams {
    selector: string | HTMLElement;
    options: PlayerOptions;
    fullscreen?: boolean;
    chromecastButton?: boolean;
    chromecastReceiverAppId?: string;
    defaultSkinClass?: string;
    skipButtons?: {
        forward: number;
        backward: number;
    } | false;
    getSource: (deviceModelContext: DeviceModelContext) => Promise<PlayConfig>;
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
