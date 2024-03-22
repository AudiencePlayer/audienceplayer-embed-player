declare const videojs: any;

const Component = videojs.getComponent('Component');
const dom = videojs.dom || videojs;

export class Overlay extends Component {
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
