import {ArticlePlayConfig} from '../models/play-config';
import {supportsHLS, supportsNativeHLS} from '../utils/platform';
import {PlayerLoggerService} from '../logging/player-logger-service';
import {PlayerDeviceTypes} from '../models/player';
import {getEmeOptionsFromEntitlement} from '../utils/eme';
import {InitParams} from '../models/play-params';
import {CustomPlaybackRateMenuButton} from './plugins/playback-rate-button';
import {CustomAudioTrackButton} from './plugins/audio-track-button';
import {hotkeys} from './hotkeys';
import {getISO2Locale} from '../utils/locale';
import {CustomSubtitlesButton, CustomTextTrackButton} from './plugins/subtitles-button';
import {ChromecastButton} from './plugins/chromecast-button';
import {Overlay} from './plugins/overlay';

declare const videojs: any;

export class VideoPlayer {
    private player: any = null;
    private playerLoggerService: PlayerLoggerService;
    private articlePlayConfig: ArticlePlayConfig;
    private firstPlayingEvent: boolean;
    private currentTextTrack: string;
    private currentAudioTrack: string;
    private metadataLoaded: boolean;

    constructor(baseUrl: string, projectId: number) {
        this.playerLoggerService = new PlayerLoggerService(baseUrl, projectId);

        videojs.registerComponent('customAudioTrackButton', CustomAudioTrackButton);
        videojs.registerComponent('customTextTrackButton', CustomTextTrackButton);
        videojs.registerComponent('customSubtitlesButton', CustomSubtitlesButton);
        videojs.registerComponent('customPlaybackRateMenuButton', CustomPlaybackRateMenuButton);
        videojs.registerComponent('chromecastButton', ChromecastButton);
        videojs.registerComponent('overlay', Overlay);
    }

    init(initParams: InitParams) {
        this.destroy();

        const videoContainer = initParams.selector instanceof Element ? initParams.selector : document.querySelector(initParams.selector);

        if (!videoContainer) {
            throw Error('Invalid selector or element for player');
        }

        this.playerLoggerService.init();

        const videoElement = document.createElement('video');
        videoElement.setAttribute('class', ['video-js', 'vjs-default-skin'].join(' '));
        videoElement.setAttribute('tabIndex', '0');
        videoElement.setAttribute('width', '100%');
        videoElement.setAttribute('height', '100%');

        videoContainer.appendChild(videoElement);

        const playOptions = {
            fluid: true,
            responsive: true,
            controls: true,
            controlBar: {
                pictureInPictureToggle: false,
                currentTimeDisplay: true,
                durationDisplay: true,
                timeDivider: false,
                volumePanel: {
                    inline: false,
                },
                chromecastButton: !!initParams.chromecastButton,
                // order of elements:
                children: [
                    'playToggle',
                    'currentTimeDisplay',
                    'progressControl',
                    'durationDisplay',
                    'customPlaybackRateMenuButton',
                    'customSubtitlesButton',
                    'customAudioTrackButton',
                    'volumePanel',
                    'chromecastButton',
                    'fullscreenToggle',
                ],
            },
            overlay: {
                element: initParams.overlayElement ? initParams.overlayElement : null,
            },
            userActions: {
                hotkeys: hotkeys({backward: -30, forward: 30}),
            },
            aspectRatio: '16:9',
            html5: {
                vhs: {
                    // do to use videojs-http-streaming if it's natively supported
                    overrideNative: !supportsNativeHLS(),
                    cacheEncryptionKeys: true,
                },
            },
            ...initParams.options,
        };

        this.player = videojs(videoElement, playOptions);
        this.player.eme();
        this.bindEvents();
    }

    play(playConfig: ArticlePlayConfig, initParams: InitParams) {
        this.firstPlayingEvent = true;
        if (!this.player || (this.player && this.player.currentSrc())) {
            this.destroy();
            this.init(initParams);
        }

        this.articlePlayConfig = playConfig;

        this.playerLoggerService.onStart(playConfig.pulseToken, PlayerDeviceTypes.default, playConfig.localTimeDelta, true);

        const hlsSources = playConfig.entitlements.filter(entitlement => entitlement.type === 'application/vnd.apple.mpegurl');
        const configureHLSOnly = supportsHLS() && hlsSources.length > 0; // make sure there is actually HLS
        const playSources = playConfig.entitlements
            .map(entitlement => {
                const emeOptions = getEmeOptionsFromEntitlement(entitlement);
                return {
                    src: entitlement.src,
                    type: entitlement.type,
                    ...emeOptions,
                };
            })
            .filter(playOption => {
                return (
                    (playOption.type === 'application/vnd.apple.mpegurl' && configureHLSOnly) ||
                    (playOption.type !== 'application/vnd.apple.mpegurl' && !configureHLSOnly)
                );
            });

        this.player.aspectRatio(playConfig.aspectRatio);
        this.player.src(playSources);

        if (initParams.fullscreen) {
            this.player.requestFullscreen();
        }

        if (!configureHLSOnly) {
            // non HLS only needs the text tracks
            playConfig.subtitles.forEach(track => {
                this.player.addRemoteTextTrack({
                    kind: track.kind,
                    src: track.src,
                    srclang: track.srclang,
                    label: track.label,
                    enabled: track.srclang === playConfig.subtitleLocale,
                });
            });
        }
    }

    setPoster(posterUrl: string) {
        this.player.poster(posterUrl);
    }

    destroy() {
        if (this.player) {
            if (false === this.player.ended()) {
                this.player.pause();
                // only if we have not already caught the 'ended' event
                // Be aware that the `stopped` emit also send along all kinds of info, so call _before_ disposing player
                this.playerLoggerService.onStop();
            }

            this.player.dispose();
        }

        this.playerLoggerService.destroy();
        this.player = null;
    }

    getPlayer(): any {
        return this.player;
    }

    private bindEvents() {
        this.player.on('error', () => {
            this.playerLoggerService.onError(JSON.stringify(this.player.error()));
        });

        this.player.on('playing', () => {
            if (this.firstPlayingEvent) {
                this.firstPlayingEvent = false;
                if (this.articlePlayConfig.currentTime > 0) {
                    this.player.currentTime(this.articlePlayConfig.currentTime);
                }
            }
            this.checkSelectedTracks();
            this.playerLoggerService.onPlaying();
        });

        this.player.on('pause', () => {
            this.checkSelectedTracks();
            if (this.player.paused() && !this.player.ended()) {
                this.playerLoggerService.onPause();
            }
        });

        this.player.on('ended', () => {
            this.checkSelectedTracks();
            this.playerLoggerService.onStop();
        });

        this.player.on('timeupdate', () => {
            this.checkSelectedTracks();

            this.playerLoggerService.onCurrentTimeUpdated(this.player.currentTime() || 0);
        });

        this.player.on('durationchange', () => {
            this.checkSelectedTracks();
            this.playerLoggerService.onDurationUpdated(this.player.duration());
        });

        this.player.on('loadedmetadata', () => {
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
        });
    }

    private checkSelectedTracks() {
        if (!this.metadataLoaded) {
            return false;
        }

        let selectedAudioTrack = '';
        let selectedTextTrack = '';

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

        this.playerLoggerService.updateProperties({
            textTrack: selectedTextTrack,
            audioTrack: selectedAudioTrack,
        });

        if (this.currentTextTrack !== null && this.currentTextTrack !== selectedTextTrack) {
            this.playerLoggerService.onTextTrackChanged(selectedTextTrack);
        }

        this.currentTextTrack = selectedTextTrack;

        if (this.currentAudioTrack !== null && this.currentAudioTrack !== selectedAudioTrack) {
            this.playerLoggerService.onAudioTrackChanged(selectedAudioTrack);
        }
        this.currentAudioTrack = selectedAudioTrack;
    }

    private setDefaultTextTrack() {
        if (this.articlePlayConfig.subtitleLocale) {
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
                if (trackLocale === this.articlePlayConfig.subtitleLocale.toLowerCase() && tracks[i].kind === 'subtitles') {
                    tracks[i].mode = 'showing';
                    break;
                }
            }
        }
    }

    private setDefaultAudioTrack() {
        if (this.articlePlayConfig.audioLocale) {
            const audioTracks = this.player.audioTracks();
            for (let i = 0; i < audioTracks.length; i++) {
                const trackLocale = getISO2Locale(audioTracks[i].language);
                if (
                    (this.articlePlayConfig.audioLocale && trackLocale === this.articlePlayConfig.audioLocale.toLowerCase()) ||
                    (this.articlePlayConfig.audioLocale === '' && i === 0)
                ) {
                    audioTracks[i].enabled = true;
                    break;
                }
            }
        }
    }
}
