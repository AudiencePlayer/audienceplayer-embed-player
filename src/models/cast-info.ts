export interface ChromecastConnectionInfo {
    available: boolean;
    connected: boolean;
    friendlyName?: string;
}

export interface ChromecastPlayInfo {
    articleId: number;
    assetId: number;
    hasMedia: boolean;
}
