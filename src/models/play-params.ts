export interface PlayParams {
    selector: string | HTMLElement;
    apiBaseUrl: string;
    projectId: number;
    articleId: number;
    assetId: number;
    token: string;
    posterImageUrl: string;
    autoplay: boolean;
    fullScreen: boolean;
    continueFromPreviousPosition: boolean;
}

export interface PlayParamsChromecast {
    selector: string | HTMLElement;
    apiBaseUrl: string;
    projectId: number;
    articleId: number;
    assetId: number;
    token: string;
    continueFromPreviousPosition: boolean;
}
