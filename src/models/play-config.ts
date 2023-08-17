export interface ArticlePlayConfig {
    pulseToken?: string;
    currentTime?: number;
    entitlements: ArticlePlayEntitlement[];
    subtitles: ArticlePlayConfigOption[];
    subtitleLocale: string;
    audioLocale: string;
    localTimeDelta?: number;
}

export interface ArticlePlayConfigError {
    type: ArticlePlayErrors;
    code?: string;
    info?: string;
}

export interface ArticlePlayEntitlement {
    src: string;
    type: string;
    protectionInfo: ArticlePlayConfigProtection[] | null;
}

export interface ArticlePlayConfigOption {
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

export enum ArticlePlayErrors {
    noPlayableAsset,
    notAuthenticated,
    needSubscription,
    needEntitlement,
    needSubscriptionOrEntitlement,
    paymentNotAuthorizedInApp,
    notAuthorized,
    serverError,
    offlineError,
    playerError,
    inAppBrowserError,
    maxConcurrentStreamNumberError,
}
