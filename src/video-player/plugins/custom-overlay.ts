declare const videojs: any;

const Component = videojs.getComponent('Component');

export class CustomOverlay extends Component {
    createEl() {
        return this.options_.element;
    }
}
