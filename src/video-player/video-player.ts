import {PlayerOptions} from '../models/player-options';
import {ArticlePlayConfig} from '../models/play-config';
import {willPlayHls} from '../utils/platform';
import {PlayerLoggerService} from '../logging/player-logger-service';
import {PlayerDeviceTypes} from "../models/player";

declare const videojs: any;

export class VideoPlayer {
    private player: any;
    private playerLoggerService: PlayerLoggerService;
    private articlePlayConfig: ArticlePlayConfig;
    private firstPlayingEvent: boolean;
    private currentTextTrack: string;
    private currentAudioTrack: string;
    private metadataLoaded: boolean;

    constructor() {
        this.playerLoggerService = new PlayerLoggerService();
    }

    init(selector: string | HTMLElement, baseUrl: string, projectId: number, options: PlayerOptions) {
        this.destroy();
        this.playerLoggerService.init(baseUrl, projectId);

        const videoContainer = selector instanceof Element ? selector : document.querySelector(selector);

        const videoElement = document.createElement('video');
        videoElement.setAttribute('class', ['video-js', 'vjs-default-skin'].join(' '));
        videoElement.setAttribute('tabIndex', '0');
        videoElement.setAttribute('width', '100%');
        videoElement.setAttribute('height', '100%');

        videoContainer.appendChild(videoElement);

        const playOptions = {
            fluid: true,
            autoplay: true,
            controls: true,
            controlBar: {
                pictureInPictureToggle: false,
                currentTimeDisplay: true,
                durationDisplay: true,
                timeDivider: false,
                skipButtons: {
                    forward: 5,
                },
                // order of elements:
                children: [
                    'playToggle',
                    'volumeMenuButton',
                    'currentTimeDisplay',
                    //"timeDivider",
                    'progressControl',
                    'durationDisplay',
                    'liveDisplay',
                    //"remainingTimeDisplay",
                    'customControlSpacer',
                    'playbackRateMenuButton',
                    'chaptersButton',
                    'descriptionsButton',
                    'subtitlesButton',
                    'captionsButton',
                    'audioTrackButton',
                    'fullscreenToggle',
                ],
            },
            aspectRatio: '16:9',
            html5: {
                vhs: {
                    // Try to use videojs-http-streaming
                    overrideNative: true,
                },
                nativeAudioTracks: false,
                nativeVideoTracks: false,
            },
            ...options,
        };

        console.log(playOptions);

        this.player = videojs(videoElement, playOptions);
        const vhs = this.player.tech().vhs;
        this.player.eme();
        this.bindEvents();
    }

    play(playConfig: ArticlePlayConfig, posterUrl: string, fullscreen: boolean) {

        this.articlePlayConfig = playConfig;

        this.playerLoggerService.onStart(
            playConfig.pulseToken,
            PlayerDeviceTypes.default,
            playConfig.localTimeDelta,
            true,
        );

        const hlsSources = playConfig.entitlements.filter(entitlement => entitlement.type === 'application/vnd.apple.mpegurl');
        const configureHLSOnly = willPlayHls() && hlsSources.length > 0; // make sure there is actually HLS
        const playSources = playConfig.entitlements
            .map(entitlement => {
                let protectionInfo = null;
                let keySystems: any = {};

                if (entitlement.protectionInfo) {
                    switch (entitlement.type) {
                        case 'application/dash+xml':
                            protectionInfo = entitlement.protectionInfo.find(p => p.type === 'Widevine');
                            if (protectionInfo) {
                                keySystems = {
                                    'com.widevine.alpha': protectionInfo.keyDeliveryUrl,
                                };
                            }
                            break;
                        case 'application/vnd.ms-sstr+xml':
                            protectionInfo = entitlement.protectionInfo.find(p => p.type === 'PlayReady');
                            if (protectionInfo) {
                                keySystems = {
                                    'com.microsoft.playready': protectionInfo.keyDeliveryUrl,
                                };
                            }
                            break;
                        case 'application/vnd.apple.mpegurl':
                            protectionInfo = entitlement.protectionInfo.find(p => p.type === 'FairPlay');
                            if (protectionInfo) {
                                keySystems = {
                                    'com.apple.fps.1_0': {
                                        certificateUri: protectionInfo.certificateUrl,
                                        licenseUri: protectionInfo.keyDeliveryUrl,
                                    },
                                };
                            } else {
                                protectionInfo = entitlement.protectionInfo.find(p => p.type === 'aes');
                                if (protectionInfo) {
                                    protectionInfo = null;
                                }
                            }
                            break;
                    }
                }

                const emeHeaders = protectionInfo
                    ? {
                          emeHeaders: {Authorization: protectionInfo.authenticationToken},
                          keySystems,
                      }
                    : {};

                return {
                    src: entitlement.src,
                    type: entitlement.type,
                    ...emeHeaders,
                };
            })
            .filter(playOption => {
                return (playOption.type === 'application/vnd.apple.mpegurl' && configureHLSOnly) || !configureHLSOnly;
            });

        console.log(playSources);
        this.player.src(playSources);

        if (fullscreen) {
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

    destroy() {
        if (this.player) {
            if (false === this.player.ended()) {
                // only if we have not already caught the 'ended' event
                // Be aware that the `stopped` emit also send along all kinds of info, so call _before_ disposing player
                this.playerLoggerService.onStop();
            }

            this.player.dispose();
            this.player = null;
        }
    }

    private bindEvents() {
        // same trick as azure media player; set label to language
        this.player.on('loadeddata', () => {
            const audioTracks = this.player.audioTracks();

            for (let i = 0; i < audioTracks.length; i++) {
                const element = audioTracks[i];
                element.label = element.language;
            }
        });

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
            // this.stopped.emit(); @TODO VideoPlayerStopped
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
                if (tracks[i].language === this.articlePlayConfig.subtitleLocale.toLowerCase() && tracks[i].kind === 'subtitles') {
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
                if (
                    (this.articlePlayConfig.audioLocale && audioTracks[i].language === this.articlePlayConfig.audioLocale.toLowerCase()) ||
                    (this.articlePlayConfig.audioLocale === '' && i === 0)
                ) {
                    audioTracks[i].enabled = true;
                    break;
                }
            }
        }
    }
}
