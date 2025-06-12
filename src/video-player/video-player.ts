import {MimeTypeDash, MimeTypeHls, MimeTypeMp4, PlayConfig} from '../models/play-config';
import {supportsHLS, supportsNativeHLS} from '../utils/platform';
import {PlayerLoggerService} from '../logging/player-logger-service';
import {PlayerDeviceTypes} from '../models/player';
import {getEmeOptionsFromEntitlement} from '../utils/eme';
import {InitParams, PlayParams} from '../models/play-params';
import {createHotKeysFunction} from './hotkeys';
import {getISO2Locale} from '../utils/locale';
import {createSkipIntroPlugin} from './plugins/skip-intro';
import {createAudioTrackPlugin} from './plugins/audio-track-button';
import {createChromecastButtonPlugin} from './plugins/chromecast-button';
import {createCustomOverlaykPlugin} from './plugins/custom-overlay';
import {createOverlayPlugin} from './plugins/overlay';
import {createPlaybackRatePlugin} from './plugins/playback-rate-button';
import {createSubtitlesButtonPlugin} from './plugins/subtitles-button';
import {ApiService} from '../api/api-service';
import {createChromecastTechPlugin} from './plugins/chromecast-tech';
import {ChromecastSender} from '../chromecast/chromecast-sender';
import {ChromecastConnectionInfo, ChromecastPlayInfo} from '../models/cast-info';

export class VideoPlayer {
    private player: any = null;
    private apiService: ApiService = null;
    private castSender: ChromecastSender = null;
    private playerLoggerService: PlayerLoggerService;
    private localPlayConfig: PlayConfig; // this contains the play config for a local playout, with CC it's a remote playout, and null.
    private firstPlayingEvent: boolean;
    private currentTextTrack: string;
    private currentAudioTrack: string;
    private metadataLoaded: boolean;
    private currentTime: number;
    private initParams: InitParams;
    private stopped = false; // to make sure that if stop() was called, no async playout methods can continue play
    private continueTimeout: any = null;

    constructor(private videojsInstance: any, baseUrl: string = null, projectId: number = 0, chromecastReceiverAppId: string = null) {
        if (baseUrl && typeof baseUrl === 'string' && projectId > 0) {
            this.apiService = new ApiService(baseUrl.replace(/\/*$/, ''), projectId);
        }
        this.playerLoggerService = new PlayerLoggerService(baseUrl, projectId);

        createAudioTrackPlugin(videojsInstance);
        createChromecastButtonPlugin(videojsInstance);
        createCustomOverlaykPlugin(videojsInstance);
        createOverlayPlugin(videojsInstance);
        createPlaybackRatePlugin(videojsInstance);
        createSkipIntroPlugin(videojsInstance);
        createSubtitlesButtonPlugin(videojsInstance);

        if (chromecastReceiverAppId) {
            this.castSender = new ChromecastSender(chromecastReceiverAppId);

            createChromecastTechPlugin(videojsInstance, this.castSender);
        }
    }

    init(initParams: InitParams) {
        this.destroy();

        this.stopped = false;
        this.localPlayConfig = null;
        this.initParams = initParams;
        const videoContainer = initParams.selector instanceof Element ? initParams.selector : document.querySelector(initParams.selector);

        if (!videoContainer) {
            throw Error('Invalid selector or element for player');
        }

        this.playerLoggerService.init();

        const videoElement = document.createElement('video');
        videoElement.setAttribute(
            'class',
            ['video-js', initParams.defaultSkinClass ? initParams.defaultSkinClass : 'vjs-default-skin'].join(' ')
        );
        videoElement.setAttribute('tabIndex', '0');
        videoElement.setAttribute('width', '100%');
        videoElement.setAttribute('height', '100%');
        // this will hide the internal video element chromecast button. We want to keep Airplay, so only if native HLS is not supported
        videoElement.disableRemotePlayback = !supportsNativeHLS(this.videojsInstance);

        videoContainer.appendChild(videoElement);

        const techOrder = this.castSender ? ['chromecast', 'html5'] : ['html5']; // chromecast first, to make it the `active tech`.

        const playOptions = {
            fluid: false,
            fill: true,
            responsive: true,
            techOrder,
            controls: true,
            controlBar: {
                pictureInPictureToggle: false,
                skipButtons: initParams.skipButtons || false,
                currentTimeDisplay: true,
                durationDisplay: true,
                timeDivider: false,
                volumePanel: {
                    inline: false,
                },
                chromecastButton: !!initParams.chromecastButton,
                // order of elements:
                children: [
                    'skipBackward',
                    'playToggle',
                    'skipForward',
                    'currentTimeDisplay',
                    'progressControl',
                    'durationDisplay',
                    {name: 'spacer'},
                    'customPlaybackRateMenuButton',
                    'customSubtitlesButton',
                    'customAudioTrackButton',
                    'volumePanel',
                    'chromecastButton',
                    'fullscreenToggle',
                ],
            },
            userActions: {
                hotkeys: createHotKeysFunction(this.videojsInstance, {backward: -30, forward: 30}),
            },
            html5: {
                vhs: {
                    // do to use videojs-http-streaming if it's natively supported
                    overrideNative: !supportsNativeHLS(this.videojsInstance),
                    cacheEncryptionKeys: true,
                },
            },
            ...initParams.options,
        };

        // this.videojsInstance.use('*', this.middleware);
        this.player = this.videojsInstance(videoElement, playOptions);
        this.player.eme();
        this.player.eme.initLegacyFairplay();

        this.bindEvents();
    }

    playByParams(playParams: PlayParams): Promise<void> {
        this.stopped = false;
        if (this.castSender && this.castSender.isConnected()) {
            this.localPlayConfig = null;
            this.player.src({src: 'chromecast', type: 'application/vnd.chromecast', playParams});
            return Promise.resolve();
        } else {
            if (this.apiService) {
                this.player.addClass('vjs-waiting');
                this.apiService.setToken(playParams.token ? playParams.token : null);

                return this.apiService
                    .getArticleAssetPlayConfig(playParams)
                    .then(config => {
                        if (!this.stopped) {
                            this.player.src(this.getAndInitPlaySourcesFromConfig(config, playParams));
                        } else {
                            this.player.removeClass('vjs-waiting');
                            console.log('playByParams, play stopped');
                        }
                    })
                    .catch(() => {
                        this.player.removeClass('vjs-waiting');
                    });
            } else {
                return Promise.reject('No API service available');
            }
        }
    }

    play(playConfig: PlayConfig) {
        this.stopped = false;
        this.player.src(this.getAndInitPlaySourcesFromConfig(playConfig));

        if (this.initParams.fullscreen) {
            this.player.requestFullscreen();
        }
    }

    setPoster(posterUrl: string) {
        this.player.poster(posterUrl);
    }

    updateOverlay(el: HTMLElement) {
        const overlayComponent = this.player.overlay;
        if (overlayComponent) {
            overlayComponent.updateContent(el);
        }
    }

    destroy() {
        this.stop();
        this.playerLoggerService.destroy();

        if (this.castSender) {
            this.castSender.removeOnConnectedListener(this.onConnectedListener);
            this.castSender.removeOnPlayStateListener(this.onPlayStateListener);
        }
        if (this.player) {
            this.player.dispose();
        }
        this.player = null;
        this.currentAudioTrack = null;
        this.currentTextTrack = null;
        this.currentTime = -1;
    }

    getPlayer(): any {
        return this.player;
    }

    stop() {
        if (!this.stopped) {
            this.stopped = true;
            this.firstPlayingEvent = true;
            if (this.continueTimeout) {
                clearTimeout(this.continueTimeout);
                this.continueTimeout = null;
            }
            if (this.castSender && this.castSender.getCastMediaSession()) {
                this.castSender.endSession(false);
            }
            if (this.player) {
                if (false === this.player.ended()) {
                    this.player.pause();
                    // only if we have not already caught the 'ended' event
                    // Be aware that the `stopped` emit also send along all kinds of info, so call _before_ disposing player
                    if (this.localPlayConfig) {
                        this.playerLoggerService.onStop();
                    }
                }
                this.player.removeClass('vjs-waiting');
                this.player.reset();
            }
        }
    }

    private getAndInitPlaySourcesFromConfig(playConfig: PlayConfig, playParams: PlayParams = null) {
        this.localPlayConfig = playConfig;
        this.playerLoggerService.onStart(playConfig.pulseToken, PlayerDeviceTypes.default, playConfig.localTimeDelta, true);

        // simple assumption: either support FPS or Widevine
        const supportsFPS = supportsHLS(this.videojsInstance);
        const supportsWidevine = !supportsFPS;
        // usable HLS sources are supported without DRM (protectionInfo) or when FPS is supported
        const hlsSources = playConfig.entitlements.filter(
            entitlement => entitlement.type === MimeTypeHls && (supportsFPS || entitlement.protectionInfo === null)
        );
        // usable Dash sources are supported without DRM or when Widevine is supported
        const dashSources = playConfig.entitlements.filter(
            entitlement => entitlement.type === MimeTypeDash && (supportsWidevine || entitlement.protectionInfo === null)
        );
        const mp4Sources = playConfig.entitlements.filter(entitlement => entitlement.type === MimeTypeMp4);
        // configure HLS only in case of `supportsHLS` or when no other sources available.
        const configureHLSOnly =
            (supportsHLS(this.videojsInstance) || (dashSources.length === 0 && mp4Sources.length === 0)) && hlsSources.length > 0;

        const trackParam = configureHLSOnly
            ? {}
            : {
                  textTracks: playConfig.subtitles.map(track => ({
                      kind: track.kind,
                      src: track.src,
                      srclang: track.srclang,
                      label: track.label,
                      enabled: track.srclang === playConfig.subtitleLocale,
                  })),
              };

        const playSources = playConfig.entitlements
            .map(entitlement => {
                const emeOptions = getEmeOptionsFromEntitlement(this.videojsInstance, entitlement);
                return {
                    src: entitlement.src,
                    type: entitlement.type,
                    playParams,
                    ...emeOptions,
                    ...trackParam,
                };
            })
            .filter(playOption => {
                return (playOption.type === MimeTypeHls && configureHLSOnly) || !configureHLSOnly;
            });

        return playSources;
    }

    private bindEvents() {
        if (this.castSender) {
            this.castSender.addOnConnectedListener(this.onConnectedListener);
            this.castSender.addOnPlayStateListener(this.onPlayStateListener);
        }
        this.player.on('error', () => {
            if (this.localPlayConfig) {
                this.playerLoggerService.onError(JSON.stringify(this.player.error()));
            }
        });

        this.player.on('playing', () => {
            if (this.localPlayConfig) {
                if (this.firstPlayingEvent) {
                    this.firstPlayingEvent = false;
                    if (this.localPlayConfig && this.localPlayConfig.currentTime > 0) {
                        this.player.currentTime(this.localPlayConfig.currentTime);
                    }
                    if (this.localPlayConfig && this.localPlayConfig.continuePaused) {
                        this.player.pause();
                    }
                }
                this.checkSelectedTracks();
                this.playerLoggerService.onPlaying();
            }
        });

        this.player.on('pause', () => {
            if (this.localPlayConfig) {
                this.checkSelectedTracks();
                if (this.player.paused() && !this.player.ended()) {
                    if (this.localPlayConfig) {
                        this.playerLoggerService.onPause();
                    }
                }
            }
        });

        this.player.on('ended', () => {
            if (this.localPlayConfig) {
                this.checkSelectedTracks();
                if (this.localPlayConfig) {
                    this.playerLoggerService.onStop();
                }
            }
        });

        const skipIntroComponent = this.player.skipIntro;

        this.player.on('timeupdate', () => {
            if (this.localPlayConfig) {
                const tempTime = Math.ceil(this.player.currentTime()) || 0;
                if (this.currentTime !== tempTime) {
                    this.currentTime = tempTime;
                    this.checkSelectedTracks();

                    if (this.localPlayConfig) {
                        this.playerLoggerService.onCurrentTimeUpdated(this.currentTime);
                    }

                    if (!!this.localPlayConfig && !!this.localPlayConfig.skipIntro && skipIntroComponent) {
                        if (
                            this.localPlayConfig.skipIntro.start <= this.currentTime &&
                            this.localPlayConfig.skipIntro.end >= this.currentTime
                        ) {
                            skipIntroComponent.trigger('show');
                        } else {
                            skipIntroComponent.trigger('hide');
                        }
                    }
                }
            }
        });

        if (skipIntroComponent) {
            skipIntroComponent.on('skip', () => {
                // @TODO for CC
                if (this.localPlayConfig) {
                    this.player.currentTime(this.localPlayConfig.skipIntro.end);
                }
            });
        }

        this.player.on('durationchange', () => {
            if (this.localPlayConfig) {
                this.checkSelectedTracks();
                this.playerLoggerService.onDurationUpdated(this.player.duration());
            }
        });

        this.player.on('loadedmetadata', () => {
            if (this.localPlayConfig) {
                const selectedSource = this.player.currentSource();
                const textTracks = selectedSource.textTracks || [];

                textTracks.forEach((track: any) => {
                    this.player.addRemoteTextTrack(track, false);
                });

                const audioTrackList = this.player.audioTracks();
                if (audioTrackList && audioTrackList.length > 0) {
                    // set default tracks when available
                    this.setDefaultAudioTrack();
                    this.setDefaultTextTrack();
                    this.metadataLoaded = true;
                } else {
                    // unfortunately there is no reliable way to know when iOS native binding to text-tracks is done
                    // (even after first play event, this is not true), so we resort to an old fashioned timeout
                    setTimeout(() => {
                        this.setDefaultAudioTrack();
                        this.setDefaultTextTrack();
                        this.metadataLoaded = true;
                    }, 1000);
                }
            }
        });
    }

    getCastSender() {
        return this.castSender;
    }

    private checkSelectedTracks() {
        if (!this.metadataLoaded) {
            return false;
        }

        let selectedAudioTrack = '';
        let selectedTextTrack = '';
        let selectedResolution = null;

        const videoWidth = this.player.videoWidth();
        const videoHeight = this.player.videoHeight();

        if (videoWidth > 0 && videoHeight > 0) {
            selectedResolution = videoWidth + 'x' + videoHeight;
        }

        const tracks = this.player.textTracks() as any;
        for (let i = 0; i < tracks.length; i++) {
            if (tracks[i].mode === 'showing' && tracks[i].kind === 'subtitles') {
                selectedTextTrack = tracks[i].language;
            }
        }

        const audioTracks = this.player.audioTracks();
        for (let i = 0; i < audioTracks.length; i++) {
            if (audioTracks[i].enabled) {
                selectedAudioTrack = audioTracks[i].language;
                break;
            }
        }

        if (this.localPlayConfig) {
            this.playerLoggerService.updateProperties({
                textTrack: selectedTextTrack,
                audioTrack: selectedAudioTrack,
                resolution: selectedResolution,
            });
        }

        if (this.currentTextTrack !== null && this.currentTextTrack !== selectedTextTrack) {
            if (this.localPlayConfig) {
                this.playerLoggerService.onTextTrackChanged(selectedTextTrack);
            }
        }

        this.currentTextTrack = selectedTextTrack;

        if (this.currentAudioTrack !== null && this.currentAudioTrack !== selectedAudioTrack) {
            if (this.localPlayConfig) {
                this.playerLoggerService.onAudioTrackChanged(selectedAudioTrack);
            }
        }
        this.currentAudioTrack = selectedAudioTrack;
    }

    private setDefaultTextTrack() {
        if (this.localPlayConfig && this.localPlayConfig.subtitleLocale) {
            const tracks = this.player.textTracks();
            for (let i = 0; i < tracks.length; i++) {
                // textTracks is not a real array so no iterators here
                if (tracks[i].mode !== 'disabled') {
                    tracks[i].mode = 'disabled';
                }
            }
            // it must be split up in to two loops, because two 'showing' items will break
            for (let i = 0; i < tracks.length; i++) {
                const trackLocale = getISO2Locale(tracks[i].language);
                if (trackLocale === this.localPlayConfig.subtitleLocale.toLowerCase() && tracks[i].kind === 'subtitles') {
                    tracks[i].mode = 'showing';
                    break;
                }
            }
        }
    }

    private setDefaultAudioTrack() {
        if (this.localPlayConfig && this.localPlayConfig.audioLocale) {
            const audioTracks = this.player.audioTracks();
            for (let i = 0; i < audioTracks.length; i++) {
                const trackLocale = getISO2Locale(audioTracks[i].language);
                if (
                    (this.localPlayConfig.audioLocale && trackLocale === this.localPlayConfig.audioLocale.toLowerCase()) ||
                    (this.localPlayConfig.audioLocale === '' && i === 0)
                ) {
                    audioTracks[i].enabled = true;
                    break;
                }
            }
        }
    }

    private onConnectedListener = (info: ChromecastConnectionInfo) => {
        if (!this.player) {
            return;
        }

        if (info.connected) {
            this.player.addClass('vjs-chromecast-connected');
        } else {
            this.player.removeClass('vjs-chromecast-connected');
        }

        if (info.connected && this.player.currentType() !== 'application/vnd.chromecast') {
            this.continueWithCurrentSources();
        }
    };

    private onPlayStateListener = (state: chrome.cast.media.PlayerState, info: ChromecastPlayInfo) => {
        if (state === null || state === chrome.cast.media.PlayerState.IDLE) {
            this.player.removeClass('vjs-chromecast-has-media');

            if (this.player.currentType() === 'application/vnd.chromecast') {
                // chromecast could have become IDLE due to closed connection,
                // so check if no longer connected to continue with current sources after a small timeout
                setTimeout(() => {
                    if (this.castSender && !this.castSender.isConnected()) {
                        this.continueWithCurrentSources();
                    }
                }, 300);
            }
        } else {
            this.player.addClass('vjs-chromecast-has-media');
        }
    };

    private continueWithCurrentSources() {
        const currentSources = this.player.currentSources();
        const continuePaused = this.player.paused();

        if (!this.stopped && currentSources && currentSources.length > 0 && currentSources[0].playParams && this.player.currentType()) {
            this.stop();

            this.player.addClass('vjs-waiting');
            this.continueTimeout = setTimeout(() => {
                this.continueTimeout = null;
                this.playByParams({
                    ...currentSources[0].playParams,
                    continuePaused,
                });
            }, 3000);
        }
    }
}
