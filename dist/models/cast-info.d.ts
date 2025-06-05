export interface ChromecastConnectionInfo {
    available: boolean;
    connected: boolean;
    friendlyName?: string;
}
export interface ChromecastPlayInfo {
    articleId: number;
    assetId: number;
    token: string;
}
export interface TrackInfo {
    id: number;
    locale: string;
    active: boolean;
}
