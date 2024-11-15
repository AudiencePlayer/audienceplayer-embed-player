/// <reference path="../../node_modules/@types/chromecast-caf-sender/index.d.ts" />

import {PlayConfig} from '../models/play-config';
import {Article} from '../models/article';
import {getArticleTitle} from '../api/converters';

export class ChromecastSender {
    private castContext: cast.framework.CastContext = null;
    private castPlayer: cast.framework.RemotePlayer = null;
    private castPlayerController: cast.framework.RemotePlayerController = null;
    private supportsHDR = false;

    init(chromecastReceiverAppId: string) {
        return new Promise<void>((resolve, reject) => {
            if (chromecastReceiverAppId) {
                window['__onGCastApiAvailable'] = (isAvailable: boolean) => {
                    if (isAvailable && cast && cast.framework && chrome && chrome.cast) {
                        try {
                            this.initializeCastApi(chromecastReceiverAppId);
                            resolve();
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        reject('Chromecast not available');
                    }
                };

                const scriptElement = document.createElement('script');
                scriptElement.async = true;
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

        this.castPlayerController.addEventListener(cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED, event => {
            if (this.castPlayer.isConnected) {
                const castSession = this.castContext.getCurrentSession();
                castSession.addMessageListener('urn:x-cast:com.audienceplayer.messagebus', (namespace, message) => {
                    const capabilities = JSON.parse(message);
                    this.supportsHDR = capabilities.is_hdr_supported;
                });
            } else {
                this.supportsHDR = false;
            }
        });
    }

    onConnectedListener(callback: (info: {connected: boolean; friendlyName: string}) => void) {
        const doCallback = () => {
            if (this.castPlayer.isConnected) {
                const castContext = cast.framework.CastContext.getInstance();
                const device = castContext.getCurrentSession().getCastDevice();

                callback({
                    connected: true,
                    friendlyName: device.friendlyName || 'Chromecast',
                });
            } else {
                callback({connected: false, friendlyName: ''});
            }
        };

        doCallback();
        this.castPlayerController.addEventListener(cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED, event => {
            doCallback();
        });
    }

    onMediaInfoListener(callback: (state: chrome.cast.media.PlayerState, info: any) => void) {
        this.castPlayerController.addEventListener(cast.framework.RemotePlayerEventType.PLAYER_STATE_CHANGED, () => {
            const state = this.castPlayer.playerState;
            let info: any = null;

            // only when media is loaded, otherwise IDLE state will cause issues
            if (this.castPlayer.isMediaLoaded) {
                if (this.castPlayer.mediaInfo) {
                    const customData: any = this.castPlayer.mediaInfo.customData;
                    if (customData && customData.extraInfo) {
                        info = customData.extraInfo;
                    }
                }
                callback(state, info);
            }
        });
    }

    onCurrentTimeListener(callback: (currentTime: number, duration: number) => void) {
        this.castPlayerController.addEventListener(cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED, () => {
            if (this.castPlayer.playerState !== chrome.cast.media.PlayerState.IDLE) {
                callback(this.castPlayer.currentTime, this.castPlayer.duration);
            }
        });
    }

    getSupportsHDR() {
        return this.supportsHDR;
    }

    getCastMediaInfo(articlePlayConfig: PlayConfig, article: Article, extraInfo?: any) {
        if (articlePlayConfig && articlePlayConfig.entitlements && articlePlayConfig.entitlements.length > 0) {
            let contentType = null;
            const supportedContentTypes = ['application/x-mpegURL', 'application/vnd.apple.mpegurl', 'video/mp4'];
            const entitlement = articlePlayConfig.entitlements.find(item => {
                if (supportedContentTypes.includes(item.type)) {
                    contentType = item.type;
                    return true;
                } else {
                    return false;
                }
            });

            // the HLS manifest contains the tracks, but otherwise add them
            const tracks: Array<chrome.cast.media.Track> =
                contentType === 'application/vnd.apple.mpegurl'
                    ? []
                    : articlePlayConfig.subtitles.map((option, index) => {
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

            if (entitlement) {
                const mediaInfo = new chrome.cast.media.MediaInfo(entitlement.src, contentType);
                mediaInfo.streamType = chrome.cast.media.StreamType.BUFFERED;
                mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
                mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
                mediaInfo.metadata.title = getArticleTitle(article);

                if (tracks.length > 0) {
                    mediaInfo.tracks = tracks;
                }

                const audioLocaleParam = articlePlayConfig.audioLocale ? {preferredAudioLocale: articlePlayConfig.audioLocale} : {};
                const textTrackParam = articlePlayConfig.subtitleLocale ? {preferredTextLocale: articlePlayConfig.subtitleLocale} : {};
                const extraInfoParam = extraInfo ? {extraInfo: JSON.stringify(extraInfo)} : {};

                mediaInfo.customData = {
                    ...audioLocaleParam,
                    ...textTrackParam,
                    ...extraInfoParam,
                    entitlements: articlePlayConfig.entitlements,
                    pulseToken: articlePlayConfig.pulseToken,
                    mediaProvider: entitlement.mediaProvider,
                };

                // @ts-ignore
                mediaInfo.currentTime = articlePlayConfig.currentTime;

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

    castVideo(playConfig: PlayConfig, article: Article, continueFromPreviousPosition: boolean, extraInfo?: any) {
        if (this.isConnected()) {
            const castSession = this.castContext.getCurrentSession();
            const mediaInfo = this.getCastMediaInfo(playConfig, article, extraInfo);

            if (mediaInfo) {
                const request = new chrome.cast.media.LoadRequest(mediaInfo);
                request.currentTime = continueFromPreviousPosition ? playConfig.currentTime : 0;
                return castSession.loadMedia(request);
            } else {
                throw {message: 'Unexpected manifest format in articlePlayConfig ' + JSON.stringify(playConfig)};
            }
        }
    }

    isConnected() {
        return this.castPlayer && this.castPlayer.isConnected;
    }

    stopMedia() {
        if (this.castContext) {
            const castSession = cast.framework.CastContext.getInstance().getCurrentSession();
            if (castSession) {
                castSession.getMediaSession().stop(new chrome.cast.media.StopRequest(), () => {}, () => {});
            }
        }
    }

    endSession(stopCasting: boolean) {
        if (this.castContext) {
            const castSession = cast.framework.CastContext.getInstance().getCurrentSession();
            if (castSession) {
                castSession.endSession(stopCasting);
            }
        }
    }

    stopCasting() {
        this.endSession(true);
    }

    getCastPlayer() {
        return this.castPlayer;
    }

    getCastPlayerController() {
        return this.castPlayerController;
    }
}
