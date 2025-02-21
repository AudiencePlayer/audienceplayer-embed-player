declare const videojs: any;

const ClickableComponent = videojs.getComponent('ClickableComponent');
const dom = videojs.dom || videojs;

export class SkipIntro extends ClickableComponent {
    constructor(player: any, options: any) {
        super(player, options);

        let timeoutHandle = 0;
        let insideIntro = false;
        let showing = false;
        let hiddenAfterTimeout = false;

        const show = () => {
            showing = true;
            this.removeClass('vjs-hidden');

            clearTimeout(timeoutHandle);
            // @ts-ignore timout handle
            timeoutHandle = setTimeout(function() {
                hide();
                hiddenAfterTimeout = true;
            }, 5000);
        };

        const hide = () => {
            showing = false;
            this.addClass('vjs-hidden');
        };

        const activeHandler = () => {
            hiddenAfterTimeout = false;
            if (insideIntro) {
                show();
            }
        };

        const inactiveHandler = () => {
            if (showing && !insideIntro) {
                hide();
            }
        };

        const showHandler = () => {
            insideIntro = true;

            if (!showing && !hiddenAfterTimeout) {
                show();
            }
        };

        const hideHandler = () => {
            insideIntro = false;
        };

        player.on('useractive', activeHandler);
        player.on('userinactive', inactiveHandler);

        this.on('show', showHandler);
        this.on('hide', hideHandler);

        this.on('dispose', function() {
            this.off('show', showHandler);
            this.off('hide', hideHandler);

            player.off('useractive', activeHandler);
            player.off('userinactive', inactiveHandler);
        });
    }

    createEl() {
        const el = super.createEl('div', {
            className: 'vjs-skip-intro-button vjs-hidden',
        });

        // Create the text label
        const text = document.createElement('span');
        text.className = 'vjs-skip-intro-button-text';
        text.innerText = this.options_.label || 'Skip';

        el.appendChild(text);

        return el;
    }

    handleClick(event: any) {
        this.trigger('skip');
    }
}
