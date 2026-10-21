export interface ChromecastConnectionInfo {
    available: boolean;
    connected: boolean;
    friendlyName?: string;
}

export interface ChromecastPlayInfo {
    articleId: number;
    assetId: number;
    // Legacy: only set when an older sender put the token in media.customData and an older receiver did not strip it.
    token?: string;
}

export interface TrackInfo {
    id: number;
    locale: string;
    active: boolean;
}
