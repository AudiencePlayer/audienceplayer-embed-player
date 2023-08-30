export interface ArticlePlayConfig {
    pulseToken?: string;
    currentTime?: number;
    entitlements: ArticlePlayEntitlement[];
    subtitles: ArticlePlayConfigOption[];
    subtitleLocale: string;
    audioLocale: string;
    localTimeDelta?: number;
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
    noPlayableAsset = 'noPlayableAsset',
    notAuthenticated = 'notAuthenticated',
    needEntitlement = 'needEntitlement',
    paymentNotAuthorizedInApp = 'paymentNotAuthorizedInApp',
    notAuthorized = 'notAuthorized',
    serverError = 'serverError',
    offlineError = 'offlineError',
    playerError = 'playerError',
    inAppBrowserError = 'inAppBrowserError',
    maxConcurrentStreamNumberError = 'maxConcurrentStreamNumberError',
}
