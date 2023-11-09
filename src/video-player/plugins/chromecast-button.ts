declare const videojs: any;

const Component = videojs.getComponent('component');

export class ChromecastButton extends Component {
    constructor(player: any, options: any) {
        super(player, options);
    }
    createEl() {
        const el = super.createEl();
        const castEl = (document as any).createElement('button', 'google-cast-button');
        castEl.className = 'vjs-chromecast-button';
        el.appendChild(castEl);

        return el;
    }
}
