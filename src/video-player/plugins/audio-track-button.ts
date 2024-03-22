import {getNativeLanguage} from '../../utils/locale';

declare const videojs: any;

const AudioTrackButton = videojs.getComponent('audioTrackButton');
const MenuItem = videojs.getComponent('menuItem');

// based on AudioTrackMenuItem
class CustomAudioTrackMenuItem extends MenuItem {
    constructor(player: any, options: any) {
        const track = options.track;
        const tracks = player.audioTracks();

        // AP: Modify options for parent MenuItem class's init.
        options.label = getNativeLanguage(track.language || track.label) || 'Unknown';
        options.selected = track.enabled;

        super(player, options);
        this.track = track;
        this.addClass(`vjs-${track.kind}-menu-item`);
        const changeHandler = (...args: any) => {
            this.handleTracksChange.apply(this, args);
        };
        tracks.addEventListener('change', changeHandler);
        this.on('dispose', () => {
            tracks.removeEventListener('change', changeHandler);
        });
    }
    createEl(type: any, props: any, attrs: any) {
        const el = super.createEl(type, props, attrs);
        const parentSpan = el.querySelector('.vjs-menu-item-text');
        if (this.options_.track.kind === 'main-desc') {
            parentSpan.appendChild(
                super.createEl(
                    'span',
                    {
                        className: 'vjs-icon-placeholder',
                    },
                    {
                        'aria-hidden': true,
                    }
                )
            );
            parentSpan.appendChild(
                super.createEl('span', {
                    className: 'vjs-control-text',
                    textContent: ' ' + this.localize('Descriptions'),
                })
            );
        }
        return el;
    }

    handleClick(event: any) {
        super.handleClick(event);

        // the audio track list will automatically toggle other tracks
        // off for us.
        this.track.enabled = true;

        // when native audio tracks are used, we want to make sure that other tracks are turned off
        if (this.player_.tech_.featuresNativeAudioTracks) {
            const tracks = this.player_.audioTracks();
            for (let i = 0; i < tracks.length; i++) {
                const track = tracks[i];

                // skip the current track since we enabled it above
                if (track === this.track) {
                    continue;
                }
                track.enabled = track === this.track;
            }
        }
    }

    handleTracksChange(event: any) {
        this.selected(this.track.enabled);
    }
}

export class CustomAudioTrackButton extends AudioTrackButton {
    constructor(player: any, options: any) {
        super(player);
    }

    createItems(items: any = []) {
        // if there's only one audio track, there no point in showing it
        this.hideThreshold_ = 1;
        const tracks = this.player_.audioTracks();
        for (let i = 0; i < tracks.length; i++) {
            const track = tracks[i];
            items.push(
                new CustomAudioTrackMenuItem(this.player_, {
                    track,
                    // MenuItem is selectable
                    selectable: true,
                    // MenuItem is NOT multiSelectable (i.e. only one can be marked "selected" at a time)
                    multiSelectable: false,
                })
            );
        }
        return items;
    }
}
