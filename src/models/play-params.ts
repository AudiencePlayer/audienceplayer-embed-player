export interface PlayParams {
    articleId: number;
    assetId: number;
    token: string;
    autoplay: boolean;
    fullScreen: boolean;
    continueFromPreviousPosition: boolean;
}

export interface PlayParamsChromecast {
    articleId: number;
    assetId: number;
    token: string;
    continueFromPreviousPosition: boolean;
}
