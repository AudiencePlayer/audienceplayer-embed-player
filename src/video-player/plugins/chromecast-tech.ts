import {ChromecastSender} from '../../chromecast/chromecast-sender';
import {ChromecastConnectionInfo} from '../../models/cast-info';
import {getNativeLanguage} from '../../utils/locale';

export function createChromecastTechPlugin(videojsInstance: any, castSender: ChromecastSender) {
    const Tech = videojsInstance.getComponent('Tech');
    const dom = videojsInstance.dom || videojsInstance;

    console.log('createChromecastTechPlugin');

    const initPromise = castSender.init();

    class ChromecastTech extends Tech {
        private myPlayerController: cast.framework.RemotePlayerController;
        private myPlayer: cast.framework.RemotePlayer;
        private didPlay = false;

        public featuresVolumeControl = false;
        public featuresMuteControl = false;
        public featuresFullscreenResize = false;

        constructor(options: any) {
            super(options);

            console.log('ChromecastTech', options);

            initPromise.then(() => {
                this.myPlayer = castSender.getCastPlayer();
                this.myPlayerController = castSender.getCastPlayerController();

                castSender.setOnMediaInfoListener((state, info) => {
                    if (!this.source) {
                        console.log(
                            'Restoring session',
                            this.myPlayer.playerState,
                            this.myPlayer.isMediaLoaded,
                            this.myPlayer.duration,
                            info,
                            this.player
                        );
                        // @TODO do we also need a loadedmetadata in regular case
                        this.source = {src: 'restore', type: 'application/vnd.chromecast', playParams: {...info}};
                        this.triggerSourceset(this.source);
                        /// this.src({src: 'restore', type: 'application/vnd.chromecast'});
                        this.trigger('loadstart');

                        // regardless of play state, videojs always needs this for the 'first-play'
                        this.trigger('play');
                        this.trigger('playing');

                        if (this.myPlayer.playerState === null || this.myPlayer.playerState === chrome.cast.media.PlayerState.BUFFERING) {
                            this.trigger('waiting');
                        } else if (this.myPlayer.playerState !== chrome.cast.media.PlayerState.PLAYING) {
                            this.trigger('pause');
                            // timeupdate needed when in paused state and restoring
                            setTimeout(() => {
                                this.trigger('timeupdate');
                            }, 300);
                        }

                        this.trigger('timeupdate');
                    } else {
                        if (state === chrome.cast.media.PlayerState.PLAYING) {
                            this.didPlay = true;
                            this.trigger('play');
                            this.trigger('playing');
                        } else {
                            if (state === chrome.cast.media.PlayerState.PAUSED) {
                                this.trigger('pause');
                            } else if (state === chrome.cast.media.PlayerState.BUFFERING) {
                                this.trigger('waiting');
                            } else if ((state === chrome.cast.media.PlayerState.IDLE && this.ended()) || (state === null && this.didPlay)) {
                                this.didPlay = false;
                                this.trigger('ended');
                            }
                        }
                    }
                });

                /*
                this.trigger('loadeddata');
                        this.trigger('play');
                        this.trigger('playing');
                 */

                castSender.setOnCurrentTimeListener(currentTime => {
                    // console.log('onCurrentTime', currentTime);
                    if (this.duration() > 0 && currentTime + 1 > this.duration()) {
                        setTimeout(() => this.trigger('ended'), 500);
                    } else {
                        this.trigger('timeupdate');
                    }
                });

                castSender.setOnDurationListener(duration => {
                    this.trigger('durationchange');
                });

                castSender.setOnMediaTracksListener((audioTracks, textTracks) => {
                    Array.from(this.audioTracks()).forEach((track: any) => this.audioTracks().removeTrack(track));
                    audioTracks.forEach(audioTrack => {
                        const track = new videojsInstance.AudioTrack({
                            id: audioTrack.id,
                            kind: 'main',
                            label: getNativeLanguage(audioTrack.locale),
                            language: audioTrack.locale,
                            enabled: audioTrack.active,
                        });

                        this.audioTracks().addTrack(track);
                    });

                    textTracks.forEach(textTrack => {
                        Array.from(this.textTracks()).forEach((track: any) => this.textTracks().removeTrack(track));
                        const track = new videojsInstance.TextTrack({
                            tech: this,
                            label: getNativeLanguage(textTrack.locale),
                            kind: 'subtitles',
                            language: textTrack.locale,
                            mode: textTrack.active ? 'showing' : 'disabled',
                        });

                        this.textTracks().addTrack(track);
                    });
                });

                this.textTracks().addEventListener('change', () => this.handleTextTrackChange());
                this.audioTracks().addEventListener('change', () => this.handleAudioTrackChange());

                console.log('castSender initialized');

                this.triggerReady();
            });
        }

        static canPlaySource(x: any) {
            console.log('canPlaySource', castSender && castSender.isConnected());
            return castSender && castSender.isConnected();
        }

        static isSupported() {
            return true;
        }

        static canPlayType(type: string) {
            console.log('canPlayType', type);
            return type === 'application/vnd.chromecast' ? 'probably' : '';
        }

        createEl(type: any, props: any, attrs: any) {
            this.el_ = videojsInstance.dom.createEl('div', {
                className: 'vjs-tech chromecast',
            });

            return this.el_;
        }

        play() {
            console.log('play');
            if (this.paused()) {
                this.myPlayerController.playOrPause();
                console.log('playOrPause called');
            }
        }

        pause() {
            console.log('pause', this.myPlayer && this.myPlayer.canPause);
            if (!this.paused() && this.myPlayer && this.myPlayer.canPause) {
                this.myPlayerController.playOrPause();
                console.log('playOrPause called');
            }
        }

        paused() {
            const isPaused =
                (this.myPlayer && this.myPlayer.isPaused) || this.ended() || (this.myPlayer && this.myPlayer.playerState === null);
            return isPaused;
        }

        setSource(source: any) {
            console.log('chromecast-tech.src', source);
            this.source = source;

            if (this.source && this.source.src === 'restore') {
                this.trigger('loadstart');
            } else {
                this.trigger('loadstart');
                castSender
                    .castVideoByParams(source.playParams)
                    .then(() => {
                        this.trigger('waiting');
                        console.log('castVideoByParams requested CC');
                    })
                    .catch(err => console.log(err));
            }
        }

        currentSrc() {
            return this.source ? this.source.src || '' : '';
        }

        setCurrentTime(newTime: number) {
            console.log('newTime', newTime);

            const duration = this.duration();

            if (newTime > duration || !this.myPlayer || !this.myPlayer.canSeek) {
                return;
            }
            // Seeking to any place within (approximately) 1 second of the end of the item
            // causes the Video.js player to get stuck in a BUFFERING state. To work around
            // this, we only allow seeking to within 1 second of the end of an item.
            this.myPlayer.currentTime = Math.min(duration - 1, newTime);

            this.myPlayer.currentTime = newTime;
            this.myPlayerController.seek();
        }

        currentTime() {
            if (!this.myPlayer) {
                return 0;
            }
            return this.myPlayer.currentTime;
        }

        duration() {
            if (!this.myPlayer) {
                console.log('duration call, but no player');
                return 0;
            }
            return this.myPlayer.duration;
        }

        ended() {
            if (!this.myPlayer) {
                return false;
            }
            if (this.myPlayer.isConnected) {
                if (this.myPlayer.playerState && this.myPlayer.playerState !== chrome.cast.media.PlayerState.IDLE) {
                    return false;
                }
                const session = castSender.getCastMediaSession();
                if (session) {
                    const isEnded = session.idleReason === chrome.cast.media.IdleReason.FINISHED;
                    console.log('ended - check via session', isEnded);
                    return isEnded;
                }
            }
            return true;
        }

        buffered(): any {
            return undefined;
        }

        seekable() {
            // TODO If the source is live adjust the seekable `TimeRanges` accordingly.
            return this.videojs.createTimeRange(0, this.duration());
        }

        handleTextTrackChange() {
            if (this.didPlay) {
                const selected: any = Array.from(this.textTracks()).find((t: any) => t.mode === 'showing');
                if (selected) {
                    castSender.setActiveTrackById(selected.id, 'TEXT');
                }
            }
        }

        handleAudioTrackChange() {
            if (this.didPlay) {
                const selected: any = Array.from(this.audioTracks()).find((t: any) => t.enabled);
                if (selected) {
                    castSender.setActiveTrackById(selected.id, 'AUDIO');
                }
            }
        }

        /**
         * Returns whether the native media controls should be shown (`true`) or hidden
         */
        controls() {
            return false;
        }

        playsinline() {
            return true;
        }

        supportsFullScreen() {
            return false;
        }

        setAutoplay() {
            // Not supported
        }

        playbackRate() {
            return 1;
        }

        setPlaybackRate() {
            // Not supported
        }

        preload() {
            // Not supported
        }

        load() {
            // Not supported
        }

        readyState() {
            if (
                !this.myPlayer ||
                (this.myPlayer && this.myPlayer.playerState === null) ||
                (this.myPlayer && this.myPlayer.playerState === chrome.cast.media.PlayerState.IDLE) ||
                (this.myPlayer && this.myPlayer.playerState === chrome.cast.media.PlayerState.BUFFERING)
            ) {
                return 0;
            }
            return 4;
        }

        volume() {
            return 1;
        }

        setVolume(volume: number) {
            // Set volume
        }

        muted() {
            return false;
        }

        setMuted(muted: boolean) {
            // Mute/unmute
        }

        dispose() {
            // Clean up anything your tech has created
            super.dispose();
        }
    }

    videojsInstance.registerTech('chromecast', ChromecastTech);
    console.log('registered chromecast tech');
}
