export function createChromecastButtonPlugin(videojsInstance: any) {
    const Component = videojsInstance.getComponent('component');

    const singletonCastElement = (document as any).createElement('google-cast-launcher');
    singletonCastElement.className = 'vjs-chromecast-button';

    class ChromecastButton extends Component {
        constructor(player: any, options: any) {
            super(player, options);
        }
        createEl() {
            console.log('ChromecastButton.createEl');
            const el = super.createEl();
            el.appendChild(singletonCastElement);

            return el;
        }
    }

    videojsInstance.registerComponent('chromecastButton', ChromecastButton);
}
