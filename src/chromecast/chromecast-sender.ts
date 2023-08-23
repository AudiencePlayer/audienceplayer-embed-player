/// <reference path="../../node_modules/@types/chromecast-caf-sender/index.d.ts" />

import {ArticlePlayConfig} from '../models/play-config';
import {Article} from '../models/article';

export class ChromecastSender {
    castContext: cast.framework.CastContext = null;
    castPlayer: cast.framework.RemotePlayer = null;
    castPlayerController: cast.framework.RemotePlayerController = null;

    init(chromecastReceiverAppId: string) {
        return new Promise<void>((resolve, reject) => {
            if (chromecastReceiverAppId) {
                window['__onGCastApiAvailable'] = (isAvailable: boolean) => {
                    if (isAvailable && cast && cast.framework) {
                        this.initializeCastApi(chromecastReceiverAppId);

                        //Some Chromecast configurations are taking some time to initialize
                        setTimeout(() => {
                            resolve();
                        }, 1000);
                    }
                };

                const scriptElement = document.createElement('script');
                scriptElement.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
                document.head.appendChild(scriptElement);
            } else {
                reject('Chromecast Receiver Application Id is missing');
            }
        });
    }

    initializeCastApi(chromecastReceiverAppId: string) {
        cast.framework.CastContext.getInstance().setOptions({
            receiverApplicationId: chromecastReceiverAppId,
            autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
        });
        this.castContext = cast.framework.CastContext.getInstance();
        this.castPlayer = new cast.framework.RemotePlayer();
        this.castPlayerController = new cast.framework.RemotePlayerController(this.castPlayer);
    }

    getCastMediaInfo(articlePlayConfig: ArticlePlayConfig, article: Article) {
        if (articlePlayConfig && articlePlayConfig.entitlements && articlePlayConfig.entitlements.length > 0) {
            const tracks = articlePlayConfig.subtitles.map((option, index) => {
                const trackId = index + 1;
                const castTrack = new chrome.cast.media.Track(trackId, chrome.cast.media.TrackType.TEXT);
                castTrack.trackContentId = option.src;
                castTrack.trackContentType = 'text/vtt';
                castTrack.subtype = chrome.cast.media.TextTrackType.SUBTITLES;
                castTrack.name = option.label;
                castTrack.language = option.srclang;
                castTrack.customData = null;
                return castTrack;
            });
            let contentType = null;
            const supportedContentTypes = ['application/vnd.ms-sstr+xml', 'video/mp4'];
            const entitlement = articlePlayConfig.entitlements.find(item => {
                if (supportedContentTypes.includes(item.type)) {
                    contentType = item.type;
                    return true;
                } else {
                    return false;
                }
            });
            let protectionConfig = null;

            if (entitlement) {
                if (entitlement.protectionInfo) {
                    protectionConfig = entitlement.protectionInfo.find(protection => {
                        return protection.type === 'PlayReady';
                    });
                }
                const token = protectionConfig ? protectionConfig.authenticationToken : null;
                const mediaInfo = new chrome.cast.media.MediaInfo(entitlement.src, contentType);
                mediaInfo.streamType = chrome.cast.media.StreamType.BUFFERED;
                mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
                mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
                mediaInfo.metadata.title = article.title;
                mediaInfo.tracks = tracks;
                const licenceUrlParam = token
                    ? {
                          ...this.getLicenseUrlFromSrc(protectionConfig.keyDeliveryUrl, token),
                      }
                    : {};
                const audieLocalePram = articlePlayConfig.audioLocale ? {preferredAudioLocale: articlePlayConfig.audioLocale} : {};
                mediaInfo.customData = {
                    ...licenceUrlParam,
                    ...audieLocalePram,
                    pulseToken: articlePlayConfig.pulseToken,
                };
                // @TODO
                // mediaInfo.currentTime = articlePlayConfig.currentTime;
                // mediaInfo.autoplay = true;

                return mediaInfo;
            }
        }
        return null;
    }

    getLicenseUrlFromSrc(src: string, token: string) {
        if (token) {
            const rootSrc = src.includes('?') ? `${src}&token=` : `${src}?token=`;
            const licenseUrl = rootSrc + encodeURIComponent(token);
            return {
                licenseUrl,
                token,
            };
        }
        return {};
    }

    castVideo(playConfig: ArticlePlayConfig, article: Article, continueFromPreviousPosition: boolean) {
        if (this.isConnected()) {
            const castSession = this.castContext.getCurrentSession();
            const mediaInfo = this.getCastMediaInfo(playConfig, article);

            if (mediaInfo) {
                const request = new chrome.cast.media.LoadRequest(mediaInfo);
                request.currentTime = continueFromPreviousPosition ? playConfig.currentTime : 0;
                if (playConfig.subtitleLocale) {
                    // can NOT use .filter on tracks because the cast library has patched the Array.
                    const textTrack = mediaInfo.tracks.find((track: chrome.cast.media.Track) => track.language === playConfig.subtitleLocale);
                    if (textTrack) {
                        request.activeTrackIds = [textTrack.trackId];
                    }
                }
                return castSession.loadMedia(request);
            } else {
                throw {message: 'Unexpected manifest format in articlePlayConfig'};
            }
        }
    }

    isConnected() {
        return this.castPlayer && this.castPlayer.isConnected;
    }

    stopCasting() {
        const castSession = cast.framework.CastContext.getInstance().getCurrentSession();
        if (castSession) {
            castSession.endSession(true);
        }
    }

    getCastPlayer() {
        return this.castPlayer;
    }

    getCastPlayerController() {
        return this.castPlayerController;
    }
}
