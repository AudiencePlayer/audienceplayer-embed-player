import {getNativeLanguage} from '../../utils/locale';

declare const videojs: any;

const Component = videojs.getComponent('component');

// based on AudioTrackMenuItem
export class ChromecastButton extends Component {
    constructor(player: any, options: any) {
        super(player, options);

        this.addClass(`vjs-chromecast-button`);
    }
    createEl() {
        const el = super.createEl();

        el.innerHTML = `<google-cast-launcher></google-cast-launcher>`;

        return el;
    }
}
