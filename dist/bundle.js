/******/ var __webpack_modules__ = {
    /***/ './node_modules/detect-browser/es/index.js':
        /*!*************************************************!*\
  !*** ./node_modules/detect-browser/es/index.js ***!
  \*************************************************/
        /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            __webpack_require__.r(__webpack_exports__);
            /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                /* harmony export */ BotInfo: () => /* binding */ BotInfo,
                /* harmony export */ BrowserInfo: () => /* binding */ BrowserInfo,
                /* harmony export */ NodeInfo: () => /* binding */ NodeInfo,
                /* harmony export */ ReactNativeInfo: () => /* binding */ ReactNativeInfo,
                /* harmony export */ SearchBotDeviceInfo: () => /* binding */ SearchBotDeviceInfo,
                /* harmony export */ browserName: () => /* binding */ browserName,
                /* harmony export */ detect: () => /* binding */ detect,
                /* harmony export */ detectOS: () => /* binding */ detectOS,
                /* harmony export */ getNodeVersion: () => /* binding */ getNodeVersion,
                /* harmony export */ parseUserAgent: () => /* binding */ parseUserAgent,
                /* harmony export */
            });
            var __spreadArray =
                (undefined && undefined.__spreadArray) ||
                function(to, from, pack) {
                    if (pack || arguments.length === 2)
                        for (var i = 0, l = from.length, ar; i < l; i++) {
                            if (ar || !(i in from)) {
                                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                                ar[i] = from[i];
                            }
                        }
                    return to.concat(ar || Array.prototype.slice.call(from));
                };
            var BrowserInfo = /** @class */ (function() {
                function BrowserInfo(name, version, os) {
                    this.name = name;
                    this.version = version;
                    this.os = os;
                    this.type = 'browser';
                }
                return BrowserInfo;
            })();

            var NodeInfo = /** @class */ (function() {
                function NodeInfo(version) {
                    this.version = version;
                    this.type = 'node';
                    this.name = 'node';
                    this.os = process.platform;
                }
                return NodeInfo;
            })();

            var SearchBotDeviceInfo = /** @class */ (function() {
                function SearchBotDeviceInfo(name, version, os, bot) {
                    this.name = name;
                    this.version = version;
                    this.os = os;
                    this.bot = bot;
                    this.type = 'bot-device';
                }
                return SearchBotDeviceInfo;
            })();

            var BotInfo = /** @class */ (function() {
                function BotInfo() {
                    this.type = 'bot';
                    this.bot = true; // NOTE: deprecated test name instead
                    this.name = 'bot';
                    this.version = null;
                    this.os = null;
                }
                return BotInfo;
            })();

            var ReactNativeInfo = /** @class */ (function() {
                function ReactNativeInfo() {
                    this.type = 'react-native';
                    this.name = 'react-native';
                    this.version = null;
                    this.os = null;
                }
                return ReactNativeInfo;
            })();

            // tslint:disable-next-line:max-line-length
            var SEARCHBOX_UA_REGEX = /alexa|bot|crawl(er|ing)|facebookexternalhit|feedburner|google web preview|nagios|postrank|pingdom|slurp|spider|yahoo!|yandex/;
            var SEARCHBOT_OS_REGEX = /(nuhk|curl|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask\ Jeeves\/Teoma|ia_archiver)/;
            var REQUIRED_VERSION_PARTS = 3;
            var userAgentRules = [
                ['aol', /AOLShield\/([0-9\._]+)/],
                ['edge', /Edge\/([0-9\._]+)/],
                ['edge-ios', /EdgiOS\/([0-9\._]+)/],
                ['yandexbrowser', /YaBrowser\/([0-9\._]+)/],
                ['kakaotalk', /KAKAOTALK\s([0-9\.]+)/],
                ['samsung', /SamsungBrowser\/([0-9\.]+)/],
                ['silk', /\bSilk\/([0-9._-]+)\b/],
                ['miui', /MiuiBrowser\/([0-9\.]+)$/],
                ['beaker', /BeakerBrowser\/([0-9\.]+)/],
                ['edge-chromium', /EdgA?\/([0-9\.]+)/],
                ['chromium-webview', /(?!Chrom.*OPR)wv\).*Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/],
                ['chrome', /(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/],
                ['phantomjs', /PhantomJS\/([0-9\.]+)(:?\s|$)/],
                ['crios', /CriOS\/([0-9\.]+)(:?\s|$)/],
                ['firefox', /Firefox\/([0-9\.]+)(?:\s|$)/],
                ['fxios', /FxiOS\/([0-9\.]+)/],
                ['opera-mini', /Opera Mini.*Version\/([0-9\.]+)/],
                ['opera', /Opera\/([0-9\.]+)(?:\s|$)/],
                ['opera', /OPR\/([0-9\.]+)(:?\s|$)/],
                ['pie', /^Microsoft Pocket Internet Explorer\/(\d+\.\d+)$/],
                ['pie', /^Mozilla\/\d\.\d+\s\(compatible;\s(?:MSP?IE|MSInternet Explorer) (\d+\.\d+);.*Windows CE.*\)$/],
                ['netfront', /^Mozilla\/\d\.\d+.*NetFront\/(\d.\d)/],
                ['ie', /Trident\/7\.0.*rv\:([0-9\.]+).*\).*Gecko$/],
                ['ie', /MSIE\s([0-9\.]+);.*Trident\/[4-7].0/],
                ['ie', /MSIE\s(7\.0)/],
                ['bb10', /BB10;\sTouch.*Version\/([0-9\.]+)/],
                ['android', /Android\s([0-9\.]+)/],
                ['ios', /Version\/([0-9\._]+).*Mobile.*Safari.*/],
                ['safari', /Version\/([0-9\._]+).*Safari/],
                ['facebook', /FB[AS]V\/([0-9\.]+)/],
                ['instagram', /Instagram\s([0-9\.]+)/],
                ['ios-webview', /AppleWebKit\/([0-9\.]+).*Mobile/],
                ['ios-webview', /AppleWebKit\/([0-9\.]+).*Gecko\)$/],
                ['curl', /^curl\/([0-9\.]+)$/],
                ['searchbot', SEARCHBOX_UA_REGEX],
            ];
            var operatingSystemRules = [
                ['iOS', /iP(hone|od|ad)/],
                ['Android OS', /Android/],
                ['BlackBerry OS', /BlackBerry|BB10/],
                ['Windows Mobile', /IEMobile/],
                ['Amazon OS', /Kindle/],
                ['Windows 3.11', /Win16/],
                ['Windows 95', /(Windows 95)|(Win95)|(Windows_95)/],
                ['Windows 98', /(Windows 98)|(Win98)/],
                ['Windows 2000', /(Windows NT 5.0)|(Windows 2000)/],
                ['Windows XP', /(Windows NT 5.1)|(Windows XP)/],
                ['Windows Server 2003', /(Windows NT 5.2)/],
                ['Windows Vista', /(Windows NT 6.0)/],
                ['Windows 7', /(Windows NT 6.1)/],
                ['Windows 8', /(Windows NT 6.2)/],
                ['Windows 8.1', /(Windows NT 6.3)/],
                ['Windows 10', /(Windows NT 10.0)/],
                ['Windows ME', /Windows ME/],
                ['Windows CE', /Windows CE|WinCE|Microsoft Pocket Internet Explorer/],
                ['Open BSD', /OpenBSD/],
                ['Sun OS', /SunOS/],
                ['Chrome OS', /CrOS/],
                ['Linux', /(Linux)|(X11)/],
                ['Mac OS', /(Mac_PowerPC)|(Macintosh)/],
                ['QNX', /QNX/],
                ['BeOS', /BeOS/],
                ['OS/2', /OS\/2/],
            ];
            function detect(userAgent) {
                if (!!userAgent) {
                    return parseUserAgent(userAgent);
                }
                if (typeof document === 'undefined' && typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
                    return new ReactNativeInfo();
                }
                if (typeof navigator !== 'undefined') {
                    return parseUserAgent(navigator.userAgent);
                }
                return getNodeVersion();
            }
            function matchUserAgent(ua) {
                // opted for using reduce here rather than Array#first with a regex.test call
                // this is primarily because using the reduce we only perform the regex
                // execution once rather than once for the test and for the exec again below
                // probably something that needs to be benchmarked though
                return (
                    ua !== '' &&
                    userAgentRules.reduce(function(matched, _a) {
                        var browser = _a[0],
                            regex = _a[1];
                        if (matched) {
                            return matched;
                        }
                        var uaMatch = regex.exec(ua);
                        return !!uaMatch && [browser, uaMatch];
                    }, false)
                );
            }
            function browserName(ua) {
                var data = matchUserAgent(ua);
                return data ? data[0] : null;
            }
            function parseUserAgent(ua) {
                var matchedRule = matchUserAgent(ua);
                if (!matchedRule) {
                    return null;
                }
                var name = matchedRule[0],
                    match = matchedRule[1];
                if (name === 'searchbot') {
                    return new BotInfo();
                }
                // Do not use RegExp for split operation as some browser do not support it (See: http://blog.stevenlevithan.com/archives/cross-browser-split)
                var versionParts =
                    match[1] &&
                    match[1]
                        .split('.')
                        .join('_')
                        .split('_')
                        .slice(0, 3);
                if (versionParts) {
                    if (versionParts.length < REQUIRED_VERSION_PARTS) {
                        versionParts = __spreadArray(
                            __spreadArray([], versionParts, true),
                            createVersionParts(REQUIRED_VERSION_PARTS - versionParts.length),
                            true
                        );
                    }
                } else {
                    versionParts = [];
                }
                var version = versionParts.join('.');
                var os = detectOS(ua);
                var searchBotMatch = SEARCHBOT_OS_REGEX.exec(ua);
                if (searchBotMatch && searchBotMatch[1]) {
                    return new SearchBotDeviceInfo(name, version, os, searchBotMatch[1]);
                }
                return new BrowserInfo(name, version, os);
            }
            function detectOS(ua) {
                for (var ii = 0, count = operatingSystemRules.length; ii < count; ii++) {
                    var _a = operatingSystemRules[ii],
                        os = _a[0],
                        regex = _a[1];
                    var match = regex.exec(ua);
                    if (match) {
                        return os;
                    }
                }
                return null;
            }
            function getNodeVersion() {
                var isNode = typeof process !== 'undefined' && process.version;
                return isNode ? new NodeInfo(process.version.slice(1)) : null;
            }
            function createVersionParts(count) {
                var output = [];
                for (var ii = 0; ii < count; ii++) {
                    output.push('0');
                }
                return output;
            }

            /***/
        },

    /***/ './src/api/api-service.ts':
        /*!********************************!*\
  !*** ./src/api/api-service.ts ***!
  \********************************/
        /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            __webpack_require__.r(__webpack_exports__);
            /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                /* harmony export */ ApiService: () => /* binding */ ApiService,
                /* harmony export */
            });
            /* harmony import */ var _graph_request__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
                /*! ./graph-request */ './src/api/graph-request.ts'
            );
            /* harmony import */ var _queries__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./queries */ './src/api/queries.ts');
            /* harmony import */ var _converters__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(
                /*! ./converters */ './src/api/converters.ts'
            );

            class ApiService {
                init(baseUrl, projectId) {
                    this.apiFetchUrl = `${baseUrl}/graphql/${projectId}`.replace(/\/*$/, '');
                    this.token = null;
                }
                setToken(token) {
                    this.token = token;
                }
                getArticleAssetPlayConfig(articleId, assetId, continueFromPreviousPosition) {
                    return (0, _graph_request__WEBPACK_IMPORTED_MODULE_0__.graphRequest)(
                        this.apiFetchUrl,
                        _queries__WEBPACK_IMPORTED_MODULE_1__.articleAssetPlayMutation,
                        {articleId, assetId, protocols: ['dash', 'mss', 'hls']},
                        this.token
                    ).then(response => {
                        if (!response || !response.data || response.errors) {
                            const {message, code} = response.errors[0];
                            throw {message, code}; // @TODO to play config error
                        }
                        return (0, _converters__WEBPACK_IMPORTED_MODULE_2__.toPlayConfig)(
                            response.data.ArticleAssetPlay,
                            continueFromPreviousPosition
                        );
                    });
                }
                getArticle(articleId, assetId) {
                    return (0, _graph_request__WEBPACK_IMPORTED_MODULE_0__.graphRequest)(
                        this.apiFetchUrl,
                        _queries__WEBPACK_IMPORTED_MODULE_1__.articleQuery,
                        {articleId},
                        this.token
                    ).then(response => {
                        if (!response || !response.data || response.errors) {
                            const {message, code} = response.errors[0];
                            throw {message, code};
                        }
                        return (0, _converters__WEBPACK_IMPORTED_MODULE_2__.toArticle)(response.data.Article, assetId);
                    });
                }
            }

            /***/
        },

    /***/ './src/api/converters.ts':
        /*!*******************************!*\
  !*** ./src/api/converters.ts ***!
  \*******************************/
        /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            __webpack_require__.r(__webpack_exports__);
            /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                /* harmony export */ getMetaValue: () => /* binding */ getMetaValue,
                /* harmony export */ toArticle: () => /* binding */ toArticle,
                /* harmony export */ toPlayConfig: () => /* binding */ toPlayConfig,
                /* harmony export */ toPlayConfigError: () => /* binding */ toPlayConfigError,
                /* harmony export */
            });
            /* harmony import */ var _models_play_config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
                /*! ../models/play-config */ './src/models/play-config.ts'
            );

            function toPlayConfig(config, continueFromPreviousPosition) {
                const timeStamp = Date.parse(config.issued_at);
                const entitlements = [];
                // check if the entitlements contain FPS in order to know when to filter out aes
                const filterAES = !!config.entitlements.find(entitlement => entitlement.encryption_type === 'fps');
                const configEntitlements = filterAES
                    ? config.entitlements.filter(entitlement => {
                          return entitlement.encryption_type !== 'aes';
                      })
                    : config.entitlements;
                const dashWidevine = configEntitlements.find(
                    entitlement =>
                        !!entitlement.token && entitlement.encryption_type === 'cenc' && entitlement.protocol.indexOf('dash') === 0
                );
                const mssPlayReady = configEntitlements.find(
                    entitlement =>
                        !!entitlement.token && entitlement.encryption_type === 'cenc' && entitlement.protocol.indexOf('mss') === 0
                );
                configEntitlements.forEach(configEntitlement => {
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
                        } else if (configEntitlement.encryption_type === 'fps') {
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
                const subtitles = config.subtitles.map(item => ({
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
                    subtitleLocale: config.user_subtitle_locale,
                    audioLocale: config.user_audio_locale,
                    localTimeDelta: isNaN(timeStamp) ? 0 : Date.now() - timeStamp,
                };
            }
            function toArticle(article, assetId) {
                const asset = article.assets.find(item => item.id === assetId);
                return {
                    title: getMetaValue(article.metas, 'title') || article.name,
                    asset: {
                        linkedType: asset.linked_type,
                    },
                };
            }
            function getMetaValue(metas, key) {
                const meta = metas.find(m => m.key === key);
                return meta ? meta.value : '';
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

            /***/
        },

    /***/ './src/api/graph-request.ts':
        /*!**********************************!*\
  !*** ./src/api/graph-request.ts ***!
  \**********************************/
        /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            __webpack_require__.r(__webpack_exports__);
            /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                /* harmony export */ graphRequest: () => /* binding */ graphRequest,
                /* harmony export */
            });
            function graphRequest(apiFetchUrl, query, variables, token) {
                const authHeader = token ? {Authorization: 'Bearer ' + token} : {};
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

            /***/
        },

    /***/ './src/api/queries.ts':
        /*!****************************!*\
  !*** ./src/api/queries.ts ***!
  \****************************/
        /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            __webpack_require__.r(__webpack_exports__);
            /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                /* harmony export */ articleAssetPlayMutation: () => /* binding */ articleAssetPlayMutation,
                /* harmony export */ articleQuery: () => /* binding */ articleQuery,
                /* harmony export */
            });
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
        }
    }
`;

            /***/
        },

    /***/ './src/chromecast/chromecast-controls.ts':
        /*!***********************************************!*\
  !*** ./src/chromecast/chromecast-controls.ts ***!
  \***********************************************/
        /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            __webpack_require__.r(__webpack_exports__);
            /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                /* harmony export */ ChromecastControls: () => /* binding */ ChromecastControls,
                /* harmony export */
            });
            /// <reference path="../../node_modules/@types/chromecast-caf-sender/index.d.ts" />
            class ChromecastControls {
                constructor(player, controller, selector) {
                    this.player = player;
                    this.playerController = controller;
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
                createChromecastControlsTemplate(selector) {
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
                    const element = !!selector ? document.querySelector(selector) : document.body;
                    element.insertAdjacentHTML('beforeend', chromecastControlsTemplateString);
                    this.rootElement = element.querySelector('.chromecast-controls');
                    this.rootElement.querySelector('.button__audio-tracks').addEventListener('click', () => this.toggleTracksDialogue());
                    this.rootElement
                        .querySelector('.chromecast-controls__subtitles__close-icon')
                        .addEventListener('click', () => this.toggleTracksDialogue());
                    this.rootElement.querySelector('.chromecast-controls__progress-bar__slider').addEventListener('input', event => {
                        this.seek(event.target.value);
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
                    const tracksButtonContainerElement = this.getElement('.tracks-button-container');
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
                    let audioTracks = [];
                    let textTracks = [];
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
                    const tracksContainer = this.getElement('.chromecast-controls__subtitles');
                    if (tracksContainer.style.display === 'none') {
                        this.renderTracks();
                        tracksContainer.style.display = 'unset';
                    } else {
                        tracksContainer.style.display = 'none';
                        this.removeTracks();
                    }
                }
                getTracksList(tracks, type) {
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
                getActiveTracksByType(type) {
                    return this.getTracksByType(type)
                        .filter(track => track.active)
                        .map(track => track.id);
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
                setTitle() {
                    if (this.player.mediaInfo) {
                        const titleElement = this.getElement('.chromecast-controls__title');
                        titleElement.innerText = this.player.mediaInfo.metadata.title;
                    }
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
                        event.stopPropagation();
                        const selectedTrackId = event.target.value;
                        const activeTracks = this.getActiveTracksByType(type === 'AUDIO' ? 'TEXT' : 'AUDIO');
                        if (selectedTrackId > 0 && activeTracks.indexOf(selectedTrackId) === -1) {
                            activeTracks.push(selectedTrackId);
                        }
                        this.setActiveTracks(activeTracks);
                    }
                }
                setActiveTracks(trackIds) {
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
                getElement(selector) {
                    return this.rootElement.querySelector(selector);
                }
            }

            /***/
        },

    /***/ './src/chromecast/chromecast-sender.ts':
        /*!*********************************************!*\
  !*** ./src/chromecast/chromecast-sender.ts ***!
  \*********************************************/
        /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            __webpack_require__.r(__webpack_exports__);
            /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                /* harmony export */ ChromecastSender: () => /* binding */ ChromecastSender,
                /* harmony export */
            });
            /// <reference path="../../node_modules/@types/chromecast-caf-sender/index.d.ts" />
            class ChromecastSender {
                constructor() {
                    this.castContext = null;
                    this.castPlayer = null;
                    this.castPlayerController = null;
                }
                init(chromecastReceiverAppId) {
                    return new Promise((resolve, reject) => {
                        if (chromecastReceiverAppId) {
                            window['__onGCastApiAvailable'] = isAvailable => {
                                if (isAvailable && cast && cast.framework) {
                                    this.initializeCastApi(chromecastReceiverAppId);
                                    //Some Chromecast configurations are taking some time to initialize
                                    setTimeout(() => {
                                        resolve();
                                    }, 1000);
                                }
                            };
                            const scriptElement = document.createElement('script');
                            scriptElement.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
                            document.head.appendChild(scriptElement);
                        } else {
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
                }
                getCastMediaInfo(articlePlayConfig, article) {
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
                            } else {
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
                            mediaInfo.metadata.title = article.title;
                            mediaInfo.tracks = tracks;
                            const licenceUrlParam = token
                                ? {
                                      ...this.getLicenseUrlFromSrc(protectionConfig.keyDeliveryUrl, token),
                                  }
                                : {};
                            const audieLocalePram = articlePlayConfig.audioLocale
                                ? {preferredAudioLocale: articlePlayConfig.audioLocale}
                                : {};
                            mediaInfo.customData = {
                                ...licenceUrlParam,
                                ...audieLocalePram,
                                pulseToken: articlePlayConfig.pulseToken,
                            };
                            // @TODO
                            // mediaInfo.currentTime = articlePlayConfig.currentTime;
                            // mediaInfo.autoplay = true;
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
                castVideo(playConfig, article, continueFromPreviousPosition) {
                    if (this.isConnected()) {
                        const castSession = this.castContext.getCurrentSession();
                        const mediaInfo = this.getCastMediaInfo(playConfig, article);
                        if (mediaInfo) {
                            const request = new chrome.cast.media.LoadRequest(mediaInfo);
                            request.currentTime = continueFromPreviousPosition ? playConfig.currentTime : 0;
                            if (playConfig.subtitleLocale) {
                                // can NOT use .filter on tracks because the cast library has patched the Array.
                                const textTrack = mediaInfo.tracks.find(track => track.language === playConfig.subtitleLocale);
                                if (textTrack) {
                                    request.activeTrackIds = [textTrack.trackId];
                                }
                            }
                            return castSession.loadMedia(request);
                        } else {
                            throw {message: 'Unexpected manifest format in articlePlayConfig'};
                        }
                    }
                }
                isConnected() {
                    return this.castPlayer && this.castPlayer.isConnected;
                }
                stopCasting() {
                    const castSession = cast.framework.CastContext.getInstance().getCurrentSession();
                    if (castSession) {
                        castSession.endSession(true);
                    }
                }
                getCastPlayer() {
                    return this.castPlayer;
                }
                getCastPlayerController() {
                    return this.castPlayerController;
                }
            }

            /***/
        },

    /***/ './src/embed-player.ts':
        /*!*****************************!*\
  !*** ./src/embed-player.ts ***!
  \*****************************/
        /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            __webpack_require__.r(__webpack_exports__);
            /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                /* harmony export */ EmbedPlayer: () => /* binding */ EmbedPlayer,
                /* harmony export */
            });
            /* harmony import */ var _video_player_video_player__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
                /*! ./video-player/video-player */ './src/video-player/video-player.ts'
            );
            /* harmony import */ var _chromecast_chromecast_sender__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
                /*! ./chromecast/chromecast-sender */ './src/chromecast/chromecast-sender.ts'
            );
            /* harmony import */ var _api_api_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(
                /*! ./api/api-service */ './src/api/api-service.ts'
            );
            /* harmony import */ var _api_converters__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(
                /*! ./api/converters */ './src/api/converters.ts'
            );

            class EmbedPlayer {
                constructor() {
                    this.videoPlayer = new _video_player_video_player__WEBPACK_IMPORTED_MODULE_0__.VideoPlayer();
                    this.castSender = new _chromecast_chromecast_sender__WEBPACK_IMPORTED_MODULE_1__.ChromecastSender();
                    this.apiService = new _api_api_service__WEBPACK_IMPORTED_MODULE_2__.ApiService();
                }
                play({
                    selector,
                    apiBaseUrl,
                    projectId,
                    articleId,
                    assetId,
                    token,
                    posterImageUrl,
                    autoplay,
                    fullScreen,
                    continueFromPreviousPosition,
                }) {
                    if (!selector) {
                        return Promise.reject('selector property is missing');
                    }
                    if (!apiBaseUrl) {
                        return Promise.reject('apiBaseUrl property is missing');
                    }
                    if (!articleId) {
                        return Promise.reject('articleId property is missing');
                    }
                    if (!assetId) {
                        return Promise.reject('assetId property is missing');
                    }
                    if (!projectId) {
                        return Promise.reject('projectId property is missing');
                    }
                    this.apiService.init(apiBaseUrl, projectId);
                    this.apiService.setToken(token);
                    this.videoPlayer.init(selector, apiBaseUrl, projectId, {autoplay, poster: posterImageUrl});
                    return this.apiService
                        .getArticleAssetPlayConfig(articleId, assetId, continueFromPreviousPosition)
                        .then(config => {
                            this.playVideo(config, posterImageUrl, fullScreen);
                            return config;
                        })
                        .catch(error => {
                            console.log((0, _api_converters__WEBPACK_IMPORTED_MODULE_3__.toPlayConfigError)(error.code));
                            throw error;
                        });
                }
                destroy() {
                    this.videoPlayer.destroy();
                }
                playVideo(config, posterImageUrl, fullScreen) {
                    this.videoPlayer.play(config, posterImageUrl, fullScreen);
                }
                setupChromecast(selector, chromecastReceiverAppId) {
                    const castButtonContaner = selector instanceof Element ? selector : document.querySelector(selector);
                    const castButton = document.createElement('google-cast-launcher');
                    castButtonContaner.appendChild(castButton);
                    return this.castSender.init(chromecastReceiverAppId);
                }
                castVideo({apiBaseUrl, projectId, articleId, assetId, token, continueFromPreviousPosition}) {
                    if (!apiBaseUrl) {
                        return Promise.reject('apiBaseUrl property is missing');
                    }
                    if (!articleId) {
                        return Promise.reject('articleId property is missing');
                    }
                    if (!assetId) {
                        return Promise.reject('assetId property is missing');
                    }
                    if (!projectId) {
                        return Promise.reject('projectId property is missing');
                    }
                    this.apiService.init(apiBaseUrl, projectId);
                    this.apiService.setToken(token);
                    return Promise.all([
                        this.apiService.getArticleAssetPlayConfig(articleId, assetId, continueFromPreviousPosition),
                        this.apiService.getArticle(articleId, assetId),
                    ])
                        .then(([config, article]) => {
                            this.castSender.castVideo(config, article, continueFromPreviousPosition);
                            return config;
                        })
                        .catch(error => {
                            console.log((0, _api_converters__WEBPACK_IMPORTED_MODULE_3__.toPlayConfigError)(error.code));
                            throw error;
                        });
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
                stopCasting() {
                    this.castSender.stopCasting();
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

            /***/
        },

    /***/ './src/logging/player-log-processor.ts':
        /*!*********************************************!*\
  !*** ./src/logging/player-log-processor.ts ***!
  \*********************************************/
        /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            __webpack_require__.r(__webpack_exports__);
            /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                /* harmony export */ PlayerLogProcessor: () => /* binding */ PlayerLogProcessor,
                /* harmony export */
            });
            /* harmony import */ var _models_player__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
                /*! ../models/player */ './src/models/player.ts'
            );

            const MAX_EVENTS = 30;
            class PlayerLogProcessor {
                constructor() {
                    this.playLogs = [];
                    this.apiCallInProgress = false;
                    this.intervalHandle = null;
                }
                init(baseUrl, projectId) {
                    this.apiUrl = `${baseUrl}/service/${projectId}/analytics/stream/pulse/log`.replace(/\/*$/, '');
                    if (this.intervalHandle === null) {
                        this.intervalHandle = setInterval(() => {
                            this.processFirstPlayLog();
                        }, 3000);
                    }
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
                    let i = 0,
                        sumDelta = 0,
                        lastEventWasProcessed = false;
                    while (i < eventStack.length) {
                        const currentEvent = eventStack[i];
                        if (this.isEventTypeWithoutTimeDelta(currentEvent.eventType)) {
                            // directly process these events. they have no sumDelta and do not affect the play state
                            eventStackPayload.push(this.convertEventToEventPayload(currentEvent));
                            lastEventWasProcessed = true;
                        } else {
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
                            lastLogEvent.event_payload = '{code: 429, message: "Too many events"}'; // runaway
                            eventStackPayload.push(lastLogEvent);
                        }
                        // check if there is already a log for this session
                        let playLogPayload = this.getPlayerLogPayloadWithPulseToken(playSession.pulseToken);
                        if (!playLogPayload) {
                            playLogPayload = {
                                event_stack: [],
                                pulse_token: playSession.pulseToken,
                                pulse_mode: playSession.isLive
                                    ? _models_player__WEBPACK_IMPORTED_MODULE_0__.PulseMode.live
                                    : _models_player__WEBPACK_IMPORTED_MODULE_0__.PulseMode.offline,
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
                    let eventStackIndex = 0,
                        isStopCutOff = false;
                    while (eventStackIndex < currentLog.event_stack.length && logToSend.event_stack.length < MAX_EVENTS && !isStopCutOff) {
                        const currentEvent = currentLog.event_stack[eventStackIndex];
                        eventStackIndex++;
                        logToSend.event_stack.push(currentEvent);
                        if (currentEvent.event_type === _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayerEventTypePayloads.stop) {
                            isStopCutOff = true;
                        }
                    }
                    // for offline logging, always accumulate until MAX_EVENTS before sending unless it's a stop cut off.
                    if (
                        logToSend.pulse_mode === _models_player__WEBPACK_IMPORTED_MODULE_0__.PulseMode.offline &&
                        logToSend.event_stack.length < MAX_EVENTS &&
                        !isStopCutOff
                    ) {
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
                            } else {
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
                    return (
                        [
                            _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayerEventTypes.textTrackChanged,
                            _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayerEventTypes.audioTrackChanged,
                            _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayerEventTypes.playStart,
                        ].indexOf(eventType) >= 0
                    );
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
                    const errorPart =
                        playerEvent.state === _models_player__WEBPACK_IMPORTED_MODULE_0__.PlayingState.error
                            ? {event_payload: playerEvent.error}
                            : {};
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

            /***/
        },

    /***/ './src/logging/player-logger-service.ts':
        /*!**********************************************!*\
  !*** ./src/logging/player-logger-service.ts ***!
  \**********************************************/
        /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            __webpack_require__.r(__webpack_exports__);
            /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                /* harmony export */ PlayerLoggerService: () => /* binding */ PlayerLoggerService,
                /* harmony export */
            });
            /* harmony import */ var _player_log_processor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
                /*! ./player-log-processor */ './src/logging/player-log-processor.ts'
            );
            /* harmony import */ var _models_player__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
                /*! ../models/player */ './src/models/player.ts'
            );

            class PlayerLoggerService {
                constructor() {
                    this.intervalHandle = 0;
                    this.playerLogProcessor = new _player_log_processor__WEBPACK_IMPORTED_MODULE_0__.PlayerLogProcessor();
                    this.reset();
                }
                init(baseUrl, projectId) {
                    this.playerLogProcessor.init(baseUrl, projectId);
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
                    if (
                        this.playerProperties.mediaDuration > 0 &&
                        this.playerProperties.state !== _models_player__WEBPACK_IMPORTED_MODULE_1__.PlayingState.idle
                    ) {
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
                        } else {
                            this.playerProperties.state = _models_player__WEBPACK_IMPORTED_MODULE_1__.PlayingState.playing;
                            this.logEvent(_models_player__WEBPACK_IMPORTED_MODULE_1__.PlayerEventTypes.playing);
                        }
                    }
                }
                onPause() {
                    if (this.playerProperties.state !== _models_player__WEBPACK_IMPORTED_MODULE_1__.PlayingState.paused) {
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
                    this.playerLogProcessor.processPlaySession({...this.playSession}, this.getTimeStamp());
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

            /***/
        },

    /***/ './src/models/play-config.ts':
        /*!***********************************!*\
  !*** ./src/models/play-config.ts ***!
  \***********************************/
        /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            __webpack_require__.r(__webpack_exports__);
            /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                /* harmony export */ ArticlePlayErrors: () => /* binding */ ArticlePlayErrors,
                /* harmony export */
            });
            var ArticlePlayErrors;
            (function(ArticlePlayErrors) {
                ArticlePlayErrors['noPlayableAsset'] = 'noPlayableAsset';
                ArticlePlayErrors['notAuthenticated'] = 'notAuthenticated';
                ArticlePlayErrors['needEntitlement'] = 'needEntitlement';
                ArticlePlayErrors['serverError'] = 'serverError';
                ArticlePlayErrors['offlineError'] = 'offlineError';
                ArticlePlayErrors['maxConcurrentStreamNumberError'] = 'maxConcurrentStreamNumberError';
            })(ArticlePlayErrors || (ArticlePlayErrors = {}));

            /***/
        },

    /***/ './src/models/player.ts':
        /*!******************************!*\
  !*** ./src/models/player.ts ***!
  \******************************/
        /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            __webpack_require__.r(__webpack_exports__);
            /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                /* harmony export */ PlayerDeviceTypes: () => /* binding */ PlayerDeviceTypes,
                /* harmony export */ PlayerEventTypePayloads: () => /* binding */ PlayerEventTypePayloads,
                /* harmony export */ PlayerEventTypes: () => /* binding */ PlayerEventTypes,
                /* harmony export */ PlayerLogPayload: () => /* binding */ PlayerLogPayload,
                /* harmony export */ PlayingState: () => /* binding */ PlayingState,
                /* harmony export */ PulseMode: () => /* binding */ PulseMode,
                /* harmony export */
            });
            var PlayingState;
            (function(PlayingState) {
                PlayingState[(PlayingState['loading'] = 0)] = 'loading';
                PlayingState[(PlayingState['playing'] = 1)] = 'playing';
                PlayingState[(PlayingState['paused'] = 2)] = 'paused';
                PlayingState[(PlayingState['idle'] = 3)] = 'idle';
                PlayingState[(PlayingState['buffering'] = 4)] = 'buffering';
                PlayingState[(PlayingState['error'] = 5)] = 'error';
            })(PlayingState || (PlayingState = {}));
            class PlayerLogPayload {}
            // generic abstraction of player events that are taken from the video player, Chromecast and mobile implementations
            var PlayerEventTypes;
            (function(PlayerEventTypes) {
                PlayerEventTypes['playStart'] = 'playStart';
                PlayerEventTypes['playing'] = 'playing';
                PlayerEventTypes['pause'] = 'pause';
                PlayerEventTypes['error'] = 'error';
                PlayerEventTypes['stopped'] = 'stopped';
                PlayerEventTypes['timeupdate'] = 'timeupdate';
                PlayerEventTypes['textTrackChanged'] = 'textTrackChanged';
                PlayerEventTypes['audioTrackChanged'] = 'audioTrackChanged';
            })(PlayerEventTypes || (PlayerEventTypes = {}));
            var PlayerDeviceTypes;
            (function(PlayerDeviceTypes) {
                PlayerDeviceTypes['chromecast'] = 'chromecast';
                PlayerDeviceTypes['default'] = '';
            })(PlayerDeviceTypes || (PlayerDeviceTypes = {}));
            var PlayerEventTypePayloads;
            (function(PlayerEventTypePayloads) {
                PlayerEventTypePayloads['play'] = 'play';
                PlayerEventTypePayloads['playing'] = 'playing';
                PlayerEventTypePayloads['paused'] = 'paused';
                PlayerEventTypePayloads['stop'] = 'stop';
                PlayerEventTypePayloads['error'] = 'error';
                PlayerEventTypePayloads['configure'] = 'configure';
            })(PlayerEventTypePayloads || (PlayerEventTypePayloads = {}));
            var PulseMode;
            (function(PulseMode) {
                PulseMode['live'] = 'live';
                PulseMode['archive'] = 'archive';
                PulseMode['offline'] = 'offline';
            })(PulseMode || (PulseMode = {}));

            /***/
        },

    /***/ './src/utils/eme.ts':
        /*!**************************!*\
  !*** ./src/utils/eme.ts ***!
  \**************************/
        /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            __webpack_require__.r(__webpack_exports__);
            /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                /* harmony export */ base64ToBinary: () => /* binding */ base64ToBinary,
                /* harmony export */ binaryToBase64: () => /* binding */ binaryToBase64,
                /* harmony export */ getEmeOptionsFromEntitlement: () => /* binding */ getEmeOptionsFromEntitlement,
                /* harmony export */ getHostnameFromUri: () => /* binding */ getHostnameFromUri,
                /* harmony export */ parseLicenseResponse: () => /* binding */ parseLicenseResponse,
                /* harmony export */
            });
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
                                            getContentId: function() {
                                                return getHostnameFromUri(protectionInfo.keyDeliveryUrl);
                                            },
                                            getLicense: function(emeOptions, contentId, keyMessage, callback) {
                                                const payload =
                                                    'spc=' + binaryToBase64(keyMessage) + '&assetId=' + encodeURIComponent(contentId);
                                                videojs.xhr(
                                                    {
                                                        uri: protectionInfo.keyDeliveryUrl,
                                                        method: 'post',
                                                        headers: {
                                                            'Content-type': 'application/x-www-form-urlencoded',
                                                            Authorization: protectionInfo.authenticationToken,
                                                        },
                                                        body: payload,
                                                        responseType: 'arraybuffer',
                                                    },
                                                    videojs.xhr.httpHandler(function(err, response) {
                                                        callback(null, parseLicenseResponse(response));
                                                    }, true)
                                                );
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
                let b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
                    c = [];
                for (let d = 0; d < a.byteLength; ) {
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
                let b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
                    c = new Uint8Array(new ArrayBuffer((3 * a.length) / 4 + 4)),
                    e = 0;
                for (let d = 0; d < a.length; ) {
                    let f = b.indexOf(a.charAt(d)),
                        g = b.indexOf(a.charAt(d + 1));
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
                let b = responseBody.trim(),
                    c = b.indexOf('<ckc>'),
                    d = b.indexOf('</ckc>');
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

            /***/
        },

    /***/ './src/utils/platform.ts':
        /*!*******************************!*\
  !*** ./src/utils/platform.ts ***!
  \*******************************/
        /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            __webpack_require__.r(__webpack_exports__);
            /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                /* harmony export */ willPlayHls: () => /* binding */ willPlayHls,
                /* harmony export */
            });
            /* harmony import */ var detect_browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
                /*! detect-browser */ './node_modules/detect-browser/es/index.js'
            );

            function willPlayHls() {
                const browser = (0, detect_browser__WEBPACK_IMPORTED_MODULE_0__.parseUserAgent)(navigator.userAgent);
                return browser && (browser.name === 'safari' || browser.name === 'ios');
            }

            /***/
        },

    /***/ './src/video-player/video-player.ts':
        /*!******************************************!*\
  !*** ./src/video-player/video-player.ts ***!
  \******************************************/
        /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            __webpack_require__.r(__webpack_exports__);
            /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                /* harmony export */ VideoPlayer: () => /* binding */ VideoPlayer,
                /* harmony export */
            });
            /* harmony import */ var _utils_platform__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
                /*! ../utils/platform */ './src/utils/platform.ts'
            );
            /* harmony import */ var _logging_player_logger_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
                /*! ../logging/player-logger-service */ './src/logging/player-logger-service.ts'
            );
            /* harmony import */ var _models_player__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(
                /*! ../models/player */ './src/models/player.ts'
            );
            /* harmony import */ var _utils_eme__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(
                /*! ../utils/eme */ './src/utils/eme.ts'
            );

            class VideoPlayer {
                constructor() {
                    this.player = null;
                    this.playerLoggerService = new _logging_player_logger_service__WEBPACK_IMPORTED_MODULE_1__.PlayerLoggerService();
                }
                init(selector, baseUrl, projectId, options) {
                    this.destroy();
                    this.firstPlayingEvent = true;
                    this.playerLoggerService.init(baseUrl, projectId);
                    const videoContainer = selector instanceof Element ? selector : document.querySelector(selector);
                    const videoElement = document.createElement('video');
                    videoElement.setAttribute('class', ['video-js', 'vjs-default-skin'].join(' '));
                    videoElement.setAttribute('tabIndex', '0');
                    videoElement.setAttribute('width', '100%');
                    videoElement.setAttribute('height', '100%');
                    videoContainer.appendChild(videoElement);
                    const playOptions = {
                        fluid: true,
                        autoplay: true,
                        controls: true,
                        controlBar: {
                            pictureInPictureToggle: false,
                            currentTimeDisplay: true,
                            durationDisplay: true,
                            timeDivider: false,
                            skipButtons: {
                                forward: 5,
                            },
                            // order of elements:
                            children: [
                                'playToggle',
                                'volumeMenuButton',
                                'currentTimeDisplay',
                                //"timeDivider",
                                'progressControl',
                                'durationDisplay',
                                'liveDisplay',
                                //"remainingTimeDisplay",
                                'customControlSpacer',
                                'playbackRateMenuButton',
                                'chaptersButton',
                                'descriptionsButton',
                                'subtitlesButton',
                                'captionsButton',
                                'audioTrackButton',
                                'fullscreenToggle',
                            ],
                        },
                        aspectRatio: '16:9',
                        ...options,
                    };
                    this.player = videojs(videoElement, playOptions);
                    const vhs = this.player.tech().vhs;
                    this.player.eme();
                    this.bindEvents();
                }
                play(playConfig, posterUrl, fullscreen) {
                    this.articlePlayConfig = playConfig;
                    this.playerLoggerService.onStart(
                        playConfig.pulseToken,
                        _models_player__WEBPACK_IMPORTED_MODULE_2__.PlayerDeviceTypes.default,
                        playConfig.localTimeDelta,
                        true
                    );
                    const hlsSources = playConfig.entitlements.filter(entitlement => entitlement.type === 'application/vnd.apple.mpegurl');
                    const configureHLSOnly = (0, _utils_platform__WEBPACK_IMPORTED_MODULE_0__.willPlayHls)() && hlsSources.length > 0; // make sure there is actually HLS
                    const playSources = playConfig.entitlements
                        .map(entitlement => {
                            const emeOptions = (0, _utils_eme__WEBPACK_IMPORTED_MODULE_3__.getEmeOptionsFromEntitlement)(entitlement);
                            return {
                                src: entitlement.src,
                                type: entitlement.type,
                                ...emeOptions,
                            };
                        })
                        .filter(playOption => {
                            return (playOption.type === 'application/vnd.apple.mpegurl' && configureHLSOnly) || !configureHLSOnly;
                        });
                    this.player.src(playSources);
                    if (fullscreen) {
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
                destroy() {
                    if (this.player) {
                        if (false === this.player.ended()) {
                            // only if we have not already caught the 'ended' event
                            // Be aware that the `stopped` emit also send along all kinds of info, so call _before_ disposing player
                            this.playerLoggerService.onStop();
                        }
                        this.player.dispose();
                    }
                }
                getPlayer() {
                    return this.player;
                }
                bindEvents() {
                    // same trick as azure media player; set label to language
                    this.player.on('loadeddata', () => {
                        const audioTracks = this.player.audioTracks();
                        for (let i = 0; i < audioTracks.length; i++) {
                            const element = audioTracks[i];
                            try {
                                // readonly property in some cases
                                element.label = element.language;
                            } catch (e) {}
                        }
                    });
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
                        } else {
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
                            if (
                                tracks[i].language === this.articlePlayConfig.subtitleLocale.toLowerCase() &&
                                tracks[i].kind === 'subtitles'
                            ) {
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
                            if (
                                (this.articlePlayConfig.audioLocale &&
                                    audioTracks[i].language === this.articlePlayConfig.audioLocale.toLowerCase()) ||
                                (this.articlePlayConfig.audioLocale === '' && i === 0)
                            ) {
                                audioTracks[i].enabled = true;
                                break;
                            }
                        }
                    }
                }
            }

            /***/
        },

    /******/
}; // The module cache
/************************************************************************/
/******/ /******/ var __webpack_module_cache__ = {}; // The require function
/******/

/******/ /******/ function __webpack_require__(moduleId) {
    /******/ // Check if module is in cache
    /******/ var cachedModule = __webpack_module_cache__[moduleId];
    /******/ if (cachedModule !== undefined) {
        /******/ return cachedModule.exports;
        /******/
    } // Create a new module (and put it into the cache)
    /******/ /******/ var module = (__webpack_module_cache__[moduleId] = {
        /******/ // no module.id needed
        /******/ // no module.loaded needed
        /******/ exports: {},
        /******/
    }); // Execute the module function
    /******/

    /******/ /******/ __webpack_modules__[moduleId](module, module.exports, __webpack_require__); // Return the exports of the module
    /******/

    /******/ /******/ return module.exports;
    /******/
} /* webpack/runtime/define property getters */
/******/

/************************************************************************/
/******/ /******/ (() => {
    /******/ // define getter functions for harmony exports
    /******/ __webpack_require__.d = (exports, definition) => {
        /******/ for (var key in definition) {
            /******/ if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
                /******/ Object.defineProperty(exports, key, {enumerable: true, get: definition[key]});
                /******/
            }
            /******/
        }
        /******/
    };
    /******/
})(); /* webpack/runtime/hasOwnProperty shorthand */
/******/

/******/ /******/ (() => {
    /******/ __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
    /******/
})(); /* webpack/runtime/make namespace object */
/******/

/******/ /******/ (() => {
    /******/ // define __esModule on exports
    /******/ __webpack_require__.r = exports => {
        /******/ if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            /******/ Object.defineProperty(exports, Symbol.toStringTag, {value: 'Module'});
            /******/
        }
        /******/ Object.defineProperty(exports, '__esModule', {value: true});
        /******/
    };
    /******/
})();
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
        /* harmony export */ ChromecastControls: () =>
            /* reexport safe */ _chromecast_chromecast_controls__WEBPACK_IMPORTED_MODULE_2__.ChromecastControls,
        /* harmony export */ ChromecastSender: () =>
            /* reexport safe */ _chromecast_chromecast_sender__WEBPACK_IMPORTED_MODULE_3__.ChromecastSender,
        /* harmony export */ EmbedPlayer: () => /* reexport safe */ _embed_player__WEBPACK_IMPORTED_MODULE_0__.EmbedPlayer,
        /* harmony export */ VideoPlayer: () => /* reexport safe */ _video_player_video_player__WEBPACK_IMPORTED_MODULE_1__.VideoPlayer,
        /* harmony export */
    });
    /* harmony import */ var _embed_player__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
        /*! ./embed-player */ './src/embed-player.ts'
    );
    /* harmony import */ var _video_player_video_player__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
        /*! ./video-player/video-player */ './src/video-player/video-player.ts'
    );
    /* harmony import */ var _chromecast_chromecast_controls__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(
        /*! ./chromecast/chromecast-controls */ './src/chromecast/chromecast-controls.ts'
    );
    /* harmony import */ var _chromecast_chromecast_sender__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(
        /*! ./chromecast/chromecast-sender */ './src/chromecast/chromecast-sender.ts'
    );
})();

var __webpack_exports__ChromecastControls = __webpack_exports__.ChromecastControls;
var __webpack_exports__ChromecastSender = __webpack_exports__.ChromecastSender;
var __webpack_exports__EmbedPlayer = __webpack_exports__.EmbedPlayer;
var __webpack_exports__VideoPlayer = __webpack_exports__.VideoPlayer;
export {
    __webpack_exports__ChromecastControls as ChromecastControls,
    __webpack_exports__ChromecastSender as ChromecastSender,
    __webpack_exports__EmbedPlayer as EmbedPlayer,
    __webpack_exports__VideoPlayer as VideoPlayer,
};

//# sourceMappingURL=bundle.js.map
