/// <reference path="../../node_modules/@types/chromecast-caf-sender/index.d.ts" />

import {getNativeLanguage} from '../utils/locale';

interface TrackInfo {
    id: number;
    locale: string;
    active: boolean;
}

export class ChromecastControls {
    private currentStatus: chrome.cast.media.PlayerState;
    private playerController: cast.framework.RemotePlayerController;
    private player: cast.framework.RemotePlayer;
    private rootElement: HTMLElement;
    private totalDuration: number;
    private currentTime: number;

    constructor(player: cast.framework.RemotePlayer, controller: cast.framework.RemotePlayerController, selector?: string | HTMLElement) {
        this.player = player;
        this.playerController = controller;
        this.totalDuration = player.duration || 0;
        this.currentTime = player.currentTime || 0;
        this.currentStatus = player.playerState;
        this.createChromecastControlsTemplate(selector);
        this.bindEvents();
        this.setPlayButtonClass();
        this.bindEventsToControls();
        this.setProgressBarValues();
    }

    bindEvents() {
        this.playerController.addEventListener(cast.framework.RemotePlayerEventType.MEDIA_INFO_CHANGED, () => {
            if (this.rootElement && this.player.mediaInfo) {
                this.renderTracks();
            }
        });

        this.playerController.addEventListener(cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED, e => {
            if (this.rootElement) {
                this.currentTime = e.value;
                this.totalDuration = this.player.duration;
                this.setProgressBarValues();
            }
        });

        this.playerController.addEventListener(cast.framework.RemotePlayerEventType.PLAYER_STATE_CHANGED, e => {
            if (this.rootElement) {
                this.currentStatus = e.value;
                this.checkChromecastContainerVisibility();
                this.setPlayButtonClass();
                this.setProgressBarValues();
            }
        });

        this.checkChromecastContainerVisibility();
    }

    createChromecastControlsTemplate(selector?: string | HTMLElement) {
        const chromecastControlsTemplateString = `
        <div class="chromecast-controls video-js vjs-workinghover">
            <div class="vjs-control-bar">
                
                <button class="play-pause-button vjs-play-control vjs-control vjs-button vjs-paused" type="button" title="Play" aria-disabled="false">
                    <span class="vjs-icon-placeholder" aria-hidden="true"></span><span class="vjs-control-text" aria-live="polite">Play</span>
                </button>
                
               <div class="chromecast-controls__progress-bar">
                 <div class="chromecast-controls__progress-bar__current vjs-time-control"></div>
                 <div class="chromecast-controls__progress-bar-slider-container">
                    <input type="range"
                        value="0"
                        class="chromecast-controls__progress-bar__slider" 
                        min="0"
                        max="100"/>
                    <div class="chromecast-controls__progress-bar__slider-left"></div>
                </div>    
                 <div class="chromecast-controls__progress-bar__total vjs-time-control"></div>
               </div>
                
                <div class="vjs-subtitles-button vjs-menu-button vjs-menu-button-popup vjs-control vjs-button">
                    <button class="vjs-subtitles-button vjs-menu-button vjs-menu-button-popup vjs-button" type="button" aria-disabled="false" aria-haspopup="true" aria-expanded="false">
                        <span class="vjs-icon-placeholder" aria-hidden="true"></span>
                        <span class="vjs-control-text" aria-live="polite"></span>
                    </button>
                    <div class="vjs-menu"></div>
                </div>
                
                <div class="vjs-audio-button vjs-menu-button vjs-menu-button-popup vjs-control vjs-button">
                    <button class="vjs-audio-button vjs-menu-button vjs-menu-button-popup vjs-button" type="button" aria-disabled="false" title="Audio Track" aria-haspopup="true" aria-expanded="false">
                        <span class="vjs-icon-placeholder" aria-hidden="true"></span>
                        <span class="vjs-control-text" aria-live="polite">Audio Track</span>
                    </button>
                    <div class="vjs-menu"></div>
                </div>
                
                <div class="vjs-control vjs-button vjs-chromecast-button">
                    <google-cast-launcher></google-cast-launcher>
                </div>
           </div>
        </div>
        `;

        const element = !!selector ? (selector instanceof HTMLElement ? selector : document.querySelector(selector)) : document.body;
        element.insertAdjacentHTML('beforeend', chromecastControlsTemplateString);

        this.rootElement = element.querySelector('.chromecast-controls');
    }

    setPlayButtonClass() {
        const playAndPauseButton = this.getElement('.play-pause-button');
        if (this.currentStatus === chrome.cast.media.PlayerState.PAUSED) {
            playAndPauseButton.classList.replace('vjs-playing', 'vjs-paused');
        } else {
            playAndPauseButton.classList.replace('vjs-paused', 'vjs-playing');
        }
    }

    bindEventsToControls() {
        const playAndPauseButton = this.getElement('.play-pause-button');
        playAndPauseButton.addEventListener('click', () => this.playPause());

        this.bindEventsToMenu('.vjs-subtitles-button');
        this.bindEventsToMenu('.vjs-audio-button');

        this.getElement('.chromecast-controls__progress-bar__slider').addEventListener('input', event => {
            this.seek((event.target as HTMLProgressElement).value);
        });
    }

    bindEventsToMenu(buttonSelector: string) {
        const containerEl = this.getElement(`div${buttonSelector}`);
        const buttonEl = this.getElement(`button${buttonSelector}`);
        const menuEl = this.getElement(`${buttonSelector} .vjs-menu`);
        buttonEl.addEventListener('click', event => {
            if (!event.defaultPrevented) {
                this.toggleMenu(menuEl, containerEl);
            }
        });
        buttonEl.addEventListener('mouseenter', () => {
            containerEl.classList.add('vjs-hover');
        });
        containerEl.addEventListener('mouseleave', () => {
            containerEl.classList.remove('vjs-hover');
        });
        menuEl.addEventListener('blur', () => {
            this.toggleMenu(menuEl, containerEl);
        });
    }

    renderTracks() {
        const sessionMediaInfo = cast.framework.CastContext.getInstance()
            .getCurrentSession()
            .getMediaSession();
        let audioTracks: TrackInfo[] = [];
        let textTracks: TrackInfo[] = [];

        if (this.player.mediaInfo && this.player.mediaInfo.tracks && sessionMediaInfo) {
            audioTracks = this.getTracksByType('AUDIO');
            textTracks = this.getTracksByType('TEXT');
        }

        if (sessionMediaInfo && sessionMediaInfo.media) {
            if (sessionMediaInfo.media.streamType === chrome.cast.media.StreamType.LIVE) {
                this.rootElement.classList.add('vjs-live');
            } else {
                this.rootElement.classList.remove('vjs-live');
            }
        }

        const trackButton = this.getElement('.vjs-subtitles-button.vjs-menu-button-popup');
        if (textTracks.length > 0) {
            trackButton.classList.remove('vjs-hidden');
        } else {
            trackButton.classList.add('vjs-hidden');
        }

        const audioButton = this.getElement('.vjs-audio-button.vjs-menu-button-popup');
        if (audioTracks.length > 0) {
            audioButton.classList.remove('vjs-hidden');
        } else {
            audioButton.classList.add('vjs-hidden');
        }

        const audioTracksContainerElement = this.getElement('.vjs-audio-button .vjs-menu');
        const textTracksContainerElement = this.getElement('.vjs-subtitles-button .vjs-menu');

        audioTracksContainerElement.innerHTML = '';
        if (audioTracks.length > 0) {
            audioTracksContainerElement.appendChild(this.getTracksList(audioTracks, 'AUDIO'));
        }

        textTracksContainerElement.innerHTML = '';
        if (textTracks.length > 0) {
            textTracksContainerElement.appendChild(this.getTracksList(textTracks, 'TEXT'));
        }
    }

    getTracksList(tracks: TrackInfo[], type: string) {
        const tracksListElement = document.createElement('ul');
        tracksListElement.classList.add('vjs-menu-content');
        tracksListElement.addEventListener('click', event => this.setActiveTrack(event, type === 'AUDIO' ? 'AUDIO' : 'TEXT'));
        tracks.forEach(track => {
            const listItemElement = document.createElement('li');
            listItemElement.classList.add('vjs-menu-item');
            if (track.active) {
                listItemElement.classList.add('vjs-selected');
            } else {
                listItemElement.classList.remove('vjs-selected');
            }
            listItemElement.innerText = getNativeLanguage(track.locale);
            listItemElement.value = track.id;
            tracksListElement.appendChild(listItemElement);
        });
        return tracksListElement;
    }

    getActiveTracksByType(type: string) {
        return this.getTracksByType(type)
            .filter(track => track.active)
            .map(track => +track.id);
    }

    getTracksByType(type: string) {
        const sessionMediaInfo = cast.framework.CastContext.getInstance()
            .getCurrentSession()
            .getMediaSession();
        return this.player.mediaInfo.tracks
            .filter(track => track.type === type)
            .map(track => ({
                id: track.trackId,
                locale: track.language,
                active: sessionMediaInfo.activeTrackIds && sessionMediaInfo.activeTrackIds.indexOf(track.trackId) !== -1,
            }));
    }

    getTransformedDurationValue(value: number) {
        const hours = Math.floor(value / 3600);
        const minutes = Math.floor((value - hours * 3600) / 60);
        const seconds = Math.round(value - hours * 3600 - minutes * 60);
        let result = '';
        if (!value && value === 0) {
            return '-';
        }
        if (hours > 0) {
            result = hours + ':';
            if (minutes < 10) {
                result += '0';
            }
        }
        result += minutes + ':';
        if (seconds < 10) {
            result += '0';
        }
        return result + seconds;
    }

    setProgressBarValues() {
        if (this.rootElement) {
            const currentTimeElement = this.getElement('.chromecast-controls__progress-bar__current') as HTMLElement;
            const totalTimeElement = this.getElement('.chromecast-controls__progress-bar__total') as HTMLElement;
            const progressBarElement = this.getElement('.chromecast-controls__progress-bar__slider') as HTMLProgressElement;
            const progressLeftEl = this.getElement('.chromecast-controls__progress-bar__slider-left') as HTMLElement;

            currentTimeElement.innerText = this.getTransformedDurationValue(this.currentTime);
            totalTimeElement.innerText = this.getTransformedDurationValue(this.totalDuration);
            progressBarElement.max = this.totalDuration;
            progressBarElement.value = this.currentTime;

            progressLeftEl.style.width = (progressBarElement.offsetWidth * this.currentTime) / this.totalDuration + 'px';
        }
    }

    checkChromecastContainerVisibility() {
        if (this.currentStatus === chrome.cast.media.PlayerState.IDLE) {
            this.rootElement.classList.add('chromecast-controls--idle');
        } else {
            this.rootElement.classList.remove('chromecast-controls--idle');
        }
    }

    playPause() {
        if (this.player && this.player.isConnected) {
            this.playerController.playOrPause();
        }
    }

    seek(newTime: number) {
        if (this.player && this.player.isConnected) {
            this.player.currentTime = newTime;
            this.playerController.seek();
        }
    }

    stop() {
        if (this.player && this.player.isConnected) {
            this.playerController.stop();
        }
    }

    setActiveTrack(event: MouseEvent, type: string) {
        if (event.target instanceof HTMLLIElement && event.target.nodeName === 'LI') {
            event.preventDefault();
            event.stopPropagation();
            const selectedTrackId = +event.target.value;
            const newActiveTracks = this.getActiveTracksByType(type === 'AUDIO' ? 'TEXT' : 'AUDIO');
            const activeTracksOfType = this.getActiveTracksByType(type);
            const index = activeTracksOfType.indexOf(selectedTrackId);
            if (type === 'AUDIO' || (type === 'TEXT' && index === -1)) {
                newActiveTracks.push(selectedTrackId);
            }
            this.setActiveTracks(newActiveTracks, type);
        }
    }

    setActiveTracks(trackIds: number[], type: string) {
        if (this.player && this.player.isConnected) {
            const media = cast.framework.CastContext.getInstance()
                .getCurrentSession()
                .getMediaSession();
            const tracksInfoRequest = new chrome.cast.media.EditTracksInfoRequest(trackIds);
            media.editTracksInfo(
                tracksInfoRequest,
                () => {
                    this.toggleMenu(
                        this.getElement(type === 'AUDIO' ? '.vjs-audio-button .vjs-menu' : '.vjs-subtitles-button .vjs-menu'),
                        this.getElement(type === 'AUDIO' ? 'div.vjs-audio-button' : 'div.vjs-subtitles-button')
                    );
                },
                (error: chrome.cast.Error) => console.error('ChromeCast', error)
            );
        }
    }

    toggleMenu(menuEl: HTMLElement, containerEl: HTMLElement) {
        if (menuEl.classList.contains('vjs-lock-showing') || containerEl.classList.contains('vjs-hover')) {
            menuEl.classList.remove('vjs-lock-showing');
            menuEl.removeAttribute('tabindex');
            containerEl.classList.remove('vjs-hover');
        } else {
            menuEl.classList.add('vjs-lock-showing');
            menuEl.setAttribute('tabindex', '-1');
            menuEl.focus();
        }
    }

    getElement(selector: string) {
        return this.rootElement.querySelector(selector) as HTMLElement;
    }
}
