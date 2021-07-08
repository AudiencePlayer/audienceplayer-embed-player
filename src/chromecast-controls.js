export default class ChromecastControls {
    constructor(player, controller, selector) {
        this.playerController = controller;
        this.rootElement = null;
        this.createChromecastControlsTemplate(player, selector);
        this.bindEvents(player);
        this.setPlayButtonClass(player);
        this.bindEventsToControls(player);
    }

    bindEvents(player) {
        this.playerController.addEventListener(
            cast.framework.RemotePlayerEventType.MEDIA_INFO_CHANGED, () => {
                if(this.rootElement) {
                    this.setProgressBarValues(player);
                    this.renderTracks(player);
                    this.checkChromecastContainerVisibility(player);
                }
            });

        this.playerController.addEventListener(
            cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED,
            () => {
                if(this.rootElement) {
                    this.setProgressBarValues(player);
                }
            });

        this.playerController.addEventListener(
            cast.framework.RemotePlayerEventType.PLAYER_STATE_CHANGED,
            () => {
                if(this.rootElement) {
                    this.setProgressBarValues(player);
                    this.setPlayButtonClass(player);
                    this.checkChromecastContainerVisibility(player);
                }
            });
    };

    createChromecastControlsTemplate(player, selector) {
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

        if(selector) {
            const wrapperContainer = this.getElement(selector);
            wrapperContainer.insertAdjacentHTML('beforeend', chromecastControlsTemplateString)
        } else {
            document.body.insertAdjacentHTML('beforeend', chromecastControlsTemplateString)
        }
        this.rootElement = this.getElement();
        this.setTitle(player);
        this.renderTracksButton(player);
        this.setProgressBarValues(player);
        this.rootElement.querySelector('.button__audio-tracks').addEventListener('click', () => this.toggleTracksDialogue(player));
        this.rootElement.querySelector('.chromecast-controls__subtitles__close-icon').addEventListener('click', () => this.toggleTracksDialogue(player));
        this.rootElement.querySelector('.chromecast-controls__progress-bar__slider').addEventListener('input', (event) => this.seek(player, event.target.value));
    }

    setPlayButtonClass(player) {
        const playAndPauseButton = this.getElement('.play-pause-button');

        if(player.playerState === chrome.cast.media.PlayerState.PAUSED) {
            playAndPauseButton.classList.replace('button__pause', 'button__play');
        } else {
            playAndPauseButton.classList.replace('button__play', 'button__pause');
        }
    }

    bindEventsToControls(player) {
        const playAndPauseButton = this.getElement('.play-pause-button');
        const stopButton = this.getElement('.button__stop');

        playAndPauseButton.addEventListener('click', () => this.playPause(player));
        stopButton.addEventListener('click', () => this.stop(player));
    }

    renderTracksButton(player) {
        const tracksButtonContainerElement = this.getElement('.tracks-button-container');
        const sessionMediaInfo = cast.framework.CastContext.getInstance().getCurrentSession().getMediaSession();
        let audioTracks = [];
        let textTracks = [];

        if(player.mediaInfo && player.mediaInfo.tracks && sessionMediaInfo) {
            audioTracks = this.getTracksByType(player, 'AUDIO');
            textTracks = this.getTracksByType(player, 'TEXT');
        }

        if(audioTracks.length || textTracks.length) {
            tracksButtonContainerElement.style.display = 'unset';
        } else {
            tracksButtonContainerElement.style.display = 'none';
        }
    }

    renderTracks(player) {
        this.removeTracks();
        const audioTracksContainerElement = this.getElement('.container-wrapper_audio-tracks');
        const textTracksContainerElement = this.getElement('.container-wrapper_text-tracks');
        const sessionMediaInfo = cast.framework.CastContext.getInstance().getCurrentSession().getMediaSession();
        let audioTracks = [];
        let textTracks = [];

        if(player.mediaInfo && player.mediaInfo.tracks && sessionMediaInfo) {
            audioTracks = this.getTracksByType(player, 'AUDIO');
            textTracks = this.getTracksByType(player, 'TEXT');
        }

        if(audioTracks.length) {
            audioTracksContainerElement.appendChild(this.getTracksList(player, audioTracks, 'AUDIO'));
        }

        if(textTracks.length) {
            textTracksContainerElement.appendChild(this.getTracksList(player, textTracks, 'TEXT'));
        }
    }

    removeTracks() {
        const tracksListElements = this.rootElement.getElementsByClassName('list-container');
        if(tracksListElements.length) {
            Array.from(tracksListElements).forEach(element => {
                element.remove();
            })
        }
    }

    toggleTracksDialogue(player) {
        const tracksContainer = this.getElement('.chromecast-controls__subtitles');
        if (tracksContainer.style.display === 'none') {
            this.renderTracks(player);
            tracksContainer.style.display = 'unset';
        } else {
            tracksContainer.style.display = 'none';
            this.removeTracks();
        }
    }

    getTracksList(player, tracks, type) {
        const tracksListElement = document.createElement('ul');
        tracksListElement.classList.add('list-container');
        tracksListElement.addEventListener('click', event => this.setActiveTrack(player, event, type === 'AUDIO' ? 'AUDIO' : 'TEXT') );
        tracks.forEach(track => {
            const listItemElement = document.createElement('li');
            listItemElement.classList.add('list-item');
            if(track.active) {
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

    getActiveTracksByType(player, type) {
        return this.getTracksByType(player, type).filter(track => track.active).map(track => track.id)
    }

    getTracksByType(player, type) {
        const sessionMediaInfo = cast.framework.CastContext.getInstance().getCurrentSession().getMediaSession();
        return player.mediaInfo.tracks.filter(track => track.type === type).map(track => ({
            id: track.trackId,
            locale: track.language,
            active: sessionMediaInfo.activeTrackIds.indexOf(track.trackId) !== -1,
        }));
    }

    setTitle(player) {
        const titleElement = this.getElement('.chromecast-controls__title');
        titleElement.innerText = player.mediaInfo.metadata.title;
    }

    getTransformedDurationValue(value) {
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

    setProgressBarValues(player) {
        if(this.rootElement) {
            const currentTimeElement = this.getElement('.chromecast-controls__progress-bar__current');
            const totalTimeElement = this.getElement('.chromecast-controls__progress-bar__total');
            const progressBarElement = this.getElement('.chromecast-controls__progress-bar__slider');

            currentTimeElement.innerText = this.getTransformedDurationValue(player.currentTime);
            totalTimeElement.innerText = this.getTransformedDurationValue(player.duration);
            progressBarElement.max = player.duration;
            progressBarElement.value = player.currentTime;
        }
    }

    checkChromecastContainerVisibility(player) {
        if(player.playerState === chrome.cast.media.PlayerState.IDLE) {
            this.rootElement.remove();
            this.rootElement = null;

        }
    }

    playPause(player) {
        if(player && player.isConnected) {
            this.playerController.playOrPause();
        }
    }

    seek(player, newTime) {
        if(player && player.isConnected) {
            player.currentTime = newTime;
            this.playerController.seek();
        }
    }

    stop(player) {
        if(player && player.isConnected) {
            this.playerController.stop();
            cast.framework.CastContext.getInstance().getCurrentSession().endSession(true);
        }
    }

    setActiveTrack(player, event, type) {
        if(event.target.nodeName === "LI") {
            event.stopPropagation();
            const selectedTrackId = event.target.value;
            const activeTracks = this.getActiveTracksByType(player, type === 'AUDIO' ? 'TEXT' : 'AUDIO');
            if (selectedTrackId > 0 && activeTracks.indexOf(selectedTrackId) === -1) {
                activeTracks.push(selectedTrackId);
            }
            this.setActiveTracks(player, activeTracks);
        }
    }

    setActiveTracks(player, trackIds) {
        if(player && player.isConnected) {
            const media = cast.framework.CastContext.getInstance().getCurrentSession().getMediaSession();
            const tracksInfoRequest = new chrome.cast.media.EditTracksInfoRequest(trackIds);
            media.editTracksInfo(tracksInfoRequest,
                () => {
                    this.toggleTracksDialogue(player);
                },
                (error) => console.error('ChromeCast', error))
        }
    }

    getElement(selector) {
        if(selector) {
            return this.rootElement.querySelector(selector);
        }

        return document.querySelector('.chromecast-controls');
    }
}
