import {ArticlePlayConfig, ArticlePlayEntitlement} from '../models/play-config';
import {Article} from '../models/article';

export function toPlayConfig(config: any, continueFromPreviousPosition: boolean): ArticlePlayConfig {
    const timeStamp = Date.parse(config.issued_at);
    const entitlements: ArticlePlayEntitlement[] = [];

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
        const entitlement: ArticlePlayEntitlement = {
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
        subtitleLocale: config.user_subtitle_locale,
        audioLocale: config.user_audio_locale,
        localTimeDelta: isNaN(timeStamp) ? 0 : Date.now() - timeStamp,
    };
}

export function toArticle(article: any, assetId: number): Article {
    const asset = article.assets.find((item: any) => item.id === assetId);
    return {
        title: getMetaValue(article.metas, 'title') || article.name,
        asset: {
            linkedType: asset.linked_type,
        },
    };
}
export function getMetaValue(metas: any, key: string) {
    const meta = metas.find((m: any) => m.key === key);
    return meta ? meta.value : '';
}
