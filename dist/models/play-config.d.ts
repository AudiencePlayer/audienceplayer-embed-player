export interface ArticlePlayConfig {
    pulseToken?: string;
    currentTime?: number;
    entitlements: ArticlePlayEntitlement[];
    subtitles: ArticlePlayConfigSubtitle[];
    subtitleLocale: string;
    audioLocale: string;
    aspectRatio: string;
    localTimeDelta?: number;
}
export interface ArticlePlayEntitlement {
    src: string;
    type: string;
    protectionInfo: ArticlePlayConfigProtection[] | null;
}
export interface ArticlePlayConfigSubtitle {
    src: string;
    srclang: string;
    kind: string;
    label: string;
}
export interface ArticlePlayConfigProtection {
    type: string;
    authenticationToken: string;
    certificateUrl?: string;
    keyDeliveryUrl: string;
}
export declare enum ArticlePlayErrors {
    noPlayableAsset = 'noPlayableAsset',
    notAuthenticated = 'notAuthenticated',
    needEntitlement = 'needEntitlement',
    serverError = 'serverError',
    offlineError = 'offlineError',
    maxConcurrentStreamNumberError = 'maxConcurrentStreamNumberError',
}
