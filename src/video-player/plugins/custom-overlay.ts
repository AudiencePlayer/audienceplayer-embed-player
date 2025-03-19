export function createCustomOverlaykPlugin(videojsInstance: any) {
    const Component = videojsInstance.getComponent('Component');

    class CustomOverlay extends Component {
        createEl() {
            return this.options_.element;
        }
    }

    videojsInstance.registerComponent('customOverlay', CustomOverlay);
}
