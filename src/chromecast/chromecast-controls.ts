import RemotePlayerController = cast.framework.RemotePlayerController;
import PlayerState = chrome.cast.media.PlayerState;
import RemotePlayer = cast.framework.RemotePlayer;
import Track = chrome.cast.media.Track;

interface TrackInfo {
    id: number;
    locale: string;
    active: boolean;
}

export class ChromecastControls {
    private currentStatus: PlayerState;
    private playerController: RemotePlayerController;
    private player: RemotePlayer;
    private rootElement: HTMLElement;
    private controlInitialized: boolean;
    private totalDuration: number;
    private currentTime: number;

    constructor(player: RemotePlayer, controller: RemotePlayerController, selector: string) {
        this.player = player;
        this.playerController = controller;
        this.rootElement = null;
        this.controlInitialized = false;
        this.totalDuration = player.duration || 0;
        this.currentTime = player.currentTime || 0;
        this.currentStatus = player.playerState;
        this.createChromecastControlsTemplate(selector);
        this.bindEvents();
        this.setPlayButtonClass();
        this.bindEventsToControls();
        this.setProgressBarValues();
        this.setTitle();
    }

    bindEvents() {
        this.playerController.addEventListener(cast.framework.RemotePlayerEventType.MEDIA_INFO_CHANGED, () => {
            if (this.rootElement && this.player.mediaInfo) {
                this.renderTracks();
                this.renderTracksButton();
                this.setTitle();
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

    createChromecastControlsTemplate(selector: string) {
        const chromecastControlsTemplateString = `
            <div class="chromecast-controls">
               <div class="chromecast-controls__title"></div>
               <div class="chromecast-controls__progress-bar">
                 <div class="chromecast-controls__progress-bar__current"></div>
                 <input type="range"
                        value="0"
                        class="chromecast-controls__progress-bar__slider" 
                        min="0"
                        max="100"/>
                 <div class="chromecast-controls__progress-bar__total"></div>
               </div>
              <div class="chromecast-controls__buttons">
                <button class="control-button button__play play-pause-button" type="button"></button>
                <button class="control-button button__stop" type="button"></button>
                <div class="buttons-container tracks-button-container" style="display: none">
                  <button class="control-button button__audio-tracks" type="button"></button>
                  <div class="chromecast-controls__subtitles" style="display: none">
                      <div class="chromecast-controls__subtitles__close-icon">&#215;</div>
                      <div class="container-wrapper container-wrapper_audio-tracks">
                        <div class="list-title">Audio tracks</div>
                      </div>
                      <div class="container-wrapper container-wrapper_text-tracks">
                        <div class="list-title">Text tracks</div>
                      </div>
                  </div>
                </div>
               </div>
            </div>
        `;

        if (selector) {
            const wrapperContainer = this.getElement(selector);
            wrapperContainer.insertAdjacentHTML('beforeend', chromecastControlsTemplateString);
        } else {
            document.body.insertAdjacentHTML('beforeend', chromecastControlsTemplateString);
        }
        this.rootElement = this.getElement();
        this.rootElement.querySelector('.button__audio-tracks').addEventListener('click', () => this.toggleTracksDialogue());
        this.rootElement
            .querySelector('.chromecast-controls__subtitles__close-icon')
            .addEventListener('click', () => this.toggleTracksDialogue());
        this.rootElement.querySelector('.chromecast-controls__progress-bar__slider').addEventListener('input', event => {
            if (event.target instanceof HTMLProgressElement) {
                this.seek(event.target.value);
            }
        });
    }

    setPlayButtonClass() {
        const playAndPauseButton = this.getElement('.play-pause-button');
        if (this.currentStatus === chrome.cast.media.PlayerState.PAUSED) {
            playAndPauseButton.classList.replace('button__pause', 'button__play');
        } else {
            playAndPauseButton.classList.replace('button__play', 'button__pause');
        }
    }

    bindEventsToControls() {
        const playAndPauseButton = this.getElement('.play-pause-button');
        const stopButton = this.getElement('.button__stop');

        if (!this.controlInitialized) {
            playAndPauseButton.addEventListener('click', () => this.playPause());
            stopButton.addEventListener('click', () => this.stop());
            this.controlInitialized = true;
        }
    }

    renderTracksButton() {
        const tracksButtonContainerElement = this.getElement('.tracks-button-container') as HTMLElement;
        const sessionMediaInfo = cast.framework.CastContext.getInstance()
            .getCurrentSession()
            .getMediaSession();
        let audioTracks = [];
        let textTracks = [];

        if (this.player.mediaInfo && this.player.mediaInfo.tracks && sessionMediaInfo) {
            audioTracks = this.getTracksByType('AUDIO');
            textTracks = this.getTracksByType('TEXT');
        }

        if (audioTracks.length || textTracks.length) {
            tracksButtonContainerElement.style.display = 'unset';
        } else {
            tracksButtonContainerElement.style.display = 'none';
        }
    }

    renderTracks() {
        this.removeTracks();
        const audioTracksContainerElement = this.getElement('.container-wrapper_audio-tracks');
        const textTracksContainerElement = this.getElement('.container-wrapper_text-tracks');
        const sessionMediaInfo = cast.framework.CastContext.getInstance()
            .getCurrentSession()
            .getMediaSession();
        let audioTracks: TrackInfo[] = [];
        let textTracks: TrackInfo[] = [];

        if (this.player.mediaInfo && this.player.mediaInfo.tracks && sessionMediaInfo) {
            audioTracks = this.getTracksByType('AUDIO');
            textTracks = this.getTracksByType('TEXT');
        }

        if (audioTracks.length) {
            audioTracksContainerElement.appendChild(this.getTracksList(audioTracks, 'AUDIO'));
        }

        if (textTracks.length) {
            textTracksContainerElement.appendChild(this.getTracksList(textTracks, 'TEXT'));
        }
    }

    removeTracks() {
        const tracksListElements = this.rootElement.getElementsByClassName('list-container');
        if (tracksListElements.length) {
            Array.from(tracksListElements).forEach(element => {
                element.remove();
            });
        }
    }

    toggleTracksDialogue() {
        const tracksContainer = this.getElement('.chromecast-controls__subtitles') as HTMLElement;
        if (tracksContainer.style.display === 'none') {
            this.renderTracks();
            tracksContainer.style.display = 'unset';
        } else {
            tracksContainer.style.display = 'none';
            this.removeTracks();
        }
    }

    getTracksList(tracks: TrackInfo[], type: string) {
        const tracksListElement = document.createElement('ul');
        tracksListElement.classList.add('list-container');
        tracksListElement.addEventListener('click', event => this.setActiveTrack(event, type === 'AUDIO' ? 'AUDIO' : 'TEXT'));
        tracks.forEach(track => {
            const listItemElement = document.createElement('li');
            listItemElement.classList.add('list-item');
            if (track.active) {
                listItemElement.classList.add('active');
            } else {
                listItemElement.classList.remove('active');
            }
            listItemElement.innerText = track.locale;
            listItemElement.value = track.id;
            tracksListElement.appendChild(listItemElement);
        });
        return tracksListElement;
    }

    getActiveTracksByType(type: string) {
        return this.getTracksByType(type)
            .filter(track => track.active)
            .map(track => track.id);
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

    setTitle() {
        if (this.player.mediaInfo) {
            const titleElement = this.getElement('.chromecast-controls__title') as HTMLElement;
            titleElement.innerText = this.player.mediaInfo.metadata.title;
        }
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

            currentTimeElement.innerText = this.getTransformedDurationValue(this.currentTime);
            totalTimeElement.innerText = this.getTransformedDurationValue(this.totalDuration);
            progressBarElement.max = this.totalDuration;
            progressBarElement.value = this.currentTime;
        }
    }

    checkChromecastContainerVisibility() {
        if (this.currentStatus === chrome.cast.media.PlayerState.IDLE) {
            this.rootElement.style.display = 'none';
        } else {
            this.rootElement.style.display = 'block';
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
            event.stopPropagation();
            const selectedTrackId = event.target.value;
            const activeTracks = this.getActiveTracksByType(type === 'AUDIO' ? 'TEXT' : 'AUDIO');
            if (selectedTrackId > 0 && activeTracks.indexOf(selectedTrackId) === -1) {
                activeTracks.push(selectedTrackId);
            }
            this.setActiveTracks(activeTracks);
        }
    }

    setActiveTracks(trackIds: number[]) {
        if (this.player && this.player.isConnected) {
            const media = cast.framework.CastContext.getInstance()
                .getCurrentSession()
                .getMediaSession();
            const tracksInfoRequest = new chrome.cast.media.EditTracksInfoRequest(trackIds);
            media.editTracksInfo(
                tracksInfoRequest,
                () => {
                    this.toggleTracksDialogue();
                },
                error => console.error('ChromeCast', error)
            );
        }
    }

    getElement(selector?: string) {
        if (selector) {
            return this.rootElement.querySelector(selector) as HTMLElement;
        }

        return document.querySelector('.chromecast-controls') as HTMLElement;
    }
}
