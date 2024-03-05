export interface PlayConfig {
    pulseToken: string;
    currentTime?: number;
    entitlements: PlayEntitlement[];
    subtitles: PlayConfigSubtitle[];
    articleId?: number;
    assetId: number;
    subtitleLocale: string;
    audioLocale: string;
    aspectRatio: string;
    localTimeDelta?: number;
}
export interface PlayEntitlement {
    src: string;
    type: string;
    protectionInfo: PlayConfigProtection[] | null;
}
export interface PlayConfigSubtitle {
    src: string;
    srclang: string;
    kind: string;
    label: string;
}
export interface PlayConfigProtection {
    type: string;
    authenticationToken: string;
    certificateUrl?: string;
    keyDeliveryUrl: string;
    encryptionProvider: string;
}
export declare enum ArticlePlayErrors {
    noPlayableAsset = "noPlayableAsset",
    notAuthenticated = "notAuthenticated",
    needEntitlement = "needEntitlement",
    serverError = "serverError",
    offlineError = "offlineError",
    maxConcurrentStreamNumberError = "maxConcurrentStreamNumberError"
}
