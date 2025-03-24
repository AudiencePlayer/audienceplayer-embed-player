import {ChromecastSender} from '../../chromecast/chromecast-sender';
import {ChromecastConnectionInfo} from '../../models/cast-info';

export function createChromecastTechPlugin(videojsInstance: any) {
    const Tech = videojsInstance.getComponent('Tech');
    const dom = videojsInstance.dom || videojsInstance;
    let castSender: ChromecastSender = null; // used in instance of ChromecastTech and in static methods

    class ChromecastTech extends Tech {
        private connectionInfo: ChromecastConnectionInfo = {
            available: false,
            connected: false,
            friendlyName: '',
        };
        public featuresVolumeControl = false;
        public featuresMuteControl = false;
        public featuresFullscreenResize = false;

        constructor(options: any) {
            super(options);

            console.log('ChromecastTech', options);

            this.triggerReady();
        }

        static canPlaySource(x: any) {
            console.log('canPlaySource', x, castSender);
            return castSender && castSender.isConnected();
        }

        static isSupported() {
            console.log('isSupported');
            return true;
        }

        static canPlayType(type: string) {
            // Return 'probably', 'maybe', or ''
            //return type === 'video/custom' ? 'probably' : '';
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
        }

        pause() {
            console.log('pause');
        }

        paused() {
            console.log('paused');
            return false;
        }

        src(source: any) {
            console.log('src', source);
            this.source = source;
            this.trigger('loadstart');

            setTimeout(() => {
                this.trigger('play');
                this.trigger('playing');
            });
        }

        setCurrentTime(time: number) {}

        currentTime() {
            return 0;
        }

        duration() {
            return 10;
        }

        ended() {
            return false;
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

        setChromecast(cc: ChromecastSender) {
            console.log('setChromecast');
            castSender = cc;
            castSender.onConnectedListener(info => {
                console.log('onCon', info);
                this.connectionInfo = {
                    ...this.connectionInfo,
                    connected: info.connected,
                    friendlyName: info.friendlyName,
                };
            });

            castSender.onMediaInfoListener(state => {});

            castSender.onCurrentTimeListener((currenTime, duration) => {});

            this.connectionInfo.available = true;
        }
    }

    videojsInstance.registerTech('chromecast', ChromecastTech);
}
