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
        private myPlayingState = false;

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
                });

                castSender.setOnMediaInfoListener(state => {
                    console.log('mediaInfo', state, this.source);
                    const states = chrome.cast.media.PlayerState;
                    if (state === states.PLAYING) {
                        this.myPlayingState = true;
                        this.trigger('playing');
                    } else {
                        this.myPlayingState = false;
                        if (state === states.PAUSED) {
                            this.trigger('paused');
                        } else if (state === states.BUFFERING) {
                            this.trigger('waiting');
                        }
                    }
                });
                castSender.setOnCurrentTimeListener(currentTime => {
                    console.log('onCurrentTime', currentTime);
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
                    console.log('mediaLoaded', audioTracks, textTracks);

                    if (!this.source) {
                        console.log('No source, restoring session');
                        // @TODO do we also need a loadedmetadata in regular case
                        this.source = {src: 'restore session', type: 'application/vnd.chromecast'}; // @TODO
                        this.trigger('loadstart');
                        this.trigger('loadedmetadata');
                        this.trigger('durationchange');
                        this.trigger('play');
                    }

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
            console.log('chromecast-tech.src', source.playParams);
            this.source = source;

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
                return 0;
            }
            return this.myPlayer.duration;
        }

        ended() {
            const session = castSender.getCastSession();
            return session ? session.idleReason === chrome.cast.media.IdleReason.FINISHED : false;
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
