declare const videojs: any;

const PlaybackRateMenuButton = videojs.getComponent('playbackRateMenuButton');

export class CustomPlaybackRateMenuButton extends PlaybackRateMenuButton {
    constructor(player: any, options: any) {
        super(player);
    }

    createEl() {
        const el = super.createEl();

        el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="vjs-playback-rate-svg">
            <path d="M0 0h24v24H0z" fill="none"/>
            <path class="vjs-custom-svg-color" d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44zm-9.79 6.84a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z"/></svg>`;

        return el;
    }
}
