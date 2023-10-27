import {PlayConfig, PlayEntitlement, ArticlePlayErrors} from '../models/play-config';
import {Article} from '../models/article';
import {FileData} from '../models/file-data';

export function toPlayConfig(config: any, continueFromPreviousPosition: boolean): PlayConfig {
    const timeStamp = Date.parse(config.issued_at);
    const entitlements: PlayEntitlement[] = [];

    // check if the entitlements contain FPS in order to know when to filter out aes
    const filterAES = !!config.entitlements.find((entitlement: any) => entitlement.encryption_type === 'fps');
    const configEntitlements = filterAES
        ? config.entitlements.filter((entitlement: any) => {
              return entitlement.encryption_type !== 'aes';
          })
        : config.entitlements;

    const dashWidevine = configEntitlements.find(
        (entitlement: any) => !!entitlement.token && entitlement.encryption_type === 'cenc' && entitlement.protocol.indexOf('dash') === 0
    );
    const mssPlayReady = configEntitlements.find(
        (entitlement: any) => !!entitlement.token && entitlement.encryption_type === 'cenc' && entitlement.protocol.indexOf('mss') === 0
    );

    configEntitlements.forEach((configEntitlement: any) => {
        const entitlement: PlayEntitlement = {
            src: configEntitlement.manifest,
            type: configEntitlement.mime_type,
            protectionInfo: null,
        };

        if (configEntitlement.token) {
            entitlement.protectionInfo = [];
            if (configEntitlement.encryption_type === 'cenc') {
                if (!!dashWidevine) {
                    entitlement.protectionInfo.push({
                        type: 'Widevine',
                        authenticationToken: 'Bearer ' + dashWidevine.token,
                        keyDeliveryUrl: dashWidevine.key_delivery_url,
                    });
                }

                if (!!mssPlayReady) {
                    entitlement.protectionInfo.push({
                        type: 'PlayReady',
                        authenticationToken: 'Bearer=' + mssPlayReady.token,
                        keyDeliveryUrl: mssPlayReady.key_delivery_url,
                    });
                }
            } else if (configEntitlement.encryption_type === 'fps') {
                entitlement.protectionInfo = [
                    {
                        type: 'FairPlay',
                        authenticationToken: 'Bearer ' + configEntitlement.token,
                        certificateUrl: config.fairplay_certificate_url,
                        keyDeliveryUrl: configEntitlement.key_delivery_url,
                    },
                ];
            }
        }
        entitlements.push(entitlement);
    });

    const subtitles = config.subtitles.map((item: any) => ({
        src: item.url,
        srclang: item.locale,
        kind: 'subtitles',
        label: item.locale_label,
    }));

    return {
        entitlements: entitlements,
        subtitles: subtitles,
        pulseToken: config.pulse_token,
        currentTime: continueFromPreviousPosition ? config.appa : 0,
        articleId: config.article_id,
        assetId: config.asset_id,
        subtitleLocale: config.user_subtitle_locale,
        audioLocale: config.user_audio_locale,
        localTimeDelta: isNaN(timeStamp) ? 0 : Date.now() - timeStamp,
        aspectRatio: config.aspect_ratio.replace('x', ':'),
    };
}

export function toArticleMetas(metas: any) {
    return metas.reduce(
        (metaObj: any, item: any) => ({
            ...metaObj,
            [item.key]: item.value,
        }),
        {}
    );
}

export function toArticle(article: any): Article {
    return {
        name: article.name,
        metas: toArticleMetas(article.metas),
        posters: article.posters.map(toFile),
        images: article.images.map(toFile),
    } as Article;
}

export function toFile(file: any): FileData {
    return {
        type: file.type,
        url: file.url,
        baseUrl: file.base_url,
        fileName: file.file_name,
    } as FileData;
}

export function getMetaValue(metas: any, key: string) {
    return metas[key] ? metas[key] : '';
}

export function getResizedUrl(fileData: FileData, size: {width: number; height: number}): string {
    if (fileData) {
        const {width, height} = size;
        return `${fileData.baseUrl}/${width}x${height}/${fileData.fileName}`;
    }
    return '';
}

export function getArticleTitle(article: Article) {
    return getMetaValue(article.metas, 'title') || article.name;
}

export function getArticleBackgroundImage(article: Article): FileData {
    if (article.posters.length > 0) {
        return article.posters[0];
    }
    if (this.article.length > 0) {
        return article.images[0];
    }
    return null;
}

export function toPlayConfigError(code: number): ArticlePlayErrors {
    switch (code) {
        case 0:
            return ArticlePlayErrors.offlineError;
        case 401:
            return ArticlePlayErrors.notAuthenticated;
        case 402:
            return ArticlePlayErrors.needEntitlement;
        case 403:
            return ArticlePlayErrors.notAuthenticated;
        case 404:
            return ArticlePlayErrors.noPlayableAsset;
        case 429:
            return ArticlePlayErrors.maxConcurrentStreamNumberError;

        default:
            return ArticlePlayErrors.serverError;
    }
}
