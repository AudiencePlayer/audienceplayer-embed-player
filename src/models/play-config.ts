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
    skipIntro?: {
        start: number;
        end: number;
        label: string;
    };
    continuePaused?: boolean;
}

export interface PlayEntitlement {
    src: string;
    type: MimeType;
    isLive: boolean;
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

export enum ArticlePlayErrors {
    noPlayableAsset = 'noPlayableAsset',
    notAuthenticated = 'notAuthenticated',
    needEntitlement = 'needEntitlement',
    serverError = 'serverError',
    offlineError = 'offlineError',
    maxConcurrentStreamNumberError = 'maxConcurrentStreamNumberError',
}

export type DrmType = 'Widevine' | 'PlayReady' | 'FairPlay';
export type MimeType = 'application/x-mpegURL' | 'application/dash+xml' | 'video/mp4';
export const MimeTypeHls = 'application/x-mpegURL';
export const MimeTypeDash = 'application/dash+xml';
export const MimeTypeMp4 = 'video/mp4';
