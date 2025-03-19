import {getNativeLanguage} from '../../utils/locale';

export function createSubtitlesButtonPlugin(videojsInstance: any) {
    const SubtitlesButton = videojsInstance.getComponent('textTrackButton');
    const MenuItem = videojsInstance.getComponent('menuItem');
    const OffTextTrackMenuItem = videojsInstance.getComponent('offTextTrackMenuItem');

    // based on TextTrackMenuItem
    class CustomTextTrackMenuItem extends MenuItem {
        constructor(player: any, options: any) {
            const track = options.track;
            const tracks = player.textTracks();

            // Modify options for parent MenuItem class's init.
            options.label = getNativeLanguage(track.language || track.label) || 'Unknown';
            options.selected = track.mode === 'showing';
            super(player, options);
            this.track = track;
            // Determine the relevant kind(s) of tracks for this component and filter
            // out empty kinds.
            this.kinds = (options.kinds || [options.kind || this.track.kind]).filter(Boolean);
            const changeHandler = (...args: any) => {
                this.handleTracksChange.apply(this, args);
            };
            const selectedLanguageChangeHandler = (...args: any) => {
                this.handleSelectedLanguageChange.apply(this, args);
            };
            player.on(['loadstart', 'texttrackchange'], changeHandler);
            tracks.addEventListener('change', changeHandler);
            tracks.addEventListener('selectedlanguagechange', selectedLanguageChangeHandler);
            this.on('dispose', function() {
                player.off(['loadstart', 'texttrackchange'], changeHandler);
                tracks.removeEventListener('change', changeHandler);
                tracks.removeEventListener('selectedlanguagechange', selectedLanguageChangeHandler);
            });

            // iOS7 doesn't dispatch change events to TextTrackLists when an
            // associated track's mode changes. Without something like
            // Object.observe() (also not present on iOS7), it's not
            // possible to detect changes to the mode attribute and polyfill
            // the change event. As a poor substitute, we manually dispatch
            // change events whenever the controls modify the mode.
            if (tracks.onchange === undefined) {
                let event: any;
                this.on(['tap', 'click'], function() {
                    if (typeof window.Event !== 'object') {
                        // Android 2.3 throws an Illegal Constructor error for window.Event
                        try {
                            event = new window.Event('change');
                        } catch (err) {
                            // continue regardless of error
                        }
                    }
                    if (!event) {
                        event = document.createEvent('Event');
                        event.initEvent('change', true, true);
                    }
                    tracks.dispatchEvent(event);
                });
            }

            // set the default state based on current tracks
            this.handleTracksChange();
        }

        handleClick(event: any) {
            const referenceTrack = this.track;
            const tracks = this.player_.textTracks();
            super.handleClick(event);
            if (!tracks) {
                return;
            }
            for (let i = 0; i < tracks.length; i++) {
                const track = tracks[i];

                // If the track from the text tracks list is not of the right kind,
                // skip it. We do not want to affect tracks of incompatible kind(s).
                if (this.kinds.indexOf(track.kind) === -1) {
                    continue;
                }

                // If this text track is the component's track and it is not showing,
                // set it to showing.
                if (track === referenceTrack) {
                    if (track.mode !== 'showing') {
                        track.mode = 'showing';
                    }

                    // If this text track is not the component's track and it is not
                    // disabled, set it to disabled.
                } else if (track.mode !== 'disabled') {
                    track.mode = 'disabled';
                }
            }
        }

        handleTracksChange(event?: any) {
            const shouldBeSelected = this.track.mode === 'showing';

            // Prevent redundant selected() calls because they may cause
            // screen readers to read the appended control text unnecessarily
            if (shouldBeSelected !== this.isSelected_) {
                this.selected(shouldBeSelected);
            }
        }

        handleSelectedLanguageChange(event: any) {
            if (this.track.mode === 'showing') {
                const selectedLanguage = this.player_.cache_.selectedLanguage;

                // Don't replace the kind of track across the same language
                if (
                    selectedLanguage &&
                    selectedLanguage.enabled &&
                    selectedLanguage.language === this.track.language &&
                    selectedLanguage.kind !== this.track.kind
                ) {
                    return;
                }
                this.player_.cache_.selectedLanguage = {
                    enabled: true,
                    language: this.track.language,
                    kind: this.track.kind,
                };
            }
        }

        dispose() {
            // remove reference to track object on dispose
            this.track = null;
            super.dispose();
        }
    }

    class CustomTextTrackButton extends SubtitlesButton {
        constructor(player: any, options: any = {}) {
            options.tracks = player.textTracks();
            super(player, options);
        }

        createItems(items: any = [], TrackMenuItem = CustomTextTrackMenuItem) {
            // Label is an override for the [track] off label
            // USed to localise captions/subtitles
            let label;
            if (this.label_) {
                label = `${this.label_} off`;
            }
            // Add an OFF menu item to turn all tracks off
            items.push(
                new OffTextTrackMenuItem(this.player_, {
                    kinds: this.kinds_,
                    kind: this.kind_,
                    label,
                })
            );
            this.hideThreshold_ += 1;
            const tracks = this.player_.textTracks();
            if (!Array.isArray(this.kinds_)) {
                this.kinds_ = [this.kind_];
            }
            for (let i = 0; i < tracks.length; i++) {
                const track = tracks[i];

                // only add tracks that are of an appropriate kind and have a label
                if (this.kinds_.indexOf(track.kind) > -1) {
                    const item = new TrackMenuItem(this.player_, {
                        track,
                        kinds: this.kinds_,
                        kind: this.kind_,
                        // MenuItem is selectable
                        selectable: true,
                        // MenuItem is NOT multiSelectable (i.e. only one can be marked "selected" at a time)
                        multiSelectable: false,
                    });
                    item.addClass(`vjs-${track.kind}-menu-item`);
                    items.push(item);
                }
            }
            return items;
        }
    }

    class CustomSubtitlesButton extends CustomTextTrackButton {
        constructor(player: any, options: any, ready: any) {
            super(player, options);
            this.setIcon('subtitles');
        }

        buildCSSClass() {
            return `vjs-subtitles-button ${super.buildCSSClass()}`;
        }

        buildWrapperCSSClass() {
            1;
            return `vjs-subtitles-button ${super.buildWrapperCSSClass()}`;
        }
    }

    CustomSubtitlesButton.prototype.kind_ = 'subtitles';

    videojsInstance.registerComponent('customTextTrackButton', CustomTextTrackButton);
    videojsInstance.registerComponent('customSubtitlesButton', CustomSubtitlesButton);
}
