/******/ var __webpack_modules__ = ({

/***/ "./src/api/api-service.ts":
/*!********************************!*\
  !*** ./src/api/api-service.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ApiService: () => (/* binding */ ApiService)
/* harmony export */ });
/* harmony import */ var _graph_request__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./graph-request */ "./src/api/graph-request.ts");
/* harmony import */ var _queries__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./queries */ "./src/api/queries.ts");
/* harmony import */ var _converters__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./converters */ "./src/api/converters.ts");



class ApiService {
    constructor(baseUrl, projectId) {
        this.apiFetchUrl = `${baseUrl}/graphql/${projectId}`;
        this.token = null;
    }
    setToken(token) {
        this.token = token;
    }
    getArticleAssetPlayConfig(articleId, assetId, continueFromPreviousPosition) {
        return (0,_graph_request__WEBPACK_IMPORTED_MODULE_0__.graphRequest)(this.apiFetchUrl, _queries__WEBPACK_IMPORTED_MODULE_1__.articleAssetPlayMutation, { articleId, assetId, protocols: ['dash', 'mss', 'hls'] }, this.token).then((response) => {
            if (!response || !response.data || response.errors) {
                const { message, code } = response.errors[0];
                throw { message, code }; // @TODO to play config error
            }
            return (0,_converters__WEBPACK_IMPORTED_MODULE_2__.toPlayConfig)(response.data.ArticleAssetPlay, continueFromPreviousPosition);
        });
    }
    getArticle(articleId) {
        return (0,_graph_request__WEBPACK_IMPORTED_MODULE_0__.graphRequest)(this.apiFetchUrl, _queries__WEBPACK_IMPORTED_MODULE_1__.articleQuery, { articleId }, this.token).then((response) => {
            if (!response || !response.data || response.errors) {
                const { message, code } = response.errors[0];
                throw { message, code };
            }
            return (0,_converters__WEBPACK_IMPORTED_MODULE_2__.toArticle)(response.data.Article);
        });
    }
}


/***/ }),

/***/ "./src/api/converters.ts":
/*!*******************************!*\
  !*** ./src/api/converters.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getArticleBackgroundImage: () => (/* binding */ getArticleBackgroundImage),
/* harmony export */   getArticleTitle: () => (/* binding */ getArticleTitle),
/* harmony export */   getMetaValue: () => (/* binding */ getMetaValue),
/* harmony export */   getResizedUrl: () => (/* binding */ getResizedUrl),
/* harmony export */   toArticle: () => (/* binding */ toArticle),
/* harmony export */   toArticleMetas: () => (/* binding */ toArticleMetas),
/* harmony export */   toFile: () => (/* binding */ toFile),
/* harmony export */   toPlayConfig: () => (/* binding */ toPlayConfig),
/* harmony export */   toPlayConfigError: () => (/* binding */ toPlayConfigError)
/* harmony export */ });
/* harmony import */ var _models_play_config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../models/play-config */ "./src/models/play-config.ts");

function toPlayConfig(config, continueFromPreviousPosition) {
    const timeStamp = Date.parse(config.issued_at);
    const entitlements = [];
    // check if the entitlements contain FPS in order to know when to filter out aes
    const filterAES = !!config.entitlements.find((entitlement) => entitlement.encryption_type === 'fps');
    const configEntitlements = filterAES
        ? config.entitlements.filter((entitlement) => {
            return entitlement.encryption_type !== 'aes';
        })
        : config.entitlements;
    const dashWidevine = configEntitlements.find((entitlement) => !!entitlement.token && entitlement.encryption_type === 'cenc' && entitlement.protocol.indexOf('dash') === 0);
    const mssPlayReady = configEntitlements.find((entitlement) => !!entitlement.token && entitlement.encryption_type === 'cenc' && entitlement.protocol.indexOf('mss') === 0);
    configEntitlements.forEach((configEntitlement) => {
        const entitlement = {
            src: configEntitlement.manifest,
            type: configEntitlement.mime_type,
            protectionInfo: null,
        };
        if (configEntitlement.token) {
            entitlement.protectionInfo = [];
            if (configEntitlement.encryption_type === 'cenc') {
                if (!!dashWidevine) {
                    entitlement.protectionInfo.push({
                        type: 'Widevine',
                        authenticationToken: 'Bearer ' + dashWidevine.token,
                        keyDeliveryUrl: dashWidevine.key_delivery_url,
                    });
                }
                if (!!mssPlayReady) {
                    entitlement.protectionInfo.push({
                        type: 'PlayReady',
                        authenticationToken: 'Bearer=' + mssPlayReady.token,
                        keyDeliveryUrl: mssPlayReady.key_delivery_url,
                    });
                }
            }
            else if (configEntitlement.encryption_type === 'fps') {
                entitlement.protectionInfo = [
                    {
                        type: 'FairPlay',
                        authenticationToken: 'Bearer ' + configEntitlement.token,
                        certificateUrl: config.fairplay_certificate_url,
                        keyDeliveryUrl: configEntitlement.key_delivery_url,
                    },
                ];
            }
        }
        entitlements.push(entitlement);
    });
    const subtitles = config.subtitles.map((item) => ({
        src: item.url,
        srclang: item.locale,
        kind: 'subtitles',
        label: item.locale_label,
    }));
    return {
        entitlements: entitlements,
        subtitles: subtitles,
        pulseToken: config.pulse_token,
        currentTime: continueFromPreviousPosition ? config.appa : 0,
        articleId: config.article_id,
        assetId: config.asset_id,
        subtitleLocale: config.user_subtitle_locale,
        audioLocale: config.user_audio_locale,
        localTimeDelta: isNaN(timeStamp) ? 0 : Date.now() - timeStamp,
        aspectRatio: config.aspect_ratio.replace('x', ':'),
    };
}
function toArticleMetas(metas) {
    return metas.reduce((metaObj, item) => ({
        ...metaObj,
        [item.key]: item.value,
    }), {});
}
function toArticle(article) {
    return {
        name: article.name,
        metas: toArticleMetas(article.metas),
        posters: article.posters.map(toFile),
        images: article.images.map(toFile),
    };
}
function toFile(file) {
    return {
        type: file.type,
        url: file.url,
        baseUrl: file.base_url,
        fileName: file.file_name,
    };
}
function getMetaValue(metas, key) {
    return metas[key] ? metas[key] : '';
}
function getResizedUrl(fileData, size) {
    if (fileData) {
        const { width, height } = size;
        return `${fileData.baseUrl}/${width}x${height}/${fileData.fileName}`;
    }
    return '';
}
function getArticleTitle(article) {
    return getMetaValue(article.metas, 'title') || article.name;
}
function getArticleBackgroundImage(article) {
    if (article.posters.length > 0) {
        return article.posters[0];
    }
    if (this.article.length > 0) {
        return article.images[0];
    }
    return null;
}
function toPlayConfigError(code) {
    switch (code) {
        case 0:
            return _models_play_config__WEBPACK_IMPORTED_MODULE_0__.ArticlePlayErrors.offlineError;
        case 401:
            return _models_play_config__WEBPACK_IMPORTED_MODULE_0__.ArticlePlayErrors.notAuthenticated;
        case 402:
            return _models_play_config__WEBPACK_IMPORTED_MODULE_0__.ArticlePlayErrors.needEntitlement;
        case 403:
            return _models_play_config__WEBPACK_IMPORTED_MODULE_0__.ArticlePlayErrors.notAuthenticated;
        case 404:
            return _models_play_config__WEBPACK_IMPORTED_MODULE_0__.ArticlePlayErrors.noPlayableAsset;
        case 429:
            return _models_play_config__WEBPACK_IMPORTED_MODULE_0__.ArticlePlayErrors.maxConcurrentStreamNumberError;
        default:
            return _models_play_config__WEBPACK_IMPORTED_MODULE_0__.ArticlePlayErrors.serverError;
    }
}


/***/ }),

/***/ "./src/api/graph-request.ts":
/*!**********************************!*\
  !*** ./src/api/graph-request.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   graphRequest: () => (/* binding */ graphRequest)
/* harmony export */ });
function graphRequest(apiFetchUrl, query, variables, token) {
    const authHeader = token ? { Authorization: 'Bearer ' + token } : {};
    return fetch(apiFetchUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...authHeader,
        },
        body: JSON.stringify({
            query,
            variables,
        }),
    }).then(response => response.json());
}


/***/ }),

/***/ "./src/api/queries.ts":
/*!****************************!*\
  !*** ./src/api/queries.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   articleAssetPlayMutation: () => (/* binding */ articleAssetPlayMutation),
/* harmony export */   articleQuery: () => (/* binding */ articleQuery)
/* harmony export */ });
const articleAssetPlayMutation = `
    mutation ArticleAssetPlay($articleId: Int, $assetId: Int, $protocols: [ArticlePlayProtocolEnum]) {
        ArticleAssetPlay(article_id: $articleId, asset_id: $assetId, protocols: $protocols) {
            article_id
            asset_id
            entitlements {
                mime_type
                protocol
                manifest
                token
                encryption_type
                key_delivery_url
            }
            subtitles {
                url
                locale
                locale_label
            }
            pulse_token
            appa
            appr
            fairplay_certificate_url
            user_subtitle_locale
            user_audio_locale
            aspect_ratio
            issued_at
        }
    }
`;
const articleQuery = `
    query Article($articleId: Int!) {
        Article(id: $articleId) {
            id
            name
            metas {
                key
                value
            }
            assets {
                id
                duration
                linked_type
                accessibility
            }
            posters {
                type
                url
                title
                base_url
                file_name
            }
            images {
                type
                url
                title
                base_url
                file_name
            }
        }
    }
`;


/***/ }),

/***/ "./src/chromecast/chromecast-controls.ts":
/*!***********************************************!*\
  !*** ./src/chromecast/chromecast-controls.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ChromecastControls: () => (/* binding */ ChromecastControls)
/* harmony export */ });
/* harmony import */ var _utils_locale__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/locale */ "./src/utils/locale.ts");
/// <reference path="../../node_modules/@types/chromecast-caf-sender/index.d.ts" />

class ChromecastControls {
    constructor(player, controller, selector) {
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
    createChromecastControlsTemplate(selector) {
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
        }
        else {
            playAndPauseButton.classList.replace('vjs-paused', 'vjs-playing');
        }
    }
    bindEventsToControls() {
        const playAndPauseButton = this.getElement('.play-pause-button');
        playAndPauseButton.addEventListener('click', () => this.playPause());
        this.bindEventsToMenu('.vjs-subtitles-button');
        this.bindEventsToMenu('.vjs-audio-button');
        this.getElement('.chromecast-controls__progress-bar__slider').addEventListener('input', event => {
            this.seek(event.target.value);
        });
    }
    bindEventsToMenu(buttonSelector) {
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
        let audioTracks = [];
        let textTracks = [];
        if (this.player.mediaInfo && this.player.mediaInfo.tracks && sessionMediaInfo) {
            audioTracks = this.getTracksByType('AUDIO');
            textTracks = this.getTracksByType('TEXT');
        }
        const trackButton = this.getElement('.vjs-subtitles-button.vjs-menu-button-popup');
        if (textTracks.length > 0) {
            trackButton.classList.remove('vjs-hidden');
        }
        else {
            trackButton.classList.add('vjs-hidden');
        }
        const audioButton = this.getElement('.vjs-audio-button.vjs-menu-button-popup');
        if (audioTracks.length > 0) {
            audioButton.classList.remove('vjs-hidden');
        }
        else {
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
    getTracksList(tracks, type) {
        const tracksListElement = document.createElement('ul');
        tracksListElement.classList.add('vjs-menu-content');
        tracksListElement.addEventListener('click', event => this.setActiveTrack(event, type === 'AUDIO' ? 'AUDIO' : 'TEXT'));
        tracks.forEach(track => {
            const listItemElement = document.createElement('li');
            listItemElement.classList.add('vjs-menu-item');
            if (track.active) {
                listItemElement.classList.add('vjs-selected');
            }
            else {
                listItemElement.classList.remove('vjs-selected');
            }
            listItemElement.innerText = (0,_utils_locale__WEBPACK_IMPORTED_MODULE_0__.getNativeLanguage)(track.locale);
            listItemElement.value = track.id;
            tracksListElement.appendChild(listItemElement);
        });
        return tracksListElement;
    }
    getActiveTracksByType(type) {
        return this.getTracksByType(type)
            .filter(track => track.active)
            .map(track => +track.id);
    }
    getTracksByType(type) {
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
    setProgressBarValues() {
        if (this.rootElement) {
            const currentTimeElement = this.getElement('.chromecast-controls__progress-bar__current');
            const totalTimeElement = this.getElement('.chromecast-controls__progress-bar__total');
            const progressBarElement = this.getElement('.chromecast-controls__progress-bar__slider');
            const progressLeftEl = this.getElement('.chromecast-controls__progress-bar__slider-left');
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
        }
        else {
            this.rootElement.classList.remove('chromecast-controls--idle');
        }
    }
    playPause() {
        if (this.player && this.player.isConnected) {
            this.playerController.playOrPause();
        }
    }
    seek(newTime) {
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
    setActiveTrack(event, type) {
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
    setActiveTracks(trackIds, type) {
        if (this.player && this.player.isConnected) {
            const media = cast.framework.CastContext.getInstance()
                .getCurrentSession()
                .getMediaSession();
            const tracksInfoRequest = new chrome.cast.media.EditTracksInfoRequest(trackIds);
            media.editTracksInfo(tracksInfoRequest, () => {
                this.toggleMenu(this.getElement(type === 'AUDIO' ? '.vjs-audio-button .vjs-menu' : '.vjs-subtitles-button .vjs-menu'), this.getElement(type === 'AUDIO' ? 'div.vjs-audio-button' : 'div.vjs-subtitles-button'));
            }, (error) => console.error('ChromeCast', error));
        }
    }
    toggleMenu(menuEl, containerEl) {
        if (menuEl.classList.contains('vjs-lock-showing') || containerEl.classList.contains('vjs-hover')) {
            menuEl.classList.remove('vjs-lock-showing');
            menuEl.removeAttribute('tabindex');
            containerEl.classList.remove('vjs-hover');
        }
        else {
            menuEl.classList.add('vjs-lock-showing');
            menuEl.setAttribute('tabindex', '-1');
            menuEl.focus();
        }
    }
    getElement(selector) {
        return this.rootElement.querySelector(selector);
    }
}


/***/ }),

/***/ "./src/chromecast/chromecast-sender.ts":
/*!*********************************************!*\
  !*** ./src/chromecast/chromecast-sender.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ChromecastSender: () => (/* binding */ ChromecastSender)
/* harmony export */ });
/* harmony import */ var _api_converters__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../api/converters */ "./src/api/converters.ts");
/// <reference path="../../node_modules/@types/chromecast-caf-sender/index.d.ts" />

class ChromecastSender {
    constructor() {
        this.castContext = null;
        this.castPlayer = null;
        this.castPlayerController = null;
        this.supportsHDR = false;
    }
    init(chromecastReceiverAppId) {
        return new Promise((resolve, reject) => {
            if (chromecastReceiverAppId) {
                window['__onGCastApiAvailable'] = (isAvailable) => {
                    if (isAvailable && cast && cast.framework && chrome && chrome.cast) {
                        try {
                            this.initializeCastApi(chromecastReceiverAppId);
                            resolve();
                        }
                        catch (e) {
                            reject(e);
                        }
                    }
                    else {
                        reject('Chromecast not available');
                    }
                };
                const scriptElement = document.createElement('script');
                scriptElement.async = true;
                scriptElement.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
                document.head.appendChild(scriptElement);
            }
            else {
                reject('Chromecast Receiver Application Id is missing');
            }
        });
    }
    initializeCastApi(chromecastReceiverAppId) {
        cast.framework.CastContext.getInstance().setOptions({
            receiverApplicationId: chromecastReceiverAppId,
            autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
        });
        this.castContext = cast.framework.CastContext.getInstance();
        this.castPlayer = new cast.framework.RemotePlayer();
        this.castPlayerController = new cast.framework.RemotePlayerController(this.castPlayer);
        this.castPlayerController.addEventListener(cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED, event => {
            if (this.castPlayer.isConnected) {
                const castSession = this.castContext.getCurrentSession();
                castSession.addMessageListener('urn:x-cast:com.audienceplayer.messagebus', (namespace, message) => {
                    const capabilities = JSON.parse(message);
                    this.supportsHDR = capabilities.is_hdr_supported;
                });
            }
            else {
                this.supportsHDR = false;
            }
        });
    }
    onConnectedListener(callback) {
        const doCallback = () => {
            if (this.castPlayer.isConnected) {
                const castContext = cast.framework.CastContext.getInstance();
                const device = castContext.getCurrentSession().getCastDevice();
                callback({
                    connected: true,
                    friendlyName: device.friendlyName || 'Chromecast',
                });
            }
            else {
                callback({ connected: false, friendlyName: '' });
            }
        };
        doCallback();
        this.castPlayerController.addEventListener(cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED, event => {
            doCallback();
        });
    }
    onMediaInfoListener(callback) {
        this.castPlayerController.addEventListener(cast.framework.RemotePlayerEventType.PLAYER_STATE_CHANGED, () => {
            const state = this.castPlayer.playerState;
            let info = null;
            // only when media is loaded, otherwise IDLE state will cause issues
            if (this.castPlayer.isMediaLoaded) {
                if (this.castPlayer.mediaInfo) {
                    const customData = this.castPlayer.mediaInfo.customData;
                    if (customData && customData.extraInfo) {
                        info = customData.extraInfo;
                    }
                }
                callback(state, info);
            }
        });
    }
    onCurrentTimeListener(callback) {
        this.castPlayerController.addEventListener(cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED, () => {
            if (this.castPlayer.playerState !== chrome.cast.media.PlayerState.IDLE) {
                callback(this.castPlayer.currentTime, this.castPlayer.duration);
            }
        });
    }
    getSupportsHDR() {
        return this.supportsHDR;
    }
    getCastMediaInfo(articlePlayConfig, article, extraInfo) {
        if (articlePlayConfig && articlePlayConfig.entitlements && articlePlayConfig.entitlements.length > 0) {
            const tracks = articlePlayConfig.subtitles.map((option, index) => {
                const trackId = index + 1;
                const castTrack = new chrome.cast.media.Track(trackId, chrome.cast.media.TrackType.TEXT);
                castTrack.trackContentId = option.src;
                castTrack.trackContentType = 'text/vtt';
                castTrack.subtype = chrome.cast.media.TextTrackType.SUBTITLES;
                castTrack.name = option.label;
                castTrack.language = option.srclang;
                castTrack.customData = null;
                return castTrack;
            });
            let contentType = null;
            const supportedContentTypes = ['application/vnd.ms-sstr+xml', 'video/mp4'];
            const entitlement = articlePlayConfig.entitlements.find(item => {
                if (supportedContentTypes.includes(item.type)) {
                    contentType = item.type;
                    return true;
                }
                else {
                    return false;
                }
            });
            let protectionConfig = null;
            if (entitlement) {
                if (entitlement.protectionInfo) {
                    protectionConfig = entitlement.protectionInfo.find(protection => {
                        return protection.type === 'PlayReady';
                    });
                }
                const token = protectionConfig ? protectionConfig.authenticationToken : null;
                const mediaInfo = new chrome.cast.media.MediaInfo(entitlement.src, contentType);
                mediaInfo.streamType = chrome.cast.media.StreamType.BUFFERED;
                mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
                mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
                mediaInfo.metadata.title = (0,_api_converters__WEBPACK_IMPORTED_MODULE_0__.getArticleTitle)(article);
                mediaInfo.tracks = tracks;
                const licenceUrlParam = token
                    ? {
                        ...this.getLicenseUrlFromSrc(protectionConfig.keyDeliveryUrl, token),
                    }
                    : {};
                const audieLocaleParam = articlePlayConfig.audioLocale ? { preferredAudioLocale: articlePlayConfig.audioLocale } : {};
                const extraInfoParam = extraInfo ? { extraInfo: JSON.stringify(extraInfo) } : {};
                mediaInfo.customData = {
                    ...licenceUrlParam,
                    ...audieLocaleParam,
                    ...extraInfoParam,
                    pulseToken: articlePlayConfig.pulseToken,
                };
                // @ts-ignore
                mediaInfo.currentTime = articlePlayConfig.currentTime;
                return mediaInfo;
            }
        }
        return null;
    }
    getLicenseUrlFromSrc(src, token) {
        if (token) {
            const rootSrc = src.includes('?') ? `${src}&token=` : `${src}?token=`;
            const licenseUrl = rootSrc + encodeURIComponent(token);
            return {
                licenseUrl,
                token,
            };
        }
        return {};
    }
    castVideo(playConfig, article, continueFromPreviousPosition, extraInfo) {
        if (this.isConnected()) {
            const castSession = this.castContext.getCurrentSession();
            const mediaInfo = this.getCastMediaInfo(playConfig, article, extraInfo);
            if (mediaInfo) {
                const request = new chrome.cast.media.LoadRequest(mediaInfo);
                request.currentTime = continueFromPreviousPosition ? playConfig.currentTime : 0;
                if (playConfig.subtitleLocale) {
                    // can NOT use .filter on tracks because the cast library has patched the Array.
                    const textTrack = mediaInfo.tracks.find((track) => track.language === playConfig.subtitleLocale);
                    if (textTrack) {
                        request.activeTrackIds = [textTrack.trackId];
                    }
                }
                return castSession.loadMedia(request);
            }
            else {
                throw { message: 'Unexpected manifest format in articlePlayConfig' };
            }
        }
    }
    isConnected() {
        return this.castPlayer && this.castPlayer.isConnected;
    }
    stopMedia() {
        if (this.castContext) {
            const castSession = cast.framework.CastContext.getInstance().getCurrentSession();
            if (castSession) {
                castSession.getMediaSession().stop(new chrome.cast.media.StopRequest(), () => { }, () => { });
            }
        }
    }
    endSession(stopCasting) {
        if (this.castContext) {
            const castSession = cast.framework.CastContext.getInstance().getCurrentSession();
            if (castSession) {
                castSession.endSession(stopCasting);
            }
        }
    }
    stopCasting() {
        this.endSession(true);
    }
    getCastPlayer() {
        return this.castPlayer;
    }
    getCastPlayerController() {
        return this.castPlayerController;
    }
}


/***/ }),

/***/ "./src/embed-player.ts":
/*!*****************************!*\
  !*** ./src/embed-player.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EmbedPlayer: () => (/* binding */ EmbedPlayer)
/* harmony export */ });
/* harmony import */ var _video_player_video_player__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./video-player/video-player */ "./src/video-player/video-player.ts");
/* harmony import */ var _chromecast_chromecast_sender__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./chromecast/chromecast-sender */ "./src/chromecast/chromecast-sender.ts");
/* harmony import */ var _api_api_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./api/api-service */ "./src/api/api-service.ts");
/* harmony import */ var _api_converters__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./api/converters */ "./src/api/converters.ts");




class EmbedPlayer {
    constructor(properties) {
        this.projectId = properties.projectId;
        this.apiBaseUrl = properties.apiBaseUrl.replace(/\/*$/, '');
        this.chromecastReceiverAppId = properties.chromecastReceiverAppId ? properties.chromecastReceiverAppId : null;
        this.apiService = new _api_api_service__WEBPACK_IMPORTED_MODULE_2__.ApiService(this.apiBaseUrl, this.projectId);
        this.videoPlayer = new _video_player_video_player__WEBPACK_IMPORTED_MODULE_0__.VideoPlayer(this.apiBaseUrl, this.projectId);
        this.castSender = new _chromecast_chromecast_sender__WEBPACK_IMPORTED_MODULE_1__.ChromecastSender();
    }
    initVideoPlayer(initParams) {
        this.videoPlayer.init(initParams);
    }
    setVideoPlayerPoster(posterUrl) {
        this.videoPlayer.setPoster(posterUrl);
    }
    setVideoPlayerPosterFromArticle(articleId, posterSize) {
        return this.apiService.getArticle(articleId).then(article => {
            this.videoPlayer.setPoster((0,_api_converters__WEBPACK_IMPORTED_MODULE_3__.getResizedUrl)((0,_api_converters__WEBPACK_IMPORTED_MODULE_3__.getArticleBackgroundImage)(article), posterSize));
        });
    }
    play(playParams) {
        if (!playParams.articleId) {
            return Promise.reject('articleId property is missing');
        }
        if (!playParams.assetId) {
            return Promise.reject('assetId property is missing');
        }
        this.apiService.setToken(playParams.token ? playParams.token : null);
        return this.apiService
            .getArticleAssetPlayConfig(playParams.articleId, playParams.assetId, playParams.continueFromPreviousPosition)
            .then(config => {
            this.playVideo(config, playParams);
            return config;
        })
            .catch(error => {
            console.log((0,_api_converters__WEBPACK_IMPORTED_MODULE_3__.toPlayConfigError)(error.code));
            throw error;
        });
    }
    destroy() {
        this.videoPlayer.destroy();
    }
    playVideo(config, playParams) {
        this.videoPlayer.play(config, playParams);
    }
    getVideoPlayer() {
        return this.videoPlayer.getPlayer();
    }
    initChromecast() {
        if (!this.chromecastReceiverAppId) {
            return Promise.reject('No Chromecast receiver app id');
        }
        return this.castSender.init(this.chromecastReceiverAppId);
    }
    appendChromecastButton(selector) {
        const castButtonContaner = selector instanceof Element ? selector : document.querySelector(selector);
        const castButton = document.createElement('google-cast-launcher');
        castButtonContaner.appendChild(castButton);
    }
    castVideo({ articleId, assetId, token, continueFromPreviousPosition }) {
        if (!articleId) {
            return Promise.reject('articleId property is missing');
        }
        if (!assetId) {
            return Promise.reject('assetId property is missing');
        }
        this.apiService.setToken(token);
        return Promise.all([
            this.apiService.getArticleAssetPlayConfig(articleId, assetId, continueFromPreviousPosition),
            this.apiService.getArticle(articleId),
        ])
            .then(([config, article]) => {
            this.castSender.castVideo(config, article, continueFromPreviousPosition);
            return config;
        })
            .catch(error => {
            console.log((0,_api_converters__WEBPACK_IMPORTED_MODULE_3__.toPlayConfigError)(error.code));
            throw error;
        });
    }
    getCastSender() {
        return this.castSender;
    }
    getCastPlayer() {
        return this.castSender.getCastPlayer();
    }
    getCastPlayerController() {
        return this.castSender.getCastPlayerController();
    }
    isConnected() {
        return this.castSender.isConnected();
    }
    endSession(stopCasting) {
        this.castSender.endSession(stopCasting);
    }
}
//*** Example of usage ***//
// const player = new EmbeddablePlayer();
//
// player
//     .play({
//         selector: '.video-wrapper',
//         apiBaseUrl: '',
//         projectId: '',
//         articleId: '',
//         assetId: '',
//         token: '',
//         posterImageUrl: '',
//         fullScreen: false
//         continueFromPreviousPosition: true
//     })
//     .then(config => {
//         console.log('Config', config);
//     })
//     .catch(error => {
//         console.log('Error', error);
//     });
//*** Example of usage with chromecast ***//
// const player = new EmbeddablePlayer();
// player.setupChromecast("#cast-wrapper", CHROMECAST_RECEIVER_APP_ID);
//
// player
//     .castVideo({
//         apiBaseUrl: '',
//         projectId: '',
//         articleId: '',
//         assetId: '',
//         token: '',
//         continueFromPreviousPosition: true
//     })
//     .then(config => {
//         console.log('Config', config);
//     })
//     .catch(error => {
//         console.log('Error', error);
//     });


/***/ }),

/***/ "./src/logging/player-log-processor.ts":
/*!*********************************************!*\
  !*** ./src/logging/player-log-processor.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PlayerLogProcessor: () => (/* binding */ PlayerLogProcessor)
/* harmony export */ });
/* harmony import */ var _models_player__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../models/player */ "./src/models/player.ts");

const MAX_EVENTS = 30;
class PlayerLogProcessor {
    constructor(baseUrl, projectId) {
        this.playLogs = [];
        this.apiCallInProgress = false;
        this.intervalHandle = null;
        this.apiUrl = `${baseUrl}/service/${projectId}/analytics/stream/pulse/log`.replace(/\/*$/, '');
    }
    init() {
        if (this.intervalHandle === null) {
            this.intervalHandle = setInterval(() => {
                this.processFirstPlayLog();
            }, 3000);
        }
    }
    destroy() {
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
        }
        this.intervalHandle = null;
    }
    processPlaySession(playSession, timeStamp) {
        if (!playSession) {
            return;
        }
        const eventStack = playSession.eventStack;
        if (eventStack.length === 0) {
            return;
        }
        const eventStackPayload = [];
        let i = 0, sumDelta = 0, lastEventWasProcessed = false;
        while (i < eventStack.length) {
            const currentEvent = eventStack[i];
            if (this.isEventTypeWithoutTimeDelta(currentEvent.eventType)) {
                // directly process these events. they have no sumDelta and do not affect the play state
                eventStackPayload.push(this.convertEventToEventPayload(currentEvent));
                lastEventWasProcessed = true;
            }
            else {
                lastEventWasProcessed = false;
                if (i - 1 >= 0) {
                    const previousEvent = eventStack[i - 1];
                    sumDelta += currentEvent.timeStamp - previousEvent.timeStamp;
                    if (currentEvent.state !== previousEvent.state) {
                        eventStackPayload.push(this.createDeltaEventPayload(previousEvent, previousEvent.timeStamp, sumDelta));
                        sumDelta = 0;
                    }
                }
            }
            i++;
        }
        const lastEvent = eventStack[eventStack.length - 1];
        if (sumDelta > 0 || !lastEventWasProcessed) {
            eventStackPayload.push(this.createDeltaEventPayload(lastEvent, timeStamp, sumDelta));
        }
        if (eventStackPayload.length > 0) {
            if (eventStackPayload.length > MAX_EVENTS) {
                // if event stack too big, add error with runaway info and slice nr of items
                const lastLogEvent = eventStackPayload[eventStackPayload.length - 1];
                eventStackPayload.splice(MAX_EVENTS - 1);
                lastLogEvent.event_type = _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayerEventTypePayloads.error;
                lastLogEvent.event_payload = '{"code": 429, "message": "Too many events"}'; // runaway
                eventStackPayload.push(lastLogEvent);
            }
            // check if there is already a log for this session
            let playLogPayload = this.getPlayerLogPayloadWithPulseToken(playSession.pulseToken);
            if (!playLogPayload) {
                playLogPayload = {
                    event_stack: [],
                    pulse_token: playSession.pulseToken,
                    pulse_mode: playSession.isLive ? _models_player__WEBPACK_IMPORTED_MODULE_0__.PulseMode.live : _models_player__WEBPACK_IMPORTED_MODULE_0__.PulseMode.offline,
                    device_type: playSession.deviceType,
                };
                this.playLogs.push(playLogPayload);
            }
            // keep the event_stack pointer in tact by using push
            eventStackPayload.forEach(e => playLogPayload.event_stack.push(e));
            this.processPlayLog(playLogPayload, playSession);
        }
    }
    processFirstPlayLog() {
        if (this.playLogs.length > 0) {
            this.processPlayLog(this.playLogs[0], null);
        }
    }
    processPlayLog(currentLog, playSession) {
        if (!currentLog || this.apiCallInProgress) {
            return;
        }
        if (currentLog.event_stack.length === 0) {
            this.removePlayLog(currentLog);
            return;
        }
        const logToSend = {
            ...currentLog,
            event_stack: [],
        };
        let eventStackIndex = 0, isStopCutOff = false;
        while (eventStackIndex < currentLog.event_stack.length && logToSend.event_stack.length < MAX_EVENTS && !isStopCutOff) {
            const currentEvent = currentLog.event_stack[eventStackIndex];
            eventStackIndex++;
            logToSend.event_stack.push(currentEvent);
            if (currentEvent.event_type === _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayerEventTypePayloads.stop) {
                isStopCutOff = true;
            }
        }
        // for offline logging, always accumulate until MAX_EVENTS before sending unless it's a stop cut off.
        if (logToSend.pulse_mode === _models_player__WEBPACK_IMPORTED_MODULE_0__.PulseMode.offline && logToSend.event_stack.length < MAX_EVENTS && !isStopCutOff) {
            return;
        }
        // transaction start
        this.apiCallInProgress = true;
        return fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(logToSend),
        })
            .then(() => {
            return true;
        })
            .catch(error => {
            return error.status !== 0;
        })
            .then(response => {
            if (response) {
                currentLog.event_stack.splice(0, eventStackIndex);
                if (currentLog.event_stack.length === 0) {
                    this.removePlayLog(currentLog);
                }
            }
            else {
                currentLog.pulse_mode = _models_player__WEBPACK_IMPORTED_MODULE_0__.PulseMode.archive;
            }
            this.apiCallInProgress = false;
        });
    }
    getPlayerLogPayloadWithPulseToken(pulseToken) {
        return this.playLogs.find(log => log.pulse_token === pulseToken);
    }
    removePlayLog(logPayload) {
        const index = this.playLogs.findIndex(log => log.pulse_token === logPayload.pulse_token);
        if (index >= 0) {
            this.playLogs.splice(index, 1);
        }
    }
    isEventTypeWithoutTimeDelta(eventType) {
        return [_models_player__WEBPACK_IMPORTED_MODULE_0__.PlayerEventTypes.textTrackChanged, _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayerEventTypes.audioTrackChanged, _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayerEventTypes.playStart].indexOf(eventType) >= 0;
    }
    createBaseEventPayload(playerEvent, eventType) {
        return {
            timestamp: playerEvent.timeStamp,
            event_type: eventType,
            appa: playerEvent.playPosition,
            appr: Math.min(playerEvent.playPosition / playerEvent.mediaDuration, 1),
        };
    }
    convertEventToEventPayload(playerEvent) {
        if (playerEvent.eventType === _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayerEventTypes.playStart) {
            return {
                timestamp: playerEvent.timeStamp,
                event_type: _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayerEventTypePayloads.play,
            };
        }
        const eventType = this.convertEventTypeToEventTypePayload(playerEvent);
        const baseEvent = this.createBaseEventPayload(playerEvent, eventType);
        switch (playerEvent.eventType) {
            case _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayerEventTypes.audioTrackChanged:
                return {
                    ...baseEvent,
                    audio_locale: playerEvent.audioTrack,
                };
            case _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayerEventTypes.textTrackChanged:
                return {
                    ...baseEvent,
                    subtitle_locale: playerEvent.textTrack,
                };
            default:
                return baseEvent;
        }
    }
    createDeltaEventPayload(playerEvent, timestamp, timeDelta) {
        const eventType = this.getEventTypePayloadFromEventState(playerEvent);
        const baseEvent = this.createBaseEventPayload(playerEvent, eventType);
        const errorPart = playerEvent.state === _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayingState.error ? { event_payload: playerEvent.error } : {};
        return {
            ...baseEvent,
            ...errorPart,
            timestamp,
            time_delta: timeDelta / 1000,
        };
    }
    getEventTypePayloadFromEventState(playerEvent) {
        switch (playerEvent.state) {
            case _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayingState.playing:
                return _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayerEventTypePayloads.playing;
            case _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayingState.paused:
                return _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayerEventTypePayloads.paused;
            case _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayingState.error:
                return _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayerEventTypePayloads.error;
            case _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayingState.buffering:
            case _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayingState.loading:
                return _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayerEventTypePayloads.paused; // buffering and loading converted to paused for API
            case _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayingState.idle:
                return _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayerEventTypePayloads.stop;
        }
    }
    convertEventTypeToEventTypePayload(playerEvent) {
        switch (playerEvent.eventType) {
            case _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayerEventTypes.playStart:
                return _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayerEventTypePayloads.play;
            case _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayerEventTypes.audioTrackChanged:
            case _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayerEventTypes.textTrackChanged:
                return _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayerEventTypePayloads.configure;
            // because e.g. `timeupdate` events can happen while paused / playing, base the rest on state.
            default: {
                this.getEventTypePayloadFromEventState(playerEvent);
            }
        }
    }
}


/***/ }),

/***/ "./src/logging/player-logger-service.ts":
/*!**********************************************!*\
  !*** ./src/logging/player-logger-service.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PlayerLoggerService: () => (/* binding */ PlayerLoggerService)
/* harmony export */ });
/* harmony import */ var _player_log_processor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./player-log-processor */ "./src/logging/player-log-processor.ts");
/* harmony import */ var _models_player__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../models/player */ "./src/models/player.ts");


class PlayerLoggerService {
    constructor(baseUrl, projectId) {
        this.intervalHandle = 0;
        this.playerLogProcessor = new _player_log_processor__WEBPACK_IMPORTED_MODULE_0__.PlayerLogProcessor(baseUrl, projectId);
        this.reset();
    }
    init() {
        this.playerLogProcessor.init();
    }
    destroy() {
        this.playerLogProcessor.destroy();
    }
    onStart(pulseToken, deviceType, localTimeDelta, isLive, onStopCallback) {
        this.reset();
        this.playSession = {
            pulseToken,
            deviceType,
            eventStack: [],
            localTimeDelta,
            isLive,
            onStopCallback,
        };
    }
    onCurrentTimeUpdated(currentTime) {
        this.playerProperties.playPosition = currentTime;
        if (this.playerProperties.mediaDuration > 0 && this.playerProperties.state !== _models_player__WEBPACK_IMPORTED_MODULE_1__.PlayingState.idle) {
            this.logEvent(_models_player__WEBPACK_IMPORTED_MODULE_1__.PlayerEventTypes.timeupdate);
        }
    }
    onDurationUpdated(duration) {
        this.playerProperties.mediaDuration = duration;
    }
    onPlaying() {
        if (this.playerProperties.state !== _models_player__WEBPACK_IMPORTED_MODULE_1__.PlayingState.playing) {
            if (this.playerProperties.state === _models_player__WEBPACK_IMPORTED_MODULE_1__.PlayingState.idle) {
                this.playerProperties.state = _models_player__WEBPACK_IMPORTED_MODULE_1__.PlayingState.playing;
                this.logEvent(_models_player__WEBPACK_IMPORTED_MODULE_1__.PlayerEventTypes.playStart);
                this.processPlaySession();
                this.startInterval();
            }
            else {
                this.playerProperties.state = _models_player__WEBPACK_IMPORTED_MODULE_1__.PlayingState.playing;
                this.logEvent(_models_player__WEBPACK_IMPORTED_MODULE_1__.PlayerEventTypes.playing);
            }
        }
    }
    onPause() {
        if (this.playerProperties.state !== _models_player__WEBPACK_IMPORTED_MODULE_1__.PlayingState.paused && this.playerProperties.state !== _models_player__WEBPACK_IMPORTED_MODULE_1__.PlayingState.idle) {
            this.playerProperties.state = _models_player__WEBPACK_IMPORTED_MODULE_1__.PlayingState.paused;
            this.logEvent(_models_player__WEBPACK_IMPORTED_MODULE_1__.PlayerEventTypes.pause);
        }
    }
    onError(error) {
        if (this.playerProperties.state !== _models_player__WEBPACK_IMPORTED_MODULE_1__.PlayingState.error) {
            this.playerProperties.state = _models_player__WEBPACK_IMPORTED_MODULE_1__.PlayingState.error;
            this.playerProperties.error = error;
            this.logEvent(_models_player__WEBPACK_IMPORTED_MODULE_1__.PlayerEventTypes.error);
        }
    }
    onStop() {
        if (this.playerProperties.state !== _models_player__WEBPACK_IMPORTED_MODULE_1__.PlayingState.idle) {
            this.playerProperties.state = _models_player__WEBPACK_IMPORTED_MODULE_1__.PlayingState.idle;
            this.logEvent(_models_player__WEBPACK_IMPORTED_MODULE_1__.PlayerEventTypes.stopped);
            this.stopInterval();
            this.processPlaySession();
        }
    }
    onTextTrackChanged(textTrack) {
        if (this.playerProperties.state === _models_player__WEBPACK_IMPORTED_MODULE_1__.PlayingState.idle) {
            return;
        }
        this.playerProperties.textTrack = textTrack;
        this.logEvent(_models_player__WEBPACK_IMPORTED_MODULE_1__.PlayerEventTypes.textTrackChanged);
    }
    onAudioTrackChanged(audioTrack) {
        if (this.playerProperties.state === _models_player__WEBPACK_IMPORTED_MODULE_1__.PlayingState.idle) {
            return;
        }
        this.playerProperties.audioTrack = audioTrack;
        this.logEvent(_models_player__WEBPACK_IMPORTED_MODULE_1__.PlayerEventTypes.audioTrackChanged);
    }
    updateProperties(playerProperties) {
        this.playerProperties = {
            ...this.playerProperties,
            ...playerProperties,
        };
    }
    startInterval() {
        this.stopInterval();
        // @ts-ignore
        this.intervalHandle = setInterval(() => {
            this.processPlaySession();
        }, 30000);
    }
    stopInterval() {
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
        }
    }
    processPlaySession() {
        this.playerLogProcessor.processPlaySession({ ...this.playSession }, this.getTimeStamp());
        this.playSession.eventStack = [];
    }
    logEvent(eventType) {
        if (this.playSession) {
            this.playSession.eventStack.push({
                ...this.playerProperties,
                eventType,
                timeStamp: this.getTimeStamp(),
            });
        }
    }
    reset() {
        this.playSession = null;
        this.playerProperties = {
            state: _models_player__WEBPACK_IMPORTED_MODULE_1__.PlayingState.idle,
            error: null,
            mediaDuration: 0,
            playPosition: 0,
            audioTrack: null,
            textTrack: null,
        };
    }
    getTimeStamp() {
        return Date.now() - (this.playSession ? this.playSession.localTimeDelta : 0);
    }
}


/***/ }),

/***/ "./src/models/play-config.ts":
/*!***********************************!*\
  !*** ./src/models/play-config.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ArticlePlayErrors: () => (/* binding */ ArticlePlayErrors)
/* harmony export */ });
var ArticlePlayErrors;
(function (ArticlePlayErrors) {
    ArticlePlayErrors["noPlayableAsset"] = "noPlayableAsset";
    ArticlePlayErrors["notAuthenticated"] = "notAuthenticated";
    ArticlePlayErrors["needEntitlement"] = "needEntitlement";
    ArticlePlayErrors["serverError"] = "serverError";
    ArticlePlayErrors["offlineError"] = "offlineError";
    ArticlePlayErrors["maxConcurrentStreamNumberError"] = "maxConcurrentStreamNumberError";
})(ArticlePlayErrors || (ArticlePlayErrors = {}));


/***/ }),

/***/ "./src/models/player.ts":
/*!******************************!*\
  !*** ./src/models/player.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PlayerDeviceTypes: () => (/* binding */ PlayerDeviceTypes),
/* harmony export */   PlayerEventTypePayloads: () => (/* binding */ PlayerEventTypePayloads),
/* harmony export */   PlayerEventTypes: () => (/* binding */ PlayerEventTypes),
/* harmony export */   PlayerLogPayload: () => (/* binding */ PlayerLogPayload),
/* harmony export */   PlayingState: () => (/* binding */ PlayingState),
/* harmony export */   PulseMode: () => (/* binding */ PulseMode)
/* harmony export */ });
var PlayingState;
(function (PlayingState) {
    PlayingState[PlayingState["loading"] = 0] = "loading";
    PlayingState[PlayingState["playing"] = 1] = "playing";
    PlayingState[PlayingState["paused"] = 2] = "paused";
    PlayingState[PlayingState["idle"] = 3] = "idle";
    PlayingState[PlayingState["buffering"] = 4] = "buffering";
    PlayingState[PlayingState["error"] = 5] = "error";
})(PlayingState || (PlayingState = {}));
class PlayerLogPayload {
}
// generic abstraction of player events that are taken from the video player, Chromecast and mobile implementations
var PlayerEventTypes;
(function (PlayerEventTypes) {
    PlayerEventTypes["playStart"] = "playStart";
    PlayerEventTypes["playing"] = "playing";
    PlayerEventTypes["pause"] = "pause";
    PlayerEventTypes["error"] = "error";
    PlayerEventTypes["stopped"] = "stopped";
    PlayerEventTypes["timeupdate"] = "timeupdate";
    PlayerEventTypes["textTrackChanged"] = "textTrackChanged";
    PlayerEventTypes["audioTrackChanged"] = "audioTrackChanged";
})(PlayerEventTypes || (PlayerEventTypes = {}));
var PlayerDeviceTypes;
(function (PlayerDeviceTypes) {
    PlayerDeviceTypes["chromecast"] = "chromecast";
    PlayerDeviceTypes["default"] = "";
})(PlayerDeviceTypes || (PlayerDeviceTypes = {}));
var PlayerEventTypePayloads;
(function (PlayerEventTypePayloads) {
    PlayerEventTypePayloads["play"] = "play";
    PlayerEventTypePayloads["playing"] = "playing";
    PlayerEventTypePayloads["paused"] = "paused";
    PlayerEventTypePayloads["stop"] = "stop";
    PlayerEventTypePayloads["error"] = "error";
    PlayerEventTypePayloads["configure"] = "configure";
})(PlayerEventTypePayloads || (PlayerEventTypePayloads = {}));
var PulseMode;
(function (PulseMode) {
    PulseMode["live"] = "live";
    PulseMode["archive"] = "archive";
    PulseMode["offline"] = "offline";
})(PulseMode || (PulseMode = {}));


/***/ }),

/***/ "./src/utils/eme.ts":
/*!**************************!*\
  !*** ./src/utils/eme.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   base64ToBinary: () => (/* binding */ base64ToBinary),
/* harmony export */   binaryToBase64: () => (/* binding */ binaryToBase64),
/* harmony export */   getEmeOptionsFromEntitlement: () => (/* binding */ getEmeOptionsFromEntitlement),
/* harmony export */   getHostnameFromUri: () => (/* binding */ getHostnameFromUri),
/* harmony export */   parseLicenseResponse: () => (/* binding */ parseLicenseResponse)
/* harmony export */ });
function getEmeOptionsFromEntitlement(entitlement) {
    let protectionInfo = null;
    let emeOptions = {};
    if (entitlement.protectionInfo) {
        switch (entitlement.type) {
            case 'application/dash+xml':
                protectionInfo = entitlement.protectionInfo.find(p => p.type === 'Widevine');
                if (protectionInfo) {
                    emeOptions = {
                        keySystems: {
                            'com.widevine.alpha': protectionInfo.keyDeliveryUrl,
                        },
                        emeHeaders: {
                            Authorization: protectionInfo.authenticationToken,
                        },
                    };
                }
                break;
            case 'application/vnd.ms-sstr+xml':
                protectionInfo = entitlement.protectionInfo.find(p => p.type === 'PlayReady');
                if (protectionInfo) {
                    emeOptions = {
                        keySystems: {
                            'com.microsoft.playready': protectionInfo.keyDeliveryUrl,
                        },
                        emeHeaders: {
                            Authorization: protectionInfo.authenticationToken,
                        },
                    };
                }
                break;
            case 'application/vnd.apple.mpegurl':
                protectionInfo = entitlement.protectionInfo.find(p => p.type === 'FairPlay');
                if (protectionInfo) {
                    emeOptions = {
                        keySystems: {
                            'com.apple.fps.1_0': {
                                certificateUri: protectionInfo.certificateUrl,
                                getContentId: function () {
                                    return getHostnameFromUri(protectionInfo.keyDeliveryUrl);
                                },
                                getLicense: function (emeOptions, contentId, keyMessage, callback) {
                                    const payload = 'spc=' + binaryToBase64(keyMessage) + '&assetId=' + encodeURIComponent(contentId);
                                    videojs.xhr({
                                        uri: protectionInfo.keyDeliveryUrl,
                                        method: 'post',
                                        headers: {
                                            'Content-type': 'application/x-www-form-urlencoded',
                                            Authorization: protectionInfo.authenticationToken,
                                        },
                                        body: payload,
                                        responseType: 'arraybuffer',
                                    }, videojs.xhr.httpHandler(function (err, response) {
                                        callback(null, parseLicenseResponse(response));
                                    }, true));
                                },
                            },
                        },
                    };
                }
                break;
        }
    }
    return emeOptions;
}
function binaryToBase64(a) {
    let b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=', c = [];
    for (let d = 0; d < a.byteLength;) {
        let e = a[d++];
        c.push(b.charAt(e >> 2)),
            (e = (3 & e) << 4),
            d < a.byteLength
                ? (c.push(b.charAt(e | (a[d] >> 4))),
                    (e = (15 & a[d++]) << 2),
                    d < a.byteLength
                        ? (c.push(b.charAt(e | (a[d] >> 6))), c.push(b.charAt(63 & a[d++])))
                        : (c.push(b.charAt(e)), c.push('=')))
                : (c.push(b.charAt(e)), c.push('=='));
    }
    return c.join('');
}
function base64ToBinary(a) {
    let b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=', c = new Uint8Array(new ArrayBuffer((3 * a.length) / 4 + 4)), e = 0;
    for (let d = 0; d < a.length;) {
        let f = b.indexOf(a.charAt(d)), g = b.indexOf(a.charAt(d + 1));
        if (((c[e++] = (f << 2) | (g >> 4)), '=' !== a.charAt(d + 2))) {
            let h = b.indexOf(a.charAt(d + 2));
            if (((c[e++] = (g << 4) | (h >> 2)), '=' !== a.charAt(d + 3))) {
                let i = b.indexOf(a.charAt(d + 3));
                c[e++] = (h << 6) | i;
            }
        }
        d += 4;
    }
    return new Uint8Array(c.buffer, 0, e);
}
function parseLicenseResponse(response) {
    const responseBody = String.fromCharCode.apply(null, new Uint8Array(response));
    let b = responseBody.trim(), c = b.indexOf('<ckc>'), d = b.indexOf('</ckc>');
    if (-1 === c || -1 === d) {
        throw Error('License data format not as expected, missing or misplaced <ckc> tag');
    }
    c += 5;
    b = b.substr(c, d - c);
    return base64ToBinary(b);
}
function getHostnameFromUri(uri) {
    let link = document.createElement('a');
    link.href = uri;
    return link.hostname;
}


/***/ }),

/***/ "./src/utils/locale.ts":
/*!*****************************!*\
  !*** ./src/utils/locale.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getISO2Locale: () => (/* binding */ getISO2Locale),
/* harmony export */   getNativeLanguage: () => (/* binding */ getNativeLanguage)
/* harmony export */ });
// https://raw.githubusercontent.com/vtex/country-iso-3-to-2/master/index.js
function getISO2Locale(countryCode) {
    const countryISOMapping = {
        AFG: 'AF',
        ALA: 'AX',
        ALB: 'AL',
        DZA: 'DZ',
        ASM: 'AS',
        AND: 'AD',
        AGO: 'AO',
        AIA: 'AI',
        ATA: 'AQ',
        ATG: 'AG',
        ARG: 'AR',
        ARM: 'AM',
        ABW: 'AW',
        AUS: 'AU',
        AUT: 'AT',
        AZE: 'AZ',
        BHS: 'BS',
        BHR: 'BH',
        BGD: 'BD',
        BRB: 'BB',
        BLR: 'BY',
        BEL: 'BE',
        BLZ: 'BZ',
        BEN: 'BJ',
        BMU: 'BM',
        BTN: 'BT',
        BOL: 'BO',
        BES: 'BQ',
        BIH: 'BA',
        BWA: 'BW',
        BVT: 'BV',
        BRA: 'BR',
        VGB: 'VG',
        IOT: 'IO',
        BRN: 'BN',
        BGR: 'BG',
        BFA: 'BF',
        BDI: 'BI',
        KHM: 'KH',
        CMR: 'CM',
        CAN: 'CA',
        CPV: 'CV',
        CYM: 'KY',
        CAF: 'CF',
        TCD: 'TD',
        CHL: 'CL',
        CHN: 'CN',
        HKG: 'HK',
        MAC: 'MO',
        CXR: 'CX',
        CCK: 'CC',
        COL: 'CO',
        COM: 'KM',
        COG: 'CG',
        COD: 'CD',
        COK: 'CK',
        CRI: 'CR',
        CIV: 'CI',
        HRV: 'HR',
        CUB: 'CU',
        CUW: 'CW',
        CYP: 'CY',
        CZE: 'CZ',
        DNK: 'DK',
        DJI: 'DJ',
        DMA: 'DM',
        DOM: 'DO',
        ECU: 'EC',
        EGY: 'EG',
        SLV: 'SV',
        GNQ: 'GQ',
        ERI: 'ER',
        EST: 'EE',
        ETH: 'ET',
        FLK: 'FK',
        FRO: 'FO',
        FJI: 'FJ',
        FIN: 'FI',
        FRA: 'FR',
        GUF: 'GF',
        PYF: 'PF',
        ATF: 'TF',
        GAB: 'GA',
        GMB: 'GM',
        GEO: 'GE',
        DEU: 'DE',
        GHA: 'GH',
        GIB: 'GI',
        GRC: 'GR',
        GRL: 'GL',
        GRD: 'GD',
        GLP: 'GP',
        GUM: 'GU',
        GTM: 'GT',
        GGY: 'GG',
        GIN: 'GN',
        GNB: 'GW',
        GUY: 'GY',
        HTI: 'HT',
        HMD: 'HM',
        VAT: 'VA',
        HND: 'HN',
        HUN: 'HU',
        ISL: 'IS',
        IND: 'IN',
        IDN: 'ID',
        IRN: 'IR',
        IRQ: 'IQ',
        IRL: 'IE',
        IMN: 'IM',
        ISR: 'IL',
        ITA: 'IT',
        JAM: 'JM',
        JPN: 'JP',
        JEY: 'JE',
        JOR: 'JO',
        KAZ: 'KZ',
        KEN: 'KE',
        KIR: 'KI',
        PRK: 'KP',
        KOR: 'KR',
        KWT: 'KW',
        KGZ: 'KG',
        LAO: 'LA',
        LVA: 'LV',
        LBN: 'LB',
        LSO: 'LS',
        LBR: 'LR',
        LBY: 'LY',
        LIE: 'LI',
        LTU: 'LT',
        LUX: 'LU',
        MKD: 'MK',
        MDG: 'MG',
        MWI: 'MW',
        MYS: 'MY',
        MDV: 'MV',
        MLI: 'ML',
        MLT: 'MT',
        MHL: 'MH',
        MTQ: 'MQ',
        MRT: 'MR',
        MUS: 'MU',
        MYT: 'YT',
        MEX: 'MX',
        FSM: 'FM',
        MDA: 'MD',
        MCO: 'MC',
        MNG: 'MN',
        MNE: 'ME',
        MSR: 'MS',
        MAR: 'MA',
        MOZ: 'MZ',
        MMR: 'MM',
        NAM: 'NA',
        NRU: 'NR',
        NPL: 'NP',
        NLD: 'NL',
        ANT: 'AN',
        NCL: 'NC',
        NZL: 'NZ',
        NIC: 'NI',
        NER: 'NE',
        NGA: 'NG',
        NIU: 'NU',
        NFK: 'NF',
        MNP: 'MP',
        NOR: 'NO',
        OMN: 'OM',
        PAK: 'PK',
        PLW: 'PW',
        PSE: 'PS',
        PAN: 'PA',
        PNG: 'PG',
        PRY: 'PY',
        PER: 'PE',
        PHL: 'PH',
        PCN: 'PN',
        POL: 'PL',
        PRT: 'PT',
        PRI: 'PR',
        QAT: 'QA',
        REU: 'RE',
        ROU: 'RO',
        RUS: 'RU',
        RWA: 'RW',
        BLM: 'BL',
        SHN: 'SH',
        KNA: 'KN',
        LCA: 'LC',
        MAF: 'MF',
        SPM: 'PM',
        VCT: 'VC',
        WSM: 'WS',
        SMR: 'SM',
        STP: 'ST',
        SAU: 'SA',
        SEN: 'SN',
        SRB: 'RS',
        SYC: 'SC',
        SLE: 'SL',
        SGP: 'SG',
        SXM: 'SX',
        SVK: 'SK',
        SVN: 'SI',
        SLB: 'SB',
        SOM: 'SO',
        ZAF: 'ZA',
        SGS: 'GS',
        SSD: 'SS',
        ESP: 'ES',
        LKA: 'LK',
        SDN: 'SD',
        SUR: 'SR',
        SJM: 'SJ',
        SWZ: 'SZ',
        SWE: 'SE',
        CHE: 'CH',
        SYR: 'SY',
        TWN: 'TW',
        TJK: 'TJ',
        TZA: 'TZ',
        THA: 'TH',
        TLS: 'TL',
        TGO: 'TG',
        TKL: 'TK',
        TON: 'TO',
        TTO: 'TT',
        TUN: 'TN',
        TUR: 'TR',
        TKM: 'TM',
        TCA: 'TC',
        TUV: 'TV',
        UGA: 'UG',
        UKR: 'UA',
        ARE: 'AE',
        GBR: 'GB',
        USA: 'US',
        UMI: 'UM',
        URY: 'UY',
        UZB: 'UZ',
        VUT: 'VU',
        VEN: 'VE',
        VNM: 'VN',
        VIR: 'VI',
        WLF: 'WF',
        ESH: 'EH',
        YEM: 'YE',
        ZMB: 'ZM',
        ZWE: 'ZW',
        XKX: 'XK',
    };
    if (countryCode && countryCode.length === 3) {
        countryCode = countryCode.toUpperCase();
        if (countryISOMapping[countryCode]) {
            return countryISOMapping[countryCode].toLowerCase();
        }
        return countryCode.substr(0, 2).toLowerCase();
    }
    return ('' + countryCode).toLowerCase();
}
function getNativeLanguage(lang) {
    const locale = lang && lang.length === 3 ? getISO2Locale(lang) : lang;
    const isoLocales = {
        ab: 'аҧсуа',
        aa: 'Afaraf',
        af: 'Afrikaans',
        ak: 'Akan',
        sq: 'Shqip',
        am: 'አማርኛ',
        ar: 'العربية',
        an: 'Aragonés',
        hy: 'Հայերեն',
        as: 'অসমীয়া',
        av: 'авар мацӀ, магӀарул мацӀ',
        ae: 'avesta',
        ay: 'aymar aru',
        az: 'azərbaycan dili',
        bm: 'bamanankan',
        ba: 'башҡорт теле',
        eu: 'euskara, euskera',
        be: 'Беларуская',
        bn: 'বাংলা',
        bh: 'भोजपुरी',
        bi: 'Bislama',
        bs: 'bosanski jezik',
        br: 'brezhoneg',
        bg: 'български език',
        my: 'ဗမာစာ',
        ca: 'Català',
        ch: 'Chamoru',
        ce: 'нохчийн мотт',
        ny: 'chiCheŵa, chinyanja',
        zh: '中文 (Zhōngwén), 汉语, 漢語',
        cv: 'чӑваш чӗлхи',
        kw: 'Kernewek',
        co: 'corsu, lingua corsa',
        cr: 'ᓀᐦᐃᔭᐍᐏᐣ',
        hr: 'hrvatski',
        cs: 'čeština',
        da: 'dansk',
        dv: 'ދިވެހި',
        nl: 'Nederlands',
        en: 'English',
        eo: 'Esperanto',
        et: 'eesti',
        ee: 'Eʋegbe',
        fo: 'føroyskt',
        fj: 'vosa Vakaviti',
        fi: 'suomi',
        fr: 'français',
        ff: 'Fulfulde, Pulaar, Pular',
        gl: 'Galego',
        ka: 'ქართული',
        de: 'Deutsch',
        el: 'Ελληνικά',
        gn: 'Avañeẽ',
        gu: 'ગુજરાતી',
        ht: 'Kreyòl ayisyen',
        ha: 'Hausa, هَوُسَ',
        he: 'עברית',
        hz: 'Otjiherero',
        hi: 'हिन्दी, हिंदी',
        ho: 'Hiri Motu',
        hu: 'Magyar',
        ia: 'Interlingua',
        id: 'Bahasa Indonesia',
        ie: 'Interlingue',
        ga: 'Gaeilge',
        ig: 'Asụsụ Igbo',
        ik: 'Iñupiaq',
        io: 'Ido',
        is: 'Íslenska',
        it: 'Italiano',
        iu: 'ᐃᓄᒃᑎᑐᑦ',
        ja: '日本語',
        jv: 'basa Jawa',
        kl: 'kalaallisut, kalaallit oqaasii',
        kn: 'ಕನ್ನಡ',
        kr: 'Kanuri',
        ks: 'कश्मीरी, كشميري‎',
        kk: 'Қазақ тілі',
        km: 'ភាសាខ្មែរ',
        ki: 'Gĩkũyũ',
        rw: 'Ikinyarwanda',
        ky: 'кыргыз тили',
        kv: 'коми кыв',
        kg: 'KiKongo',
        ko: '한국어 (韓國語), 조선말 (朝鮮語)',
        ku: 'كوردی‎',
        kj: 'Kuanyama',
        la: 'latine',
        lb: 'Lëtzebuergesch',
        lg: 'Luganda',
        li: 'Limburgs',
        ln: 'Lingála',
        lo: 'ພາສາລາວ',
        lt: 'lietuvių kalba',
        lu: 'Luba-Katanga',
        lv: 'latviešu valoda',
        gv: 'Gaelg, Gailck',
        mk: 'македонски јазик',
        mg: 'Malagasy fiteny',
        ms: 'bahasa Melayu, بهاس ملايو‎',
        ml: 'മലയാളം',
        mt: 'Malti',
        mi: 'te reo Māori',
        mr: 'मराठी',
        mh: 'Kajin M̧ajeļ',
        mn: 'монгол',
        na: 'Ekakairũ Naoero',
        nv: 'Diné bizaad, Dinékʼehǰí',
        nb: 'Norsk bokmål',
        nd: 'isiNdebele',
        ne: 'नेपाली',
        ng: 'Owambo',
        nn: 'Norsk nynorsk',
        no: 'Norsk',
        ii: 'ꆈꌠ꒿ Nuosuhxop',
        nr: 'isiNdebele',
        oc: 'Occitan',
        oj: 'ᐊᓂᔑᓈᐯᒧᐎᓐ',
        cu: 'ѩзыкъ словѣньскъ',
        om: 'Afaan Oromoo',
        or: 'ଓଡ଼ିଆ',
        os: 'ирон æвзаг',
        pa: 'ਪੰਜਾਬੀ, پنجابی‎',
        pi: 'पाऴि',
        fa: 'فارسی',
        pl: 'polski',
        ps: 'پښتو',
        pt: 'Português',
        qu: 'Runa Simi, Kichwa',
        rm: 'rumantsch grischun',
        rn: 'kiRundi',
        ro: 'română',
        ru: 'русский',
        sa: 'संस्कृतम्',
        sc: 'sardu',
        sd: 'सिन्धी, سنڌي، سندھی‎',
        se: 'Davvisámegiella',
        sm: 'gagana faa Samoa',
        sg: 'yângâ tî sängö',
        sr: 'српски језик',
        gd: 'Gàidhlig',
        sn: 'chiShona',
        si: 'සිංහල',
        sk: 'slovenčina',
        sl: 'slovenščina',
        so: 'Soomaaliga, af Soomaali',
        st: 'Sesotho',
        es: 'español',
        su: 'Basa Sunda',
        sw: 'Kiswahili',
        ss: 'SiSwati',
        sv: 'svenska',
        ta: 'தமிழ்',
        te: 'తెలుగు',
        tg: 'تاجیکی‎',
        th: 'ไทย',
        ti: 'ትግርኛ',
        bo: 'བོད་ཡིག',
        tk: 'Türkmen',
        tl: 'Wikang Tagalog',
        tn: 'Setswana',
        to: 'faka Tonga',
        tr: 'Türkçe',
        ts: 'Xitsonga',
        tt: 'تاتارچا‎',
        tw: 'Twi',
        ty: 'Reo Tahiti',
        ug: 'ئۇيغۇرچە‎',
        uk: 'українська',
        ur: 'اردو',
        uz: 'zbek, Ўзбек, أۇزبېك‎',
        ve: 'Tshivenḓa',
        vi: 'Tiếng Việt',
        vo: 'Volapük',
        wa: 'Walon',
        cy: 'Cymraeg',
        wo: 'Wollof',
        fy: 'Frysk',
        xh: 'isiXhosa',
        yi: 'ייִדיש',
        yo: 'Yorùbá',
        za: 'Saɯ cueŋƅ, Saw cuengh',
        mis: 'uncoded languages',
        mul: 'multiple languages',
        und: 'undetermined',
        zxx: 'no linguistic content/not applicable',
    };
    if (locale && isoLocales[locale]) {
        return isoLocales[locale];
    }
    return locale;
}


/***/ }),

/***/ "./src/utils/platform.ts":
/*!*******************************!*\
  !*** ./src/utils/platform.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   supportsHLS: () => (/* binding */ supportsHLS),
/* harmony export */   supportsNativeHLS: () => (/* binding */ supportsNativeHLS)
/* harmony export */ });
function supportsNativeHLS() {
    return videojs.browser.IS_ANY_SAFARI && videojs.browser.IS_IOS;
}
function supportsHLS() {
    return videojs.browser.IS_ANY_SAFARI || videojs.browser.IS_IOS;
}


/***/ }),

/***/ "./src/video-player/hotkeys.ts":
/*!*************************************!*\
  !*** ./src/video-player/hotkeys.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   hotkeys: () => (/* binding */ hotkeys)
/* harmony export */ });
const PlayToggle = videojs.getComponent('PlayToggle');
function hotkeys(options) {
    return function (event) {
        switch (event.key) {
            case ' ':
                PlayToggle.prototype.handleClick.call(this, event);
                break;
            case 'ArrowLeft':
                skip(this, options.backward);
                break;
            case 'ArrowRight':
                skip(this, options.forward);
                break;
        }
    };
}
function skip(component, skipTime) {
    const currentVideoTime = component.currentTime();
    const liveTracker = component.liveTracker;
    const duration = liveTracker && liveTracker.isLive() ? liveTracker.seekableEnd() : component.duration();
    let newTime = currentVideoTime + skipTime;
    if (newTime > duration) {
        newTime = duration;
    }
    else if (newTime < 0) {
        newTime = 0;
    }
    component.currentTime(newTime);
}


/***/ }),

/***/ "./src/video-player/plugins/audio-track-button.ts":
/*!********************************************************!*\
  !*** ./src/video-player/plugins/audio-track-button.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CustomAudioTrackButton: () => (/* binding */ CustomAudioTrackButton)
/* harmony export */ });
/* harmony import */ var _utils_locale__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/locale */ "./src/utils/locale.ts");

const AudioTrackButton = videojs.getComponent('audioTrackButton');
const MenuItem = videojs.getComponent('menuItem');
// based on AudioTrackMenuItem
class CustomAudioTrackMenuItem extends MenuItem {
    constructor(player, options) {
        const track = options.track;
        const tracks = player.audioTracks();
        // AP: Modify options for parent MenuItem class's init.
        options.label = (0,_utils_locale__WEBPACK_IMPORTED_MODULE_0__.getNativeLanguage)(track.language || track.label) || 'Unknown';
        options.selected = track.enabled;
        super(player, options);
        this.track = track;
        this.addClass(`vjs-${track.kind}-menu-item`);
        const changeHandler = (...args) => {
            this.handleTracksChange.apply(this, args);
        };
        tracks.addEventListener('change', changeHandler);
        this.on('dispose', () => {
            tracks.removeEventListener('change', changeHandler);
        });
    }
    createEl(type, props, attrs) {
        const el = super.createEl(type, props, attrs);
        const parentSpan = el.querySelector('.vjs-menu-item-text');
        if (this.options_.track.kind === 'main-desc') {
            parentSpan.appendChild(super.createEl('span', {
                className: 'vjs-icon-placeholder',
            }, {
                'aria-hidden': true,
            }));
            parentSpan.appendChild(super.createEl('span', {
                className: 'vjs-control-text',
                textContent: ' ' + this.localize('Descriptions'),
            }));
        }
        return el;
    }
    handleClick(event) {
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
    handleTracksChange(event) {
        this.selected(this.track.enabled);
    }
}
class CustomAudioTrackButton extends AudioTrackButton {
    constructor(player, options) {
        super(player);
    }
    createItems(items = []) {
        // if there's only one audio track, there no point in showing it
        this.hideThreshold_ = 1;
        const tracks = this.player_.audioTracks();
        for (let i = 0; i < tracks.length; i++) {
            const track = tracks[i];
            items.push(new CustomAudioTrackMenuItem(this.player_, {
                track,
                // MenuItem is selectable
                selectable: true,
                // MenuItem is NOT multiSelectable (i.e. only one can be marked "selected" at a time)
                multiSelectable: false,
            }));
        }
        return items;
    }
}


/***/ }),

/***/ "./src/video-player/plugins/chromecast-button.ts":
/*!*******************************************************!*\
  !*** ./src/video-player/plugins/chromecast-button.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ChromecastButton: () => (/* binding */ ChromecastButton)
/* harmony export */ });
const Component = videojs.getComponent('component');
class ChromecastButton extends Component {
    constructor(player, options) {
        super(player, options);
    }
    createEl() {
        const el = super.createEl();
        const castEl = document.createElement('button', 'google-cast-button');
        castEl.className = 'vjs-chromecast-button';
        el.appendChild(castEl);
        return el;
    }
}


/***/ }),

/***/ "./src/video-player/plugins/custom-overlay.ts":
/*!****************************************************!*\
  !*** ./src/video-player/plugins/custom-overlay.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CustomOverlay: () => (/* binding */ CustomOverlay)
/* harmony export */ });
const Component = videojs.getComponent('Component');
class CustomOverlay extends Component {
    createEl() {
        return this.options_.element;
    }
}


/***/ }),

/***/ "./src/video-player/plugins/overlay.ts":
/*!*********************************************!*\
  !*** ./src/video-player/plugins/overlay.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Overlay: () => (/* binding */ Overlay)
/* harmony export */ });
const Component = videojs.getComponent('Component');
const dom = videojs.dom || videojs;
class Overlay extends Component {
    createEl() {
        const el = dom.createEl('div', {
            className: `vjs-overlay`,
        });
        if (this.options_.element) {
            el.appendChild(this.options_.element.cloneNode(true));
        }
        return el;
    }
}


/***/ }),

/***/ "./src/video-player/plugins/playback-rate-button.ts":
/*!**********************************************************!*\
  !*** ./src/video-player/plugins/playback-rate-button.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CustomPlaybackRateMenuButton: () => (/* binding */ CustomPlaybackRateMenuButton)
/* harmony export */ });
const PlaybackRateMenuButton = videojs.getComponent('playbackRateMenuButton');
class CustomPlaybackRateMenuButton extends PlaybackRateMenuButton {
    constructor(player, options) {
        super(player);
    }
    createEl() {
        const el = super.createEl();
        el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="vjs-playback-rate-svg">
            <path d="M0 0h24v24H0z" fill="none"/>
            <path class="vjs-custom-svg-color" d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44zm-9.79 6.84a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z"/></svg>`;
        return el;
    }
}


/***/ }),

/***/ "./src/video-player/plugins/subtitles-button.ts":
/*!******************************************************!*\
  !*** ./src/video-player/plugins/subtitles-button.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CustomSubtitlesButton: () => (/* binding */ CustomSubtitlesButton),
/* harmony export */   CustomTextTrackButton: () => (/* binding */ CustomTextTrackButton)
/* harmony export */ });
/* harmony import */ var _utils_locale__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/locale */ "./src/utils/locale.ts");

const SubtitlesButton = videojs.getComponent('textTrackButton');
const MenuItem = videojs.getComponent('menuItem');
const OffTextTrackMenuItem = videojs.getComponent('offTextTrackMenuItem');
// based on TextTrackMenuItem
class CustomTextTrackMenuItem extends MenuItem {
    constructor(player, options) {
        const track = options.track;
        const tracks = player.textTracks();
        // Modify options for parent MenuItem class's init.
        options.label = (0,_utils_locale__WEBPACK_IMPORTED_MODULE_0__.getNativeLanguage)(track.language || track.label) || 'Unknown';
        options.selected = track.mode === 'showing';
        super(player, options);
        this.track = track;
        // Determine the relevant kind(s) of tracks for this component and filter
        // out empty kinds.
        this.kinds = (options.kinds || [options.kind || this.track.kind]).filter(Boolean);
        const changeHandler = (...args) => {
            this.handleTracksChange.apply(this, args);
        };
        const selectedLanguageChangeHandler = (...args) => {
            this.handleSelectedLanguageChange.apply(this, args);
        };
        player.on(['loadstart', 'texttrackchange'], changeHandler);
        tracks.addEventListener('change', changeHandler);
        tracks.addEventListener('selectedlanguagechange', selectedLanguageChangeHandler);
        this.on('dispose', function () {
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
            let event;
            this.on(['tap', 'click'], function () {
                if (typeof window.Event !== 'object') {
                    // Android 2.3 throws an Illegal Constructor error for window.Event
                    try {
                        event = new window.Event('change');
                    }
                    catch (err) {
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
    handleClick(event) {
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
            }
            else if (track.mode !== 'disabled') {
                track.mode = 'disabled';
            }
        }
    }
    handleTracksChange(event) {
        const shouldBeSelected = this.track.mode === 'showing';
        // Prevent redundant selected() calls because they may cause
        // screen readers to read the appended control text unnecessarily
        if (shouldBeSelected !== this.isSelected_) {
            this.selected(shouldBeSelected);
        }
    }
    handleSelectedLanguageChange(event) {
        if (this.track.mode === 'showing') {
            const selectedLanguage = this.player_.cache_.selectedLanguage;
            // Don't replace the kind of track across the same language
            if (selectedLanguage &&
                selectedLanguage.enabled &&
                selectedLanguage.language === this.track.language &&
                selectedLanguage.kind !== this.track.kind) {
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
    constructor(player, options = {}) {
        options.tracks = player.textTracks();
        super(player, options);
    }
    createItems(items = [], TrackMenuItem = CustomTextTrackMenuItem) {
        // Label is an override for the [track] off label
        // USed to localise captions/subtitles
        let label;
        if (this.label_) {
            label = `${this.label_} off`;
        }
        // Add an OFF menu item to turn all tracks off
        items.push(new OffTextTrackMenuItem(this.player_, {
            kinds: this.kinds_,
            kind: this.kind_,
            label,
        }));
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
    constructor(player, options, ready) {
        super(player, options);
        this.setIcon('subtitles');
    }
    buildCSSClass() {
        return `vjs-subtitles-button ${super.buildCSSClass()}`;
    }
    buildWrapperCSSClass() {
        return `vjs-subtitles-button ${super.buildWrapperCSSClass()}`;
    }
}
CustomSubtitlesButton.prototype.kind_ = 'subtitles';


/***/ }),

/***/ "./src/video-player/video-player.ts":
/*!******************************************!*\
  !*** ./src/video-player/video-player.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VideoPlayer: () => (/* binding */ VideoPlayer)
/* harmony export */ });
/* harmony import */ var _utils_platform__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/platform */ "./src/utils/platform.ts");
/* harmony import */ var _logging_player_logger_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../logging/player-logger-service */ "./src/logging/player-logger-service.ts");
/* harmony import */ var _models_player__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../models/player */ "./src/models/player.ts");
/* harmony import */ var _utils_eme__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/eme */ "./src/utils/eme.ts");
/* harmony import */ var _plugins_playback_rate_button__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./plugins/playback-rate-button */ "./src/video-player/plugins/playback-rate-button.ts");
/* harmony import */ var _plugins_audio_track_button__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./plugins/audio-track-button */ "./src/video-player/plugins/audio-track-button.ts");
/* harmony import */ var _hotkeys__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./hotkeys */ "./src/video-player/hotkeys.ts");
/* harmony import */ var _utils_locale__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../utils/locale */ "./src/utils/locale.ts");
/* harmony import */ var _plugins_subtitles_button__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./plugins/subtitles-button */ "./src/video-player/plugins/subtitles-button.ts");
/* harmony import */ var _plugins_chromecast_button__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./plugins/chromecast-button */ "./src/video-player/plugins/chromecast-button.ts");
/* harmony import */ var _plugins_overlay__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./plugins/overlay */ "./src/video-player/plugins/overlay.ts");
/* harmony import */ var _plugins_custom_overlay__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./plugins/custom-overlay */ "./src/video-player/plugins/custom-overlay.ts");












class VideoPlayer {
    constructor(baseUrl, projectId) {
        this.player = null;
        this.playerLoggerService = new _logging_player_logger_service__WEBPACK_IMPORTED_MODULE_1__.PlayerLoggerService(baseUrl, projectId);
        videojs.registerComponent('customAudioTrackButton', _plugins_audio_track_button__WEBPACK_IMPORTED_MODULE_5__.CustomAudioTrackButton);
        videojs.registerComponent('customTextTrackButton', _plugins_subtitles_button__WEBPACK_IMPORTED_MODULE_8__.CustomTextTrackButton);
        videojs.registerComponent('customSubtitlesButton', _plugins_subtitles_button__WEBPACK_IMPORTED_MODULE_8__.CustomSubtitlesButton);
        videojs.registerComponent('customPlaybackRateMenuButton', _plugins_playback_rate_button__WEBPACK_IMPORTED_MODULE_4__.CustomPlaybackRateMenuButton);
        videojs.registerComponent('chromecastButton', _plugins_chromecast_button__WEBPACK_IMPORTED_MODULE_9__.ChromecastButton);
        videojs.registerComponent('overlay', _plugins_overlay__WEBPACK_IMPORTED_MODULE_10__.Overlay);
        videojs.registerComponent('customOverlay', _plugins_custom_overlay__WEBPACK_IMPORTED_MODULE_11__.CustomOverlay);
    }
    init(initParams) {
        this.destroy();
        const videoContainer = initParams.selector instanceof Element ? initParams.selector : document.querySelector(initParams.selector);
        if (!videoContainer) {
            throw Error('Invalid selector or element for player');
        }
        this.playerLoggerService.init();
        const videoElement = document.createElement('video');
        videoElement.setAttribute('class', ['video-js', 'vjs-default-skin'].join(' '));
        videoElement.setAttribute('tabIndex', '0');
        videoElement.setAttribute('width', '100%');
        videoElement.setAttribute('height', '100%');
        videoContainer.appendChild(videoElement);
        const playOptions = {
            fluid: false,
            fill: true,
            responsive: true,
            controls: true,
            controlBar: {
                pictureInPictureToggle: false,
                currentTimeDisplay: true,
                durationDisplay: true,
                timeDivider: false,
                volumePanel: {
                    inline: false,
                },
                chromecastButton: !!initParams.chromecastButton,
                // order of elements:
                children: [
                    'playToggle',
                    'currentTimeDisplay',
                    'progressControl',
                    'durationDisplay',
                    'customPlaybackRateMenuButton',
                    'customSubtitlesButton',
                    'customAudioTrackButton',
                    'volumePanel',
                    'chromecastButton',
                    'fullscreenToggle',
                ],
            },
            userActions: {
                hotkeys: (0,_hotkeys__WEBPACK_IMPORTED_MODULE_6__.hotkeys)({ backward: -30, forward: 30 }),
            },
            html5: {
                vhs: {
                    // do to use videojs-http-streaming if it's natively supported
                    overrideNative: !(0,_utils_platform__WEBPACK_IMPORTED_MODULE_0__.supportsNativeHLS)(),
                    cacheEncryptionKeys: true,
                },
            },
            ...initParams.options,
        };
        this.player = videojs(videoElement, playOptions);
        this.player.eme();
        this.bindEvents();
    }
    play(playConfig, initParams) {
        this.firstPlayingEvent = true;
        if (!this.player || (this.player && this.player.currentSrc())) {
            this.destroy();
            this.init(initParams);
        }
        this.articlePlayConfig = playConfig;
        this.playerLoggerService.onStart(playConfig.pulseToken, _models_player__WEBPACK_IMPORTED_MODULE_2__.PlayerDeviceTypes.default, playConfig.localTimeDelta, true);
        const hlsSources = playConfig.entitlements.filter(entitlement => entitlement.type === 'application/vnd.apple.mpegurl');
        const configureHLSOnly = (0,_utils_platform__WEBPACK_IMPORTED_MODULE_0__.supportsHLS)() && hlsSources.length > 0; // make sure there is actually HLS
        const playSources = playConfig.entitlements
            .map(entitlement => {
            const emeOptions = (0,_utils_eme__WEBPACK_IMPORTED_MODULE_3__.getEmeOptionsFromEntitlement)(entitlement);
            return {
                src: entitlement.src,
                type: entitlement.type,
                ...emeOptions,
            };
        })
            .filter(playOption => {
            return ((playOption.type === 'application/vnd.apple.mpegurl' && configureHLSOnly) ||
                (playOption.type !== 'application/vnd.apple.mpegurl' && !configureHLSOnly));
        });
        this.player.src(playSources);
        if (initParams.fullscreen) {
            this.player.requestFullscreen();
        }
        if (!configureHLSOnly) {
            // non HLS only needs the text tracks
            playConfig.subtitles.forEach(track => {
                this.player.addRemoteTextTrack({
                    kind: track.kind,
                    src: track.src,
                    srclang: track.srclang,
                    label: track.label,
                    enabled: track.srclang === playConfig.subtitleLocale,
                });
            });
        }
    }
    setPoster(posterUrl) {
        this.player.poster(posterUrl);
    }
    destroy() {
        if (this.player) {
            if (false === this.player.ended()) {
                this.player.pause();
                // only if we have not already caught the 'ended' event
                // Be aware that the `stopped` emit also send along all kinds of info, so call _before_ disposing player
                this.playerLoggerService.onStop();
            }
            this.player.dispose();
        }
        this.playerLoggerService.destroy();
        this.player = null;
    }
    getPlayer() {
        return this.player;
    }
    bindEvents() {
        this.player.on('error', () => {
            this.playerLoggerService.onError(JSON.stringify(this.player.error()));
        });
        this.player.on('playing', () => {
            if (this.firstPlayingEvent) {
                this.firstPlayingEvent = false;
                if (this.articlePlayConfig.currentTime > 0) {
                    this.player.currentTime(this.articlePlayConfig.currentTime);
                }
            }
            this.checkSelectedTracks();
            this.playerLoggerService.onPlaying();
        });
        this.player.on('pause', () => {
            this.checkSelectedTracks();
            if (this.player.paused() && !this.player.ended()) {
                this.playerLoggerService.onPause();
            }
        });
        this.player.on('ended', () => {
            this.checkSelectedTracks();
            this.playerLoggerService.onStop();
        });
        this.player.on('timeupdate', () => {
            this.checkSelectedTracks();
            this.playerLoggerService.onCurrentTimeUpdated(this.player.currentTime() || 0);
        });
        this.player.on('durationchange', () => {
            this.checkSelectedTracks();
            this.playerLoggerService.onDurationUpdated(this.player.duration());
        });
        this.player.on('loadedmetadata', () => {
            const audioTrackList = this.player.audioTracks();
            if (audioTrackList && audioTrackList.length > 0) {
                // set default tracks when available
                this.setDefaultAudioTrack();
                this.setDefaultTextTrack();
                this.metadataLoaded = true;
            }
            else {
                // unfortunately there is no reliable way to know when iOS native binding to text-tracks is done
                // (even after first play event, this is not true), so we resort to an old fashioned timeout
                setTimeout(() => {
                    this.setDefaultAudioTrack();
                    this.setDefaultTextTrack();
                    this.metadataLoaded = true;
                }, 1000);
            }
        });
    }
    checkSelectedTracks() {
        if (!this.metadataLoaded) {
            return false;
        }
        let selectedAudioTrack = '';
        let selectedTextTrack = '';
        const tracks = this.player.textTracks();
        for (let i = 0; i < tracks.length; i++) {
            if (tracks[i].mode === 'showing' && tracks[i].kind === 'subtitles') {
                selectedTextTrack = tracks[i].language;
            }
        }
        const audioTracks = this.player.audioTracks();
        for (let i = 0; i < audioTracks.length; i++) {
            if (audioTracks[i].enabled) {
                selectedAudioTrack = audioTracks[i].language;
                break;
            }
        }
        this.playerLoggerService.updateProperties({
            textTrack: selectedTextTrack,
            audioTrack: selectedAudioTrack,
        });
        if (this.currentTextTrack !== null && this.currentTextTrack !== selectedTextTrack) {
            this.playerLoggerService.onTextTrackChanged(selectedTextTrack);
        }
        this.currentTextTrack = selectedTextTrack;
        if (this.currentAudioTrack !== null && this.currentAudioTrack !== selectedAudioTrack) {
            this.playerLoggerService.onAudioTrackChanged(selectedAudioTrack);
        }
        this.currentAudioTrack = selectedAudioTrack;
    }
    setDefaultTextTrack() {
        if (this.articlePlayConfig.subtitleLocale) {
            const tracks = this.player.textTracks();
            for (let i = 0; i < tracks.length; i++) {
                // textTracks is not a real array so no iterators here
                if (tracks[i].mode !== 'disabled') {
                    tracks[i].mode = 'disabled';
                }
            }
            // it must be split up in to two loops, because two 'showing' items will break
            for (let i = 0; i < tracks.length; i++) {
                const trackLocale = (0,_utils_locale__WEBPACK_IMPORTED_MODULE_7__.getISO2Locale)(tracks[i].language);
                if (trackLocale === this.articlePlayConfig.subtitleLocale.toLowerCase() && tracks[i].kind === 'subtitles') {
                    tracks[i].mode = 'showing';
                    break;
                }
            }
        }
    }
    setDefaultAudioTrack() {
        if (this.articlePlayConfig.audioLocale) {
            const audioTracks = this.player.audioTracks();
            for (let i = 0; i < audioTracks.length; i++) {
                const trackLocale = (0,_utils_locale__WEBPACK_IMPORTED_MODULE_7__.getISO2Locale)(audioTracks[i].language);
                if ((this.articlePlayConfig.audioLocale && trackLocale === this.articlePlayConfig.audioLocale.toLowerCase()) ||
                    (this.articlePlayConfig.audioLocale === '' && i === 0)) {
                    audioTracks[i].enabled = true;
                    break;
                }
            }
        }
    }
}


/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ChromecastControls: () => (/* reexport safe */ _chromecast_chromecast_controls__WEBPACK_IMPORTED_MODULE_2__.ChromecastControls),
/* harmony export */   ChromecastSender: () => (/* reexport safe */ _chromecast_chromecast_sender__WEBPACK_IMPORTED_MODULE_3__.ChromecastSender),
/* harmony export */   EmbedPlayer: () => (/* reexport safe */ _embed_player__WEBPACK_IMPORTED_MODULE_0__.EmbedPlayer),
/* harmony export */   VideoPlayer: () => (/* reexport safe */ _video_player_video_player__WEBPACK_IMPORTED_MODULE_1__.VideoPlayer),
/* harmony export */   supportsNativeHLS: () => (/* reexport safe */ _utils_platform__WEBPACK_IMPORTED_MODULE_4__.supportsNativeHLS)
/* harmony export */ });
/* harmony import */ var _embed_player__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./embed-player */ "./src/embed-player.ts");
/* harmony import */ var _video_player_video_player__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./video-player/video-player */ "./src/video-player/video-player.ts");
/* harmony import */ var _chromecast_chromecast_controls__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./chromecast/chromecast-controls */ "./src/chromecast/chromecast-controls.ts");
/* harmony import */ var _chromecast_chromecast_sender__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./chromecast/chromecast-sender */ "./src/chromecast/chromecast-sender.ts");
/* harmony import */ var _utils_platform__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./utils/platform */ "./src/utils/platform.ts");







})();

var __webpack_exports__ChromecastControls = __webpack_exports__.ChromecastControls;
var __webpack_exports__ChromecastSender = __webpack_exports__.ChromecastSender;
var __webpack_exports__EmbedPlayer = __webpack_exports__.EmbedPlayer;
var __webpack_exports__VideoPlayer = __webpack_exports__.VideoPlayer;
var __webpack_exports__supportsNativeHLS = __webpack_exports__.supportsNativeHLS;
export { __webpack_exports__ChromecastControls as ChromecastControls, __webpack_exports__ChromecastSender as ChromecastSender, __webpack_exports__EmbedPlayer as EmbedPlayer, __webpack_exports__VideoPlayer as VideoPlayer, __webpack_exports__supportsNativeHLS as supportsNativeHLS };

//# sourceMappingURL=bundle.js.map