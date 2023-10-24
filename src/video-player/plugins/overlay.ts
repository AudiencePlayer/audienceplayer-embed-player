declare const videojs: any;

const Component = videojs.getComponent('Component');
const dom = videojs.dom || videojs;

export class Overlay extends Component {
    constructor(player: any, options: any) {
        super(player, options);

        if (options.element) {
            player.on('useractive', () => {
                this.show();
            });

            player.on('userinactive', () => {
                this.hide();
            });
        }
    }

    createEl() {
        const el = dom.createEl('div', {
            className: `vjs-overlay`,
        });

        if (this.options_.element) {
            el.appendChild(this.options_.element.cloneNode(true));
        }

        return el;
    }
}
