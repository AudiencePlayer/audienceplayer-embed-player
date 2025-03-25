export function createOverlayPlugin(videojsInstance: any) {
    const Component = videojsInstance.getComponent('Component');
    const dom = videojsInstance.dom || videojsInstance;

    class Overlay extends Component {
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

    videojsInstance.registerComponent('overlay', Overlay);
}
