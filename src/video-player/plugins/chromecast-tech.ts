import {ChromecastSender} from '../../chromecast/chromecast-sender';
import {ChromecastConnectionInfo} from '../../models/cast-info';
import {getNativeLanguage} from '../../utils/locale';

export function createChromecastTechPlugin(videojsInstance: any, castSender: ChromecastSender) {
    const Tech = videojsInstance.getComponent('Tech');
    const dom = videojsInstance.dom || videojsInstance;

    console.log('createChromecastTechPlugin');

    const initPromise = castSender.init();

    class ChromecastTech extends Tech {
        private connectionInfo: ChromecastConnectionInfo = {
            available: false,
            connected: false,
            friendlyName: '',
        };
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

                castSender.setOnConnectedListener(info => {
                    console.log('onCon', info);
                    this.connectionInfo = {
                        ...this.connectionInfo,
                        connected: info.connected,
                        friendlyName: info.friendlyName,
                    };

                    if (this.didPlay && !info.connected) {
                        this.didPlay = false;
                        this.trigger('ended');
                    }
                });

                castSender.setOnMediaInfoListener((state, info) => {
                    console.log('mediaInfo', state, this.source);

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
                        this.source = {src: 'restore', type: 'application/vnd.chromecast'};
                        this.triggerSourceset(this.source);
                        /// this.src({src: 'restore', type: 'application/vnd.chromecast'});
                        this.trigger('loadstart');
                        this.trigger('loadeddata');
                        this.trigger('loadedmetadata');
                        this.trigger('durationchange');

                        // regardless of play state, videojs always needs this for the 'first-play'
                        this.trigger('play');
                        this.trigger('playing');

                        if (this.myPlayer.playerState !== chrome.cast.media.PlayerState.PLAYING) {
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
                castSender.setOnCurrentTimeListener(currentTime => {
                    // console.log('onCurrentTime', currentTime);
                    if (currentTime + 1 > this.duration()) {
                        console.log('ENDED!!');
                        this.trigger('ended');
                    } else {
                        this.trigger('timeupdate');
                    }
                });

                castSender.setOnDurationListener(duration => {
                    this.trigger('durationchange');
                });

                castSender.setOnMediaTracksListener((audioTracks, textTracks) => {
                    console.log('tracksListener', audioTracks, textTracks);

                    Array.from(this.audioTracks()).forEach((track: any) => this.audioTracks.removeTrack(track));
                    audioTracks.forEach(audioTrack => {
                        const track = new videojsInstance.AudioTrack({
                            id: audioTrack.id,
                            kind: 'main',
                            label: getNativeLanguage(audioTrack.locale),
                            language: audioTrack.locale,
                            enabled: audioTrack.active,
                        });

                        this.audioTracks().addTrack(audioTrack);
                    });

                    textTracks.forEach(textTrack => {
                        Array.from(this.textTracks()).forEach((track: any) => this.textTracks.removeTrack(track));
                        const track = new videojsInstance.TextTrack({
                            label: getNativeLanguage(textTrack.locale),
                            kind: 'subtitles',
                            language: textTrack.locale,
                            mode: textTrack.active ? 'showing' : 'disabled',
                        });

                        this.textTracks.addTrack(track);
                    });
                });

                this.textTracks().addEventListener('change', () => this.handleTextTrackChange());
                this.audioTracks().addEventListener('change', () => this.handleAudioTrackChange());

                this.connectionInfo.available = true;

                this.triggerReady();
                console.log('castSender initialized');
            });
        }

        static canPlaySource(x: any) {
            console.log('canPlaySource', x);
            return castSender && castSender.isConnected();
        }

        static isSupported() {
            console.log('isSupported');
            return true;
        }

        static canPlayType(type: string) {
            // Return 'probably', 'maybe', or ''
            // return type === 'video/custom' ? 'probably' : '';
            console.log('canPlayType', type);
            return 'probably';
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
            console.log('pause', this.myPlayer.canPause);
            if (!this.paused() && this.myPlayer.canPause) {
                this.myPlayerController.playOrPause();
                console.log('playOrPause called');
            }
        }

        paused() {
            const isPaused =
                (this.myPlayer && this.myPlayer.isPaused) || this.ended() || (this.myPlayer && this.myPlayer.playerState === null);
            console.log('paused', isPaused);
            return isPaused;
        }

        setSource(source: any) {
            console.log('chromecast-tech.src', source);
            this.source = source;

            if (this.source && this.source.src === 'restore') {
                this.trigger('loadstart');
                this.trigger('loadeddata');
            } else {
                this.trigger('waiting');

                castSender
                    .castVideoByParams(source.playParams)
                    .then(() => {
                        console.log('castVideoByParams requested CC');

                        this.trigger('loadstart');
                        this.trigger('loadeddata');
                        this.trigger('play');
                        this.trigger('playing');
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
            console.log('duration: ', this.myPlayer.duration);
            return this.myPlayer.duration;
        }

        ended() {
            if (this.myPlayer.isConnected) {
                const session = castSender.getCastSession();
                if (session) {
                    const isEnded = session.idleReason === chrome.cast.media.IdleReason.FINISHED;
                    console.log('ended', isEnded);
                    return isEnded;
                }
            }
            console.log('ended - all else');
            return true;
        }

        buffered(): any {
            return undefined;
        }

        seekable() {
            // TODO Investigate if there's a way to detect
            // if the source is live, so that we can
            // possibly adjust the seekable `TimeRanges` accordingly.
            return this.videojs.createTimeRange(0, this.duration());
        }

        // 🧠 These are triggered when the user selects a new track
        handleTextTrackChange() {
            const selected = Array.from(this.textTracks()).find((t: any) => t.mode === 'showing');
            if (selected) {
                // Tell Chromecast receiver to switch subtitle
            }
        }

        handleAudioTrackChange() {
            const selected = Array.from(this.audioTracks()).find((t: any) => t.enabled);
            if (selected) {
                // Tell Chromecast receiver to switch audio
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
            console.log('readyState');
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
