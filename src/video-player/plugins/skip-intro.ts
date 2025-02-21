declare const videojs: any;

const ClickableComponent = videojs.getComponent('ClickableComponent');
const dom = videojs.dom || videojs;

export class SkipIntro extends ClickableComponent {
    constructor(player: any, options: any) {
        super(player, options);

        let timeoutHandle = 0;
        let insideIntro = false;
        let userActive = false;
        let showing = false;
        let firstShowWithTimeout = false;

        const show = () => {
            if (!showing) {
                showing = true;
                this.removeClass('vjs-hidden');
            }
        };

        const hide = () => {
            if (showing) {
                showing = false;
                this.addClass('vjs-hidden');
            }
        };

        const showWithTimeout = () => {
            firstShowWithTimeout = true;
            show();
            clearTimeout(timeoutHandle);
            // @ts-ignore timout handle
            timeoutHandle = setTimeout(function() {
                hide();
                timeoutHandle = 0;
            }, 10000);
        };

        const activeHandler = () => {
            userActive = true;
            if (insideIntro) {
                show();
            }
        };

        const inactiveHandler = () => {
            userActive = false;
            if (timeoutHandle === 0) {
                hide();
            }
        };

        const showHandler = () => {
            insideIntro = true;

            if (!firstShowWithTimeout) {
                showWithTimeout();
            }
        };

        const hideHandler = () => {
            insideIntro = false;
            firstShowWithTimeout = false;
            hide();
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
