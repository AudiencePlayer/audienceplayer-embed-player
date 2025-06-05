import {PlayConfig} from '../models/play-config';
import {Article} from '../models/article';
import {getArticleTitle} from '../api/converters';
import {PlayParams} from '../models/play-params';
import {ChromecastConnectionInfo, ChromecastPlayInfo, TrackInfo} from '../models/cast-info';

export class ChromecastSender {
    private static initPromise: Promise<void> = null;
    private castContext: cast.framework.CastContext = null;
    private castPlayer: cast.framework.RemotePlayer = null;
    private castPlayerController: cast.framework.RemotePlayerController = null;
    private lastConnectionInfo: ChromecastConnectionInfo = null;
    private lastPlayState: chrome.cast.media.PlayerState = null;
    private updateInterval: any = null;
    private supportsHDR = false;
    private onConnectedListeners: Array<(info: ChromecastConnectionInfo) => void> = [];
    private onPlayStateListeners: Array<(state: chrome.cast.media.PlayerState, info: ChromecastPlayInfo) => void> = [];
    private onCurrentTimeListeners: Array<(currentTime: number) => void> = [];
    private onMediaTracksListeners: Array<(audioTracks: TrackInfo[], textTracks: TrackInfo[]) => void> = [];
    private onDurationListeners: Array<(duration: number) => void> = [];

    constructor(private chromecastReceiverAppId: string) {
        console.log('ChromecastSender', chromecastReceiverAppId);
        if (ChromecastSender.initPromise) {
            throw Error('ChromecastSender already initialized');
        }
        ChromecastSender.initPromise = new Promise<void>((resolve, reject) => {
            if (this.chromecastReceiverAppId) {
                window['__onGCastApiAvailable'] = (isAvailable: boolean) => {
                    if (isAvailable && cast && cast.framework && chrome && chrome.cast) {
                        try {
                            this.initializeCastApi(this.chromecastReceiverAppId);
                            this.dispatchConnectionInfo({available: true, connected: false, friendlyName: ''});
                            resolve();
                        } catch (e) {
                            this.dispatchConnectionInfo({available: false, connected: false, friendlyName: ''});
                            reject(e);
                        }
                    } else {
                        this.dispatchConnectionInfo({available: false, connected: false, friendlyName: ''});
                        reject('Chromecast not available');
                    }
                };

                const scriptElement = document.createElement('script');
                scriptElement.async = true;
                scriptElement.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
                document.head.appendChild(scriptElement);
            } else {
                this.dispatchConnectionInfo({available: false, connected: false, friendlyName: ''});
                reject('Chromecast Receiver Application Id is missing');
            }
        });
    }

    init() {
        return ChromecastSender.initPromise;
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
            if (this.castPlayer.isConnected) {
                const castSession = this.getCastSession();
                if (castSession) {
                    const device = castSession.getCastDevice();
                    if (device) {
                        this.dispatchConnectionInfo({
                            available: true,
                            connected: true,
                            friendlyName: device.friendlyName || 'Chromecast',
                        });
                        return;
                    }
                }
            }
            if (this.lastPlayState !== null) {
                this.lastPlayState = null;
                this.dispatchPlayState(null, null);
            }
            this.dispatchConnectionInfo({available: true, connected: false, friendlyName: ''});
        });

        this.castPlayerController.addEventListener(cast.framework.RemotePlayerEventType.PLAYER_STATE_CHANGED, () => {
            const state = this.castPlayer.playerState;
            this.lastPlayState = state;
            let info: any = null;

            // only when media is loaded, otherwise IDLE state will cause issues
            if (this.castPlayer.isMediaLoaded) {
                if (this.castPlayer.mediaInfo && state !== null && state !== chrome.cast.media.PlayerState.IDLE) {
                    const customData: any = this.castPlayer.mediaInfo.customData;
                    if (customData) {
                        // @TODO extraInfo will be deprecated
                        if (customData.extraInfo) {
                            info = JSON.parse(customData.extraInfo);
                        } else if (customData.articleId && customData.assetId) {
                            info = {articleId: customData.articleId, assetId: customData.assetId, token: customData.token};
                        }
                    }
                }
                this.dispatchPlayState(state, info);
            }
        });

        this.castPlayerController.addEventListener(cast.framework.RemotePlayerEventType.DURATION_CHANGED, () => {
            if (this.castPlayer.isMediaLoaded) {
                this.onDurationListeners.forEach(listener => listener(this.castPlayer.duration));
            }
        });

        this.castPlayerController.addEventListener(cast.framework.RemotePlayerEventType.MEDIA_INFO_CHANGED, () => {
            if (this.castPlayer.isMediaLoaded && this.castPlayer.mediaInfo) {
                const mediaSession = this.getCastMediaSession();
                let audioTracks: TrackInfo[] = [];
                let textTracks: TrackInfo[] = [];

                if (this.castPlayer.mediaInfo.tracks && mediaSession) {
                    audioTracks = this.getTracksByType('AUDIO');
                    textTracks = this.getTracksByType('TEXT');
                    this.onMediaTracksListeners.forEach(listener => listener(audioTracks, textTracks));
                }
            }
        });
    }

    addOnConnectedListener(callback: (info: ChromecastConnectionInfo) => void) {
        this.onConnectedListeners.push(callback);

        if (this.lastConnectionInfo) {
            this.dispatchConnectionInfo(this.lastConnectionInfo);
        }
    }

    removeOnConnectedListener(callback: (info: ChromecastConnectionInfo) => void) {
        const index = this.onConnectedListeners.indexOf(callback);
        if (index >= 0) {
            this.onConnectedListeners.splice(index, 1);
        }
    }

    addOnPlayStateListener(callback: (state: chrome.cast.media.PlayerState, info: ChromecastPlayInfo) => void) {
        this.onPlayStateListeners.push(callback);
    }

    removeOnPlayStateListener(callback: (state: chrome.cast.media.PlayerState, info: ChromecastPlayInfo) => void) {
        const index = this.onPlayStateListeners.indexOf(callback);
        if (index >= 0) {
            this.onPlayStateListeners.splice(index, 1);
        }
    }

    addOnCurrentTimeListener(callback: (currentTime: number) => void) {
        if (this.onCurrentTimeListeners.length === 0) {
            this.updateInterval = setInterval(() => {
                const mediaSession = this.getCastMediaSession();
                if (mediaSession) {
                    this.onCurrentTimeListeners.forEach(listener => listener(mediaSession.getEstimatedTime()));
                }
            }, 500);
        }
        this.onCurrentTimeListeners.push(callback);
    }

    removeOnCurrentTimeListener(callback: (currentTime: number) => void) {
        const index = this.onCurrentTimeListeners.indexOf(callback);
        if (index >= 0) {
            this.onCurrentTimeListeners.splice(index, 1);
        }
        if (this.onCurrentTimeListeners.length === 0) {
            clearInterval(this.updateInterval);
        }
    }

    addOnMediaTracksListener(callback: (audioTracks: TrackInfo[], textTracks: TrackInfo[]) => void) {
        this.onMediaTracksListeners.push(callback);
    }

    removeOnMediaTracksListener(callback: (audioTracks: TrackInfo[], textTracks: TrackInfo[]) => void) {
        const index = this.onMediaTracksListeners.indexOf(callback);
        if (index >= 0) {
            this.onMediaTracksListeners.splice(index, 1);
        }
    }

    addOnDurationListener(callback: (duration: number) => void) {
        this.onDurationListeners.push(callback);
    }

    removeOnDurationListener(callback: (duration: number) => void) {
        const index = this.onDurationListeners.indexOf(callback);
        if (index >= 0) {
            this.onDurationListeners.splice(index, 1);
        }
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
        if (this.isConnected()) {
            //this.stopMedia().then(() => {
            //this.endSession(false);
            const castSession = this.getCastSession();
            const mediaInfo = this.getCastMediaInfo(playConfig, article);

            if (mediaInfo) {
                const request = new chrome.cast.media.LoadRequest(mediaInfo);
                request.currentTime = continueFromPreviousPosition ? playConfig.currentTime : 0;
                return castSession.loadMedia(request);
            } else {
                throw {message: 'Unexpected manifest format in articlePlayConfig ' + JSON.stringify(playConfig)};
            }
            //});
        }
    }

    castVideoByParams(playParams: PlayParams): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log('castVideoByParams', playParams);
            if (this.isConnected()) {
                //this.stopMedia().then(() => {
                //this.endSession(false);
                const castSession = this.getCastSession();

                const mediaInfo = this.getCastMediaInfoByParams(playParams);
                if (mediaInfo) {
                    console.log('mediaInfo', mediaInfo);
                    const request = new chrome.cast.media.LoadRequest(mediaInfo);
                    castSession.loadMedia(request).then(errorCode => {
                        console.log('castVideoByParams: loadMedia', errorCode);
                        resolve();
                    });
                } else {
                    reject('Could not create media info request');
                }
                //});
            } else {
                reject('castVideoByParams: Not connected!');
            }
        });
    }

    isConnected() {
        return this.castPlayer && this.castPlayer.isConnected;
    }

    stopMedia(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.castContext) {
                const castSession = this.getCastSession();
                if (castSession) {
                    const mediaSession = castSession.getMediaSession();
                    if (mediaSession) {
                        mediaSession.stop(
                            new chrome.cast.media.StopRequest(),
                            () => {
                                console.log('stopMedia: stopped media session');
                                resolve();
                            },
                            () => {
                                console.log('stopMedia: dit NOT stop media session');
                                resolve();
                            }
                        );
                        return;
                    }
                }
            }
            console.log('stopMedia: No session');
            resolve();
        });
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

    private dispatchConnectionInfo(info: ChromecastConnectionInfo) {
        this.lastConnectionInfo = info;
        console.log('dispatchConnectionInfo', info, this.onConnectedListeners.length);
        this.onConnectedListeners.forEach(listener => listener(info));
    }

    private dispatchPlayState(state: chrome.cast.media.PlayerState, info: ChromecastPlayInfo) {
        console.log('dispatchPlayState', state, info, this.onPlayStateListeners.length);
        this.onPlayStateListeners.forEach(listener => listener(state, info));
    }
}
