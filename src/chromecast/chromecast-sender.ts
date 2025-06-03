import {PlayConfig} from '../models/play-config';
import {Article} from '../models/article';
import {getArticleTitle} from '../api/converters';
import {PlayParams} from '../models/play-params';
import {TrackInfo} from '../models/cast-info';

export class ChromecastSender {
    private castContext: cast.framework.CastContext = null;
    private castPlayer: cast.framework.RemotePlayer = null;
    private castPlayerController: cast.framework.RemotePlayerController = null;
    private initPromise: Promise<void> = null;
    private lastCurrentTimeMeasured: number = null;
    private updateInterval: any = null;
    private supportsHDR = false;
    private onConnectedListener: (info: {connected: boolean; friendlyName: string}) => void;
    private onPlayStateListener: (state: chrome.cast.media.PlayerState, info: {articleId: number; assetId: number}) => void;
    private onCurrentTimeListener: (currentTime: number) => void;
    private onMediaTracksListener: (audioTracks: TrackInfo[], textTracks: TrackInfo[]) => void;
    private onDurationListener: (duration: number) => void;

    constructor(private chromecastReceiverAppId: string) {}

    init() {
        this.initPromise =
            this.initPromise ||
            new Promise<void>((resolve, reject) => {
                if (this.chromecastReceiverAppId) {
                    window['__onGCastApiAvailable'] = (isAvailable: boolean) => {
                        if (isAvailable && cast && cast.framework && chrome && chrome.cast) {
                            try {
                                this.initializeCastApi(this.chromecastReceiverAppId);
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

        return this.initPromise;
    }

    initializeCastApi(chromecastReceiverAppId: string) {
        console.log('initializeCastApi', chromecastReceiverAppId);
        cast.framework.CastContext.getInstance().setOptions({
            receiverApplicationId: chromecastReceiverAppId,
            autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
        });
        this.castContext = cast.framework.CastContext.getInstance();
        this.castPlayer = new cast.framework.RemotePlayer();
        this.castPlayerController = new cast.framework.RemotePlayerController(this.castPlayer);

        this.castPlayerController.addEventListener(cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED, event => {
            if (this.castPlayer.isConnected) {
                const castSession = this.getCastSession();
                castSession.addMessageListener('urn:x-cast:com.audienceplayer.messagebus', (namespace, message) => {
                    const capabilities = JSON.parse(message);
                    this.supportsHDR = capabilities.is_hdr_supported;
                });
            } else {
                this.supportsHDR = false;
            }
        });

        this.castPlayerController.addEventListener(cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED, event => {
            if (this.onConnectedListener) {
                if (this.castPlayer.isConnected) {
                    const castSession = this.getCastSession();
                    if (castSession) {
                        const device = castSession.getCastDevice();
                        if (device) {
                            this.onConnectedListener({
                                connected: true,
                                friendlyName: device.friendlyName || 'Chromecast',
                            });
                            return;
                        }
                    }
                }
                this.onConnectedListener({connected: false, friendlyName: ''});
            }
        });

        this.castPlayerController.addEventListener(cast.framework.RemotePlayerEventType.PLAYER_STATE_CHANGED, () => {
            const state = this.castPlayer.playerState;
            let info: any = null;

            // only when media is loaded, otherwise IDLE state will cause issues
            if (this.castPlayer.isMediaLoaded) {
                if (this.castPlayer.mediaInfo) {
                    const customData: any = this.castPlayer.mediaInfo.customData;
                    if (customData) {
                        // @TODO extraInfo will be deprecated
                        if (customData.extraInfo) {
                            info = JSON.parse(customData.extraInfo);
                        } else if (customData.articleId && customData.assetId) {
                            info = {articleId: customData.articleId, assetId: customData.assetId};
                        }
                    }
                }
                if (this.onPlayStateListener) {
                    this.onPlayStateListener(state, info);
                }
            }
        });

        this.castPlayerController.addEventListener(cast.framework.RemotePlayerEventType.DURATION_CHANGED, () => {
            if (this.castPlayer.isMediaLoaded) {
                if (this.onDurationListener) {
                    this.onDurationListener(this.castPlayer.duration);
                }
            }
        });

        // @TODO consider clearInterval
        this.updateInterval = setInterval(() => {
            const mediaSession = this.getCastMediaSession();
            if (mediaSession && this.onCurrentTimeListener) {
                this.onCurrentTimeListener(mediaSession.getEstimatedTime());
            }
        }, 500);

        this.castPlayerController.addEventListener(cast.framework.RemotePlayerEventType.MEDIA_INFO_CHANGED, () => {
            if (this.castPlayer.isMediaLoaded && this.castPlayer.mediaInfo) {
                const mediaSession = this.getCastMediaSession();
                let audioTracks: TrackInfo[] = [];
                let textTracks: TrackInfo[] = [];

                if (this.castPlayer.mediaInfo.tracks && mediaSession) {
                    if (this.onMediaTracksListener) {
                        audioTracks = this.getTracksByType('AUDIO');
                        textTracks = this.getTracksByType('TEXT');
                        this.onMediaTracksListener(audioTracks, textTracks);
                    }
                }
            }
        });
    }

    setOnConnectedListener(callback: (info: {connected: boolean; friendlyName: string}) => void) {
        this.onConnectedListener = callback;
    }

    setOnPlayStateListener(callback: (state: chrome.cast.media.PlayerState, info: {articleId: number; assetId: number}) => void) {
        this.onPlayStateListener = callback;
    }

    setOnCurrentTimeListener(callback: (currentTime: number) => void) {
        this.onCurrentTimeListener = callback;
    }

    setOnMediaTracksListener(callback: (audioTracks: TrackInfo[], textTracks: TrackInfo[]) => void) {
        this.onMediaTracksListener = callback;
    }

    setOnDurationListener(callback: (duration: number) => void) {
        this.onDurationListener = callback;
    }

    getSupportsHDR() {
        return this.supportsHDR;
    }

    getCastMediaInfo(articlePlayConfig: PlayConfig, article: Article) {
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
                mediaInfo.streamType = entitlement.isLive ? chrome.cast.media.StreamType.LIVE : chrome.cast.media.StreamType.BUFFERED;

                this.addMediaInfoToMetaData(article, mediaInfo);

                if (tracks.length > 0) {
                    mediaInfo.tracks = tracks;
                }

                const audioLocaleParam = articlePlayConfig.audioLocale ? {preferredAudioLocale: articlePlayConfig.audioLocale} : {};
                const textTrackParam = articlePlayConfig.subtitleLocale ? {preferredTextLocale: articlePlayConfig.subtitleLocale} : {};

                mediaInfo.customData = {
                    ...audioLocaleParam,
                    ...textTrackParam,
                    entitlements: articlePlayConfig.entitlements,
                    pulseToken: articlePlayConfig.pulseToken,
                    mediaProvider: entitlement.mediaProvider,
                    articleId: articlePlayConfig.articleId,
                    assetId: articlePlayConfig.assetId,
                };

                // @ts-ignore
                mediaInfo.currentTime = articlePlayConfig.currentTime;

                return mediaInfo;
            }
        }
        return null;
    }

    getCastMediaInfoByParams(playParams: PlayParams, article?: Article) {
        const mediaInfo = new chrome.cast.media.MediaInfo('contentIdPlaceHolder', 'application/vnd.cast-media');

        this.addMediaInfoToMetaData(article, mediaInfo);

        mediaInfo.customData = {
            ...playParams,
        };

        return mediaInfo;
    }

    getCastSession() {
        return this.castContext.getCurrentSession();
    }

    getCastMediaSession() {
        const castSession = this.getCastSession();
        if (castSession) {
            return castSession.getMediaSession();
        }
    }

    castVideo(playConfig: PlayConfig, article: Article, continueFromPreviousPosition: boolean) {
        this.lastCurrentTimeMeasured = null;
        if (this.isConnected()) {
            const castSession = this.getCastSession();
            const mediaInfo = this.getCastMediaInfo(playConfig, article);

            if (mediaInfo) {
                const request = new chrome.cast.media.LoadRequest(mediaInfo);
                request.currentTime = continueFromPreviousPosition ? playConfig.currentTime : 0;
                return castSession.loadMedia(request);
            } else {
                throw {message: 'Unexpected manifest format in articlePlayConfig ' + JSON.stringify(playConfig)};
            }
        }
    }

    castVideoByParams(playParams: PlayParams) {
        console.log('castVideoByParams', playParams);
        this.lastCurrentTimeMeasured = null;
        if (this.isConnected()) {
            const castSession = this.getCastSession();

            const mediaInfo = this.getCastMediaInfoByParams(playParams);
            if (mediaInfo) {
                console.log('mediaInfo', mediaInfo);
                const request = new chrome.cast.media.LoadRequest(mediaInfo);
                return castSession.loadMedia(request);
            } else {
                return Promise.reject('Could not create media info request');
            }
        } else {
            return Promise.reject('castVideoByParams: Not connected!');
        }
    }

    isConnected() {
        return this.castPlayer && this.castPlayer.isConnected;
    }

    stopMedia() {
        if (this.castContext) {
            const castSession = this.getCastSession();
            if (castSession) {
                castSession.getMediaSession().stop(new chrome.cast.media.StopRequest(), () => {}, () => {});
            }
        }
    }

    endSession(stopCasting: boolean) {
        if (this.castContext) {
            const castSession = this.getCastSession();
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

    addMediaInfoToMetaData(article: Article, mediaInfo: chrome.cast.media.MediaInfo) {
        if (article) {
            mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
            mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
            mediaInfo.metadata.title = getArticleTitle(article);

            const image = article.images.length ? article.images[0] : null;
            // pick high available resolution
            mediaInfo.metadata.images = image ? [new chrome.cast.Image(`${image.baseUrl}/1920x1080/${image.fileName}`)] : [];
        }
    }

    getActiveTracksByType(type: string) {
        return this.getTracksByType(type)
            .filter(track => track.active)
            .map(track => +track.id);
    }

    getTracksByType(type: string) {
        const mediaSession = this.getCastMediaSession();
        return this.castPlayer.mediaInfo.tracks
            .filter(track => track.type === type && track.language)
            .map(track => ({
                id: track.trackId,
                locale: track.language,
                active: mediaSession && mediaSession.activeTrackIds && mediaSession.activeTrackIds.indexOf(track.trackId) !== -1,
            }));
    }

    setActiveTracks(trackIds: number[], type: string) {
        if (this.castPlayer && this.castPlayer.isConnected) {
            const mediaSession = this.getCastMediaSession();
            if (mediaSession) {
                const tracksInfoRequest = new chrome.cast.media.EditTracksInfoRequest(trackIds);
                mediaSession.editTracksInfo(
                    tracksInfoRequest,
                    () => {
                        // @TODO
                    },
                    (error: chrome.cast.Error) => console.error('ChromeCast', error)
                );
            } else {
                console.error('setActiveTracks called but no media session');
            }
        }
    }

    setActiveTrackById(selectedTrackId: number, type: string) {
        const newActiveTracks = this.getActiveTracksByType(type === 'AUDIO' ? 'TEXT' : 'AUDIO');
        const activeTracksOfType = this.getActiveTracksByType(type);
        const index = activeTracksOfType.indexOf(selectedTrackId);
        if (type === 'AUDIO' || (type === 'TEXT' && index === -1)) {
            newActiveTracks.push(selectedTrackId);
        }
        this.setActiveTracks(newActiveTracks, type);
    }
}
