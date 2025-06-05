import {ChromecastSender} from '../../chromecast/chromecast-sender';
import {getNativeLanguage} from '../../utils/locale';
import {ChromecastPlayInfo, TrackInfo} from '../../models/cast-info';

export function createChromecastTechPlugin(videojsInstance: any, castSender: ChromecastSender) {
    const Tech = videojsInstance.getComponent('Tech');
    const dom = videojsInstance.dom || videojsInstance;

    console.log('createChromecastTechPlugin');

    class ChromecastTech extends Tech {
        private myPlayerController: cast.framework.RemotePlayerController = null;
        private myPlayer: cast.framework.RemotePlayer = null;
        private lastCurrentTime = 0;
        private didEnd = false;

        public featuresVolumeControl = false;
        public featuresMuteControl = false;
        public featuresFullscreenResize = false;

        constructor(options: any) {
            super(options);

            console.log('ChromecastTech', options);

            castSender.init().then(() => {
                this.myPlayer = castSender.getCastPlayer();
                this.myPlayerController = castSender.getCastPlayerController();

                castSender.addOnPlayStateListener(this.onPlayStateListener);
                castSender.addOnCurrentTimeListener(this.onCurrentTimeListener);
                castSender.addOnDurationListener(this.onDurationListener);
                castSender.addOnMediaTracksListener(this.onMediaTracksListener);

                this.textTracks().addEventListener('change', () => this.handleTextTrackChange());
                this.audioTracks().addEventListener('change', () => this.handleAudioTrackChange());

                console.log('castSender initialized');

                this.triggerReady();
            });
        }

        static canPlaySource(x: any) {
            return !!x && castSender && castSender.isConnected();
        }

        static isSupported() {
            return true;
        }

        static canPlayType(type: string) {
            return type === 'application/vnd.chromecast' ? 'probably' : '';
        }

        createEl(type: any, props: any, attrs: any) {
            this.el_ = videojsInstance.dom.createEl('div', {
                className: 'vjs-tech chromecast',
            });

            /*
            this._castingMessageEl = videojs.dom.createEl('div', {
    className: 'vjs-casting-overlay',
    innerHTML: 'Casting to device...'
  });

  el.appendChild(this._castingMessageEl);
             */

            return this.el_;
        }

        play() {
            if (this.myPlayerController && this.myPlayer && this.myPlayer.isConnected) {
                if (this.ended()) {
                    this.setCurrentTime(0);
                    this.myPlayerController.playOrPause();
                } else if (this.paused()) {
                    this.myPlayerController.playOrPause();
                }
            }
        }

        pause() {
            if (this.myPlayerController && this.myPlayer && this.myPlayer.isConnected) {
                if (!this.paused() && this.myPlayer.canPause) {
                    this.myPlayerController.playOrPause();
                }
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
            this.didEnd = false;

            if (!this.source) {
                return;
            }

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
            if (this.myPlayerController && this.myPlayer && this.myPlayer.isConnected && this.myPlayer.canSeek) {
                const duration = this.duration();

                if (newTime > duration) {
                    console.log('Skip seek ', newTime, duration);
                    return;
                }
                // Seeking to any place within (approximately) 1 second of the end of the item
                // causes the Video.js player to get stuck in a BUFFERING state. To work around
                // this, we only allow seeking to within 1 second of the end of an item.
                this.myPlayer.currentTime = Math.min(duration - 1, Math.floor(newTime));
                this.myPlayerController.seek();
            } else {
                console.log('Can not seek');
            }
        }

        currentTime() {
            return this.lastCurrentTime;
        }

        duration() {
            if (!this.myPlayer) {
                console.log('duration call, but no player');
                return NaN;
            }
            // console.log('duration', this.myPlayer.duration);
            return this.myPlayer.duration === 0 ? NaN : this.myPlayer.duration;
        }

        ended() {
            return this.didEnd;
        }

        buffered(): any {
            return undefined;
        }

        seekable() {
            // TODO If the source is live adjust the seekable `TimeRanges` accordingly.
            return this.videojs.createTimeRange(0, this.duration());
        }

        handleTextTrackChange() {
            if (this.myPlayer && this.myPlayer.isConnected) {
                const selected: any = Array.from(this.textTracks()).find((t: any) => t.mode === 'showing');
                if (selected) {
                    castSender.setActiveTrackById(selected.id, 'TEXT');
                }
            }
        }

        handleAudioTrackChange() {
            if (this.myPlayer && this.myPlayer.isConnected) {
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
            console.log('dispose');
            castSender.removeOnPlayStateListener(this.onPlayStateListener);
            castSender.removeOnCurrentTimeListener(this.onCurrentTimeListener);
            castSender.removeOnDurationListener(this.onDurationListener);
            castSender.removeOnMediaTracksListener(this.onMediaTracksListener);

            this.textTracks().removeEventListener('change');
            this.audioTracks().removeEventListener('change');

            this.myPlayerController = null;
            this.myPlayer = null;
            this.source = null;
            this.didEnd = false;

            super.dispose();
        }

        private onPlayStateListener = (state: chrome.cast.media.PlayerState, info: ChromecastPlayInfo) => {
            if (!this.source) {
                if (state === chrome.cast.media.PlayerState.IDLE || state === null) {
                    console.log('No source, but idle - not restoring session');
                    return;
                }
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
                this.didEnd = false;
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
                console.log(state + ' currentSrc', this.currentSrc());
                if (state === chrome.cast.media.PlayerState.PLAYING) {
                    this.trigger('play');
                    this.trigger('playing');
                } else if (state === chrome.cast.media.PlayerState.PAUSED) {
                    this.trigger('pause');
                } else if (state === chrome.cast.media.PlayerState.BUFFERING) {
                    this.trigger('waiting');
                }
            }
        };
        private onCurrentTimeListener = (currentTime: number) => {
            this.lastCurrentTime = currentTime;
            if (this.duration() > 0 && currentTime + 1 > this.duration()) {
                this.didEnd = true;
                this.trigger('ended');
            }
            this.trigger('timeupdate');
        };

        private onDurationListener = (duration: number) => {
            this.trigger('durationchange');
        };

        private onMediaTracksListener = (audioTracks: TrackInfo[], textTracks: TrackInfo[]) => {
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
        };
    }

    videojsInstance.registerTech('chromecast', ChromecastTech);
    console.log('registered chromecast tech');
}
