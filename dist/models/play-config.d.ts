export interface PlayConfig {
    pulseToken: string;
    currentTime: number;
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
    type: MimeType;
    protectionInfo: PlayConfigProtection[] | null;
    mediaProvider: string;
}
export interface PlayConfigSubtitle {
    src: string;
    srclang: string;
    kind: string;
    label: string;
}
export interface PlayConfigProtection {
    type: DrmType;
    authenticationToken?: string;
    certificateUrl?: string;
    keyDeliveryUrl: string;
    encryptionProvider: string;
    contentKeyId?: string;
}
export declare enum ArticlePlayErrors {
    noPlayableAsset = "noPlayableAsset",
    notAuthenticated = "notAuthenticated",
    needEntitlement = "needEntitlement",
    serverError = "serverError",
    offlineError = "offlineError",
    maxConcurrentStreamNumberError = "maxConcurrentStreamNumberError"
}
export declare type DrmType = 'Widevine' | 'PlayReady' | 'FairPlay';
export declare type MimeType = 'application/x-mpegURL' | 'application/dash+xml' | 'video/mp4';
export declare const MimeTypeHls = "application/x-mpegURL";
export declare const MimTypeDash = "application/dash+xml";
