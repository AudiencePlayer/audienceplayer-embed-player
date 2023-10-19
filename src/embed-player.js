import PlayerLoggerService from './player-logger-service.js'

export default class EmbedPlayer {
    constructor() {
        this.myPlayer = null;
        this.castPlayer = null;
        this.castContext = null;
        this.castPlayerController = null;
        this.configData = null;
        this.videoElement = null;
        this.metadataLoaded = false;
        this.firstPlayingEvent = true;
        this.continueFromPreviousPosition = true;
        this.playerLoggerService = new PlayerLoggerService();
    }

    initPlayer(selector) {
        this.destroy();
        const videoContainer = selector instanceof Element ?
            selector : document.querySelector(selector);
        const videoElement = document.createElement('video');
        videoElement.setAttribute(
            'class',
            ['azuremediaplayer', 'amp-flush-skin', 'amp-big-play-centered'].join(' ')
        );
        videoElement.setAttribute('tabIndex', '0');
        videoElement.setAttribute('width', '100%');
        videoElement.setAttribute('height', '100%');
        videoElement.setAttribute('id', 'azuremediaplayer');
        videoContainer.appendChild(videoElement);
        this.videoElement = videoElement;
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
             muted = false,
             controls = true,
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
        if (continueFromPreviousPosition === false) {
            this.continueFromPreviousPosition = false;
        }
        const apiFetchUrl = this.sanitiseApiBaseUrl(apiBaseUrl) + `/graphql/${projectId}`;
        const streamLoggingUrl = this.sanitiseApiBaseUrl(apiBaseUrl) + `/service/${projectId}/analytics/stream/pulse/log`;
        this.initPlayer(selector);
        return this.getPlayConfig(
            apiFetchUrl,
            articleId,
            assetId,
            token
        ).then((config) => {
            this.playVideo(config, posterImageUrl, !!autoplay, fullScreen, muted, controls);
            return config;
        });
    }

    destroy() {
        if (this.myPlayer) {
            if (this.myPlayer.ended() === false) {
                // Be aware that the `stopped` emit also send along all kinds of info, so call _before_ disposing player
                this.playerLoggerService.onStop();
            }
            this.myPlayer.dispose();
            this.myPlayer = null;
        }
        this.configData = null;
    }

    playVideo(configData, posterUrl, autoplay, fullScreen, logServiceUrl, muted, controls) {
        this.configData = configData;
        this.playerLoggerService.setApiUrl(logServiceUrl);
        this.playerLoggerService.onStart(
            this.configData.pulseToken,
            'default',
            this.configData.localTimeDelta
        );
        var myOptions = {
            autoplay,
            controls,
            muted,
            fluid: true,
        };
        if (posterUrl) {
            myOptions.poster = posterUrl;
        }
        this.myPlayer = amp(this.videoElement, myOptions);
        this.myPlayer.src(this.configData.config.player, this.configData.config.options);
        this.bindEvents();
        if (fullScreen) {
            this.myPlayer.enterFullscreen();
        }
    }

    bindEvents() {
        if (this.myPlayer) {
            this.myPlayer.addEventListener('error', (event) =>
                this.eventHandler(event)
            );

            this.myPlayer.addEventListener('ended', (event) =>
                this.eventHandler(event)
            );

            this.myPlayer.addEventListener('pause', (event) =>
                this.eventHandler(event)
            );

            this.myPlayer.addEventListener('timeupdate', (event) =>
                this.eventHandler(event)
            );

            this.myPlayer.addEventListener('playing', (event) =>
                this.eventHandler(event)
            );

            this.myPlayer.addEventListener('loadedmetadata', (event) =>
                this.eventHandler(event)
            );
            this.myPlayer.addEventListener('durationchange', (event) =>
                this.eventHandler(event)
            );
        }
    }

    eventHandler(event) {
        switch (event.type) {
            case 'timeupdate': {
                this.checkSelectedTracks();
                this.playerLoggerService.onCurrentTimeUpdated(this.myPlayer.currentTime() || 0);
            }
                break;
            case 'durationchange': {
                this.checkSelectedTracks();
                this.playerLoggerService.onDurationUpdated(this.myPlayer.duration());
            }
                break;
            case 'loadedmetadata': {
                if (this.myPlayer.currentAudioStreamList()) {
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
            }
                break;
            case 'playing': {
                if (this.firstPlayingEvent) {
                    this.firstPlayingEvent = false;
                    if (this.continueFromPreviousPosition && this.configData.currentTime > 0) {
                        this.myPlayer.currentTime(this.configData.currentTime);
                    }
                }
                this.checkSelectedTracks();
                this.playerLoggerService.onPlaying();
            }
                break;
            case 'pause': {
                this.checkSelectedTracks();
                if (this.myPlayer.paused() && !this.myPlayer.ended()) {
                    this.playerLoggerService.onPause();
                }
            }
                break;
            case 'ended': {
                this.checkSelectedTracks();
                this.playerLoggerService.onStop();
            }
                break;
            case 'error': {
                const errorDetails = this.myPlayer.error();
                this.playerLoggerService.onError(JSON.stringify(errorDetails));
            }
                break;
        }
    }


    checkSelectedTracks() {
        if (!this.metadataLoaded) {
            return false;
        }

        let selectedAudioTrack = '';
        let selectedTextTrack = '';

        const tracks = this.myPlayer.textTracks();
        for (let i = 0; i < tracks.length; i++) {
            if (tracks[i].mode === 'showing' && tracks[i].kind === 'subtitles') {
                selectedTextTrack = tracks[i].language;
            }
        }

        if (this.myPlayer.currentAudioStreamList()) {
            for (let i = 0; i < this.myPlayer.currentAudioStreamList().streams.length; i++) {
                if (this.myPlayer.currentAudioStreamList().streams[i].enabled) {
                    selectedAudioTrack = this.myPlayer.currentAudioStreamList().streams[i].language;
                    break;
                }
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

    setDefaultTracks() {
        if (this.myPlayer.currentAudioStreamList()) {
            // set default tracks when available
            this.setDefaultAudioTrack();
            this.setDefaultTextTrack();
        } else {
            // unfortunately there is no reliable way to know when iOS native binding to text-tracks is done
            // (even after first play event, this is not true), so we resort to an old fashioned timeout
            setTimeout(() => {
                this.setDefaultAudioTrack();
                this.setDefaultTextTrack();
            }, 1000);
        }
    }

    setDefaultTextTrack() {
        if (this.configData.subtitleLocale) {
            const tracks = this.myPlayer.textTracks();
            for (let i = 0; i < tracks.length; i++) {
                // textTracks is not a real array so no iterators here
                if (tracks[i].mode !== 'disabled') {
                    tracks[i].mode = 'disabled';
                }
            }
            // it must be split up in to two loops, because two 'showing' items will break
            for (let i = 0; i < tracks.length; i++) {
                if (tracks[i].language === this.configData.subtitleLocale.toLowerCase() && tracks[i].kind === 'subtitles') {
                    tracks[i].mode = 'showing';
                    break;
                }
            }
        }
    }

    setDefaultAudioTrack() {
        if (this.configData.audioLocale) {
            if (this.myPlayer.currentAudioStreamList()) {
                for (let i = 0; i < this.myPlayer.currentAudioStreamList().streams.length; i++) {
                    if (
                        this.myPlayer.currentAudioStreamList().streams[i].language ===
                        this.configData.audioLocale.toLowerCase()
                    ) {
                        this.myPlayer.currentAudioStreamList().switchIndex(i);
                        break;
                    }
                }
            }
        }
    }

    getSelectedTracks() {
        let selectedAudioTrack = null;
        let selectedTextTrack = null;
        const tracks = this.myPlayer.textTracks();
        for (let i = 0; i < tracks.length; i++) {
            if (tracks[i].mode === 'showing' && tracks[i].kind === 'subtitles') {
                selectedTextTrack = tracks[i].language;
            }
        }

        if (this.myPlayer.currentAudioStreamList()) {
            for (let i = 0; i < this.myPlayer.currentAudioStreamList().streams.length; i++) {
                if (this.myPlayer.currentAudioStreamList().streams[i].enabled) {
                    selectedAudioTrack = this.myPlayer.currentAudioStreamList().streams[i].language;
                    break;
                }
            }
        }

        return {
            audioTrack: selectedAudioTrack,
            textTrack: selectedTextTrack,
        };
    }

    getPlayConfig(apiFetchUrl, articleId, assetId, token) {
        let article = {};
        let config = {};

        return this.getArticle(apiFetchUrl, articleId, token)
            .then((response) => response.json())
            .then((articleData) => {
                if (!articleData || !articleData.data || articleData.errors) {
                    const {message, code} = articleData.errors[0];
                    throw {message, code};
                }
                article = {...articleData.data.Article};
                return this.getArticleAssetPlayConfig(
                    apiFetchUrl,
                    articleId,
                    assetId,
                    token
                );
            })
            .then((response) => response.json())
            .then((configData) => {
                if (!configData || !configData.data || configData.errors) {
                    const {message, code} = configData.errors[0];
                    throw {message, code};
                }
                config = this.toPlayConfigConverter(
                    article,
                    assetId,
                    configData.data.ArticleAssetPlay
                );
                return config;
            });
    }

    getArticle(apiFetchUrl, articleId, token) {
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

        const authHeader = token ? {Authorization: 'Bearer ' + token} : {};

        return fetch(apiFetchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...authHeader,
            },
            body: JSON.stringify({
                query: articleQuery,
                variables: {articleId},
            }),
        });
    }

    getArticleAssetPlayConfig(apiFetchUrl, articleId, assetId, token) {
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

        const authHeader = token ? {Authorization: 'Bearer ' + token} : {};

        return fetch(apiFetchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...authHeader,
            },
            body: JSON.stringify({
                query: articleAssetPlayMutation,
                variables: {articleId, assetId, protocols: ['dash', 'mss', 'hls']},
            }),
        });
    }

    toPlayConfigConverter(article, assetId, config) {
        const timeStamp = Date.parse(config.issued_at);
        const asset = article.assets.find((item) => item.id === assetId);
        const options = config.subtitles.map((item) => ({
            src: item.url,
            srclang: item.locale,
            kind: 'subtitles',
            label: item.locale_label,
        }));

        return {
            config: {
                player: this.getPlayerConfig(config),
                options: this.isSafari() ? [] : [...options],
            },
            pulseToken: config.pulse_token,
            appa: config.appa,
            appr: config.appr,
            article: article,
            assetType: asset.linked_type,
            asset: asset,
            currentTime: config.appa / asset.duration <= 0.98 ? config.appa : 0,
            subtitleLocale: config.user_subtitle_locale,
            audioLocale: config.user_audio_locale,
            localTimeDelta: isNaN(timeStamp) ? 0 : Date.now() - timeStamp
        };
    }

    isSafari() {
        let chromeUserAgent = navigator.userAgent.indexOf('Chrome') > -1;
        let safariUserAgent = navigator.userAgent.indexOf('Chrome') > -1;
        if (chromeUserAgent && safariUserAgent) safariUserAgent = false;
        return safariUserAgent;
    }

    getPlayerConfig(config) {
        const playerConfigs = [];

        // check if the entitlements contain FPS in order to know when to filter out aes
        const filterAES = !!config.entitlements.find(
            (entitlement) => entitlement.encryption_type === 'fps'
        );
        const entitlements = filterAES
            ? config.entitlements.filter((entitlement) => {
                return entitlement.encryption_type !== 'aes';
            })
            : config.entitlements;

        const dashWidevine = entitlements.find(
            entitlement => !!entitlement.token && entitlement.encryption_type === 'cenc' && entitlement.protocol.indexOf('dash') === 0
        );
        const mssPlayReady = entitlements.find(
            entitlement => !!entitlement.token && entitlement.encryption_type === 'cenc' && entitlement.protocol.indexOf('mss') === 0
        );

        entitlements.forEach((entitlement) => {
            const entitlementConfig = {
                src: entitlement.manifest,
                type: entitlement.mime_type,
                protectionInfo: null,
            };

            if (entitlement.token) {
                entitlementConfig.protectionInfo = [];
                if (entitlement.encryption_type === 'cenc') {
                    if (!!dashWidevine) {
                        entitlementConfig.protectionInfo.push({
                            type: 'Widevine',
                            authenticationToken: 'Bearer ' + dashWidevine.token,
                            keyDeliveryUrl: dashWidevine.key_delivery_url,
                        });
                    }

                    if (!!mssPlayReady) {
                        entitlementConfig.protectionInfo.push({
                            type: 'PlayReady',
                            authenticationToken: 'Bearer=' + mssPlayReady.token,
                            keyDeliveryUrl: mssPlayReady.key_delivery_url,
                        });
                    }
                } else if (entitlement.encryption_type === 'fps') {
                    entitlementConfig.protectionInfo = [
                        {
                            type: 'FairPlay',
                            authenticationToken: 'Bearer ' + entitlement.token,
                            certificateUrl: config.fairplay_certificate_url,
                            keyDeliveryUrl: entitlement.key_delivery_url
                        },
                    ];
                }
            }
            playerConfigs.push(entitlementConfig);
        });
        return playerConfigs;
    }

    setupChromecast(selector, chromecastReceiverAppId) {
        return new Promise((resolve, reject) => {
            const castButtonContaner = document.querySelector(selector);
            const castButton = document.createElement('google-cast-launcher');
            castButtonContaner.appendChild(castButton);
            if (chromecastReceiverAppId) {
                window['__onGCastApiAvailable'] = (isAvailable) => {
                    if (isAvailable && cast && cast.framework) {
                        this.initializeCastApi(chromecastReceiverAppId);

                        //Some Chromecast configurations are taking some time to initialize
                        setTimeout(() => {
                            resolve()
                        }, 1000);
                    }
                };

                const scriptElement = document.createElement('script');
                scriptElement.src =
                    'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
                document.head.appendChild(scriptElement);
            } else {
                reject('Chromecast Receiver Application Id is missing')
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
        this.castPlayerController = new cast.framework.RemotePlayerController(
            this.castPlayer
        );
    }

    getCastMediaInfo(articlePlayConfig) {
        if (
            articlePlayConfig &&
            articlePlayConfig.config &&
            articlePlayConfig.config.player
        ) {
            const tracks = articlePlayConfig.config.options.map((option, index) => {
                const trackId = index + 1;
                const castTrack = new chrome.cast.media.Track(
                    trackId,
                    chrome.cast.media.TrackType.TEXT
                );
                castTrack.trackContentId = option.src;
                castTrack.trackContentType = 'text/vtt';
                castTrack.subtype = chrome.cast.media.TextTrackType.SUBTITLES;
                castTrack.name = option.label;
                castTrack.language = option.srclang;
                castTrack.customDate = null;
                return castTrack;
            });
            let contentType = null;
            const supportedContentTypes = ['application/vnd.ms-sstr+xml', 'video/mp4'];
            const entitlement = articlePlayConfig.config.player.find((item) => {
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
                    protectionConfig = entitlement.protectionInfo.find((protection) => {
                        return protection.type === 'PlayReady';
                    });
                }
                const token = protectionConfig
                    ? protectionConfig.authenticationToken
                    : null;
                const mediaInfo = new chrome.cast.media.MediaInfo(
                    entitlement.src,
                    contentType
                );
                mediaInfo.streamType = chrome.cast.media.StreamType.BUFFERED;
                mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
                mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
                mediaInfo.metadata.title = this.getMetaValue(articlePlayConfig.article.metas, 'title') || articlePlayConfig.article.name;
                mediaInfo.tracks = tracks;
                const licenceUrlParam = token ? {...this.getLicenseUrlFromSrc(protectionConfig.keyDeliveryUrl, token)} : {};
                const audieLocalePram = articlePlayConfig.audioLocale ? {preferredAudioLocale: articlePlayConfig.audioLocale} : {};
                mediaInfo.customData = {
                    ...licenceUrlParam,
                    ...audieLocalePram,
                    pulseToken: articlePlayConfig.pulseToken,
                };
                mediaInfo.currentTime = articlePlayConfig.currentTime;
                mediaInfo.autoplay = true;

                return mediaInfo;
            }
        }
        return null;
    }

    getMetaValue(metas, key) {
        const meta = metas.find(m => m.key === key);
        return meta ? meta.value : '';
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
        if (continueFromPreviousPosition === false) {
            this.continueFromPreviousPosition = false;
        }
        const apiFetchUrl = this.sanitiseApiBaseUrl(apiBaseUrl) + `/graphql/${projectId}`;
        return this.getPlayConfig(
            apiFetchUrl,
            articleId,
            assetId,
            token
        ).then((config) => {
            if (this.isConnected()) {
                const castSession = this.castContext.getCurrentSession();
                const mediaInfo = this.getCastMediaInfo(config);

                if (mediaInfo) {
                    const request = new chrome.cast.media.LoadRequest(mediaInfo);
                    request.currentTime = this.continueFromPreviousPosition ? config.currentTime : 0;
                    if (config.subtitleLocale) {
                        // can NOT use .filter on tracks because the cast library has patched the Array.
                        const textTrack = mediaInfo.tracks.find(track => track.language === config.subtitleLocale);
                        if (textTrack) {
                            request.activeTrackIds = [textTrack.trackId];
                        }
                    }
                    return castSession.loadMedia(request);
                } else {
                    throw {message: 'Unexpected manifest format in articlePlayConfig'};
                }
            }
            return config;
        });
    }

    isConnected() {
        return this.castPlayer && this.castPlayer.isConnected;
    }

    stopCasting() {
        const castSession = cast.framework.CastContext.getInstance().getCurrentSession();
        castSession.endSession(true);
    }

    getCastPlayer() {
        return this.castPlayer;
    }

    getCastPlayerController() {
        return this.castPlayerController;
    }

    sanitiseApiBaseUrl(apiBaseUrl) {
        return apiBaseUrl.replace(/\/*$/, '');
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
