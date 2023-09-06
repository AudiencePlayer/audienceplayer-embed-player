var e = {
        d: (t, r) => {
            for (var s in r) e.o(r, s) && !e.o(t, s) && Object.defineProperty(t, s, {enumerable: !0, get: r[s]});
        },
        o: (e, t) => Object.prototype.hasOwnProperty.call(e, t),
    },
    t = {};
e.d(t, {Af: () => b, Cz: () => k, Yn: () => S, Y7: () => f});
var r,
    s,
    a,
    i,
    n,
    o,
    l = function(e, t, r) {
        if (r || 2 === arguments.length)
            for (var s, a = 0, i = t.length; a < i; a++) (!s && a in t) || (s || (s = Array.prototype.slice.call(t, 0, a)), (s[a] = t[a]));
        return e.concat(s || Array.prototype.slice.call(t));
    },
    c = function(e, t, r) {
        (this.name = e), (this.version = t), (this.os = r), (this.type = 'browser');
    },
    p = function(e, t, r, s) {
        (this.name = e), (this.version = t), (this.os = r), (this.bot = s), (this.type = 'bot-device');
    },
    d = function() {
        (this.type = 'bot'), (this.bot = !0), (this.name = 'bot'), (this.version = null), (this.os = null);
    },
    h = /(nuhk|curl|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask\ Jeeves\/Teoma|ia_archiver)/,
    u = [
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
        [
            'searchbot',
            /alexa|bot|crawl(er|ing)|facebookexternalhit|feedburner|google web preview|nagios|postrank|pingdom|slurp|spider|yahoo!|yandex/,
        ],
    ],
    y = [
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
function m(e) {
    var t = (function(e) {
        return (
            '' !== e &&
            u.reduce(function(t, r) {
                var s = r[0],
                    a = r[1];
                if (t) return t;
                var i = a.exec(e);
                return !!i && [s, i];
            }, !1)
        );
    })(e);
    if (!t) return null;
    var r = t[0],
        s = t[1];
    if ('searchbot' === r) return new d();
    var a =
        s[1] &&
        s[1]
            .split('.')
            .join('_')
            .split('_')
            .slice(0, 3);
    a
        ? a.length < 3 &&
          (a = l(
              l([], a, !0),
              (function(e) {
                  for (var t = [], r = 0; r < e; r++) t.push('0');
                  return t;
              })(3 - a.length),
              !0
          ))
        : (a = []);
    var i = a.join('.'),
        n = (function(e) {
            for (var t = 0, r = y.length; t < r; t++) {
                var s = y[t],
                    a = s[0];
                if (s[1].exec(e)) return a;
            }
            return null;
        })(e),
        o = h.exec(e);
    return o && o[1] ? new p(r, i, n, o[1]) : new c(r, i, n);
}
!(function(e) {
    (e[(e.loading = 0)] = 'loading'),
        (e[(e.playing = 1)] = 'playing'),
        (e[(e.paused = 2)] = 'paused'),
        (e[(e.idle = 3)] = 'idle'),
        (e[(e.buffering = 4)] = 'buffering'),
        (e[(e.error = 5)] = 'error');
})(r || (r = {})),
    (function(e) {
        (e.playStart = 'playStart'),
            (e.playing = 'playing'),
            (e.pause = 'pause'),
            (e.error = 'error'),
            (e.stopped = 'stopped'),
            (e.timeupdate = 'timeupdate'),
            (e.textTrackChanged = 'textTrackChanged'),
            (e.audioTrackChanged = 'audioTrackChanged');
    })(s || (s = {})),
    (function(e) {
        (e.chromecast = 'chromecast'), (e.default = '');
    })(a || (a = {})),
    (function(e) {
        (e.play = 'play'),
            (e.playing = 'playing'),
            (e.paused = 'paused'),
            (e.stop = 'stop'),
            (e.error = 'error'),
            (e.configure = 'configure');
    })(i || (i = {})),
    (function(e) {
        (e.live = 'live'), (e.archive = 'archive'), (e.offline = 'offline');
    })(n || (n = {}));
class g {
    constructor() {
        (this.playLogs = []), (this.apiCallInProgress = !1), (this.intervalHandle = null);
    }
    init(e, t) {
        (this.apiUrl = `${e}/service/${t}/analytics/stream/pulse/log`.replace(/\/*$/, '')),
            null === this.intervalHandle &&
                (this.intervalHandle = setInterval(() => {
                    this.processFirstPlayLog();
                }, 3e3));
    }
    processPlaySession(e, t) {
        if (!e) return;
        const r = e.eventStack;
        if (0 === r.length) return;
        const s = [];
        let a = 0,
            o = 0,
            l = !1;
        for (; a < r.length; ) {
            const e = r[a];
            if (this.isEventTypeWithoutTimeDelta(e.eventType)) s.push(this.convertEventToEventPayload(e)), (l = !0);
            else if (((l = !1), a - 1 >= 0)) {
                const t = r[a - 1];
                (o += e.timeStamp - t.timeStamp), e.state !== t.state && (s.push(this.createDeltaEventPayload(t, t.timeStamp, o)), (o = 0));
            }
            a++;
        }
        const c = r[r.length - 1];
        if (((o > 0 || !l) && s.push(this.createDeltaEventPayload(c, t, o)), s.length > 0)) {
            if (s.length > 30) {
                const e = s[s.length - 1];
                s.splice(29), (e.event_type = i.error), (e.event_payload = '{code: 429, message: "Too many events"}'), s.push(e);
            }
            let t = this.getPlayerLogPayloadWithPulseToken(e.pulseToken);
            t ||
                ((t = {event_stack: [], pulse_token: e.pulseToken, pulse_mode: e.isLive ? n.live : n.offline, device_type: e.deviceType}),
                this.playLogs.push(t)),
                s.forEach(e => t.event_stack.push(e)),
                this.processPlayLog(t, e);
        }
    }
    processFirstPlayLog() {
        this.playLogs.length > 0 && this.processPlayLog(this.playLogs[0], null);
    }
    processPlayLog(e, t) {
        if (!e || this.apiCallInProgress) return;
        if (0 === e.event_stack.length) return void this.removePlayLog(e);
        const r = {...e, event_stack: []};
        let s = 0,
            a = !1;
        for (; s < e.event_stack.length && r.event_stack.length < 30 && !a; ) {
            const t = e.event_stack[s];
            s++, r.event_stack.push(t), t.event_type === i.stop && (a = !0);
        }
        return r.pulse_mode === n.offline && r.event_stack.length < 30 && !a
            ? void 0
            : ((this.apiCallInProgress = !0),
              fetch(this.apiUrl, {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json', Accept: 'application/json'},
                  body: JSON.stringify(r),
              })
                  .then(() => !0)
                  .catch(e => 0 !== e.status)
                  .then(t => {
                      t ? (e.event_stack.splice(0, s), 0 === e.event_stack.length && this.removePlayLog(e)) : (e.pulse_mode = n.archive),
                          (this.apiCallInProgress = !1);
                  }));
    }
    getPlayerLogPayloadWithPulseToken(e) {
        return this.playLogs.find(t => t.pulse_token === e);
    }
    removePlayLog(e) {
        const t = this.playLogs.findIndex(t => t.pulse_token === e.pulse_token);
        t >= 0 && this.playLogs.splice(t, 1);
    }
    isEventTypeWithoutTimeDelta(e) {
        return [s.textTrackChanged, s.audioTrackChanged, s.playStart].indexOf(e) >= 0;
    }
    createBaseEventPayload(e, t) {
        return {timestamp: e.timeStamp, event_type: t, appa: e.playPosition, appr: Math.min(e.playPosition / e.mediaDuration, 1)};
    }
    convertEventToEventPayload(e) {
        if (e.eventType === s.playStart) return {timestamp: e.timeStamp, event_type: i.play};
        const t = this.convertEventTypeToEventTypePayload(e),
            r = this.createBaseEventPayload(e, t);
        switch (e.eventType) {
            case s.audioTrackChanged:
                return {...r, audio_locale: e.audioTrack};
            case s.textTrackChanged:
                return {...r, subtitle_locale: e.textTrack};
            default:
                return r;
        }
    }
    createDeltaEventPayload(e, t, s) {
        const a = this.getEventTypePayloadFromEventState(e);
        return {
            ...this.createBaseEventPayload(e, a),
            ...(e.state === r.error ? {event_payload: e.error} : {}),
            timestamp: t,
            time_delta: s / 1e3,
        };
    }
    getEventTypePayloadFromEventState(e) {
        switch (e.state) {
            case r.playing:
                return i.playing;
            case r.paused:
                return i.paused;
            case r.error:
                return i.error;
            case r.buffering:
            case r.loading:
                return i.paused;
            case r.idle:
                return i.stop;
        }
    }
    convertEventTypeToEventTypePayload(e) {
        switch (e.eventType) {
            case s.playStart:
                return i.play;
            case s.audioTrackChanged:
            case s.textTrackChanged:
                return i.configure;
            default:
                this.getEventTypePayloadFromEventState(e);
        }
    }
}
class v {
    constructor() {
        (this.intervalHandle = 0), (this.playerLogProcessor = new g()), this.reset();
    }
    init(e, t) {
        this.playerLogProcessor.init(e, t);
    }
    onStart(e, t, r, s, a) {
        this.reset(), (this.playSession = {pulseToken: e, deviceType: t, eventStack: [], localTimeDelta: r, isLive: s, onStopCallback: a});
    }
    onCurrentTimeUpdated(e) {
        (this.playerProperties.playPosition = e),
            this.playerProperties.mediaDuration > 0 && this.playerProperties.state !== r.idle && this.logEvent(s.timeupdate);
    }
    onDurationUpdated(e) {
        this.playerProperties.mediaDuration = e;
    }
    onPlaying() {
        this.playerProperties.state !== r.playing &&
            (this.playerProperties.state === r.idle
                ? ((this.playerProperties.state = r.playing), this.logEvent(s.playStart), this.processPlaySession(), this.startInterval())
                : ((this.playerProperties.state = r.playing), this.logEvent(s.playing)));
    }
    onPause() {
        this.playerProperties.state !== r.paused && ((this.playerProperties.state = r.paused), this.logEvent(s.pause));
    }
    onError(e) {
        this.playerProperties.state !== r.error &&
            ((this.playerProperties.state = r.error), (this.playerProperties.error = e), this.logEvent(s.error));
    }
    onStop() {
        this.playerProperties.state !== r.idle &&
            ((this.playerProperties.state = r.idle), this.logEvent(s.stopped), this.stopInterval(), this.processPlaySession());
    }
    onTextTrackChanged(e) {
        this.playerProperties.state !== r.idle && ((this.playerProperties.textTrack = e), this.logEvent(s.textTrackChanged));
    }
    onAudioTrackChanged(e) {
        this.playerProperties.state !== r.idle && ((this.playerProperties.audioTrack = e), this.logEvent(s.audioTrackChanged));
    }
    updateProperties(e) {
        this.playerProperties = {...this.playerProperties, ...e};
    }
    startInterval() {
        this.stopInterval(),
            (this.intervalHandle = setInterval(() => {
                this.processPlaySession();
            }, 3e4));
    }
    stopInterval() {
        this.intervalHandle && clearInterval(this.intervalHandle);
    }
    processPlaySession() {
        this.playerLogProcessor.processPlaySession({...this.playSession}, this.getTimeStamp()), (this.playSession.eventStack = []);
    }
    logEvent(e) {
        this.playSession && this.playSession.eventStack.push({...this.playerProperties, eventType: e, timeStamp: this.getTimeStamp()});
    }
    reset() {
        (this.playSession = null),
            (this.playerProperties = {state: r.idle, error: null, mediaDuration: 0, playPosition: 0, audioTrack: null, textTrack: null});
    }
    getTimeStamp() {
        return Date.now() - (this.playSession ? this.playSession.localTimeDelta : 0);
    }
}
class f {
    constructor() {
        (this.player = null), (this.playerLoggerService = new v());
    }
    init(e, t, r, s) {
        this.destroy(), (this.firstPlayingEvent = !0), this.playerLoggerService.init(t, r);
        const a = e instanceof Element ? e : document.querySelector(e),
            i = document.createElement('video');
        i.setAttribute('class', ['video-js', 'vjs-default-skin'].join(' ')),
            i.setAttribute('tabIndex', '0'),
            i.setAttribute('width', '100%'),
            i.setAttribute('height', '100%'),
            a.appendChild(i);
        const n = {
            fluid: !0,
            autoplay: !0,
            controls: !0,
            controlBar: {
                pictureInPictureToggle: !1,
                currentTimeDisplay: !0,
                durationDisplay: !0,
                timeDivider: !1,
                skipButtons: {forward: 5},
                children: [
                    'playToggle',
                    'volumeMenuButton',
                    'currentTimeDisplay',
                    'progressControl',
                    'durationDisplay',
                    'liveDisplay',
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
            ...s,
        };
        (this.player = videojs(i, n)), this.player.tech().vhs, this.player.eme(), this.bindEvents();
    }
    play(e, t, r) {
        (this.articlePlayConfig = e), this.playerLoggerService.onStart(e.pulseToken, a.default, e.localTimeDelta, !0);
        const s = e.entitlements.filter(e => 'application/vnd.apple.mpegurl' === e.type),
            i =
                (function() {
                    const e = m(navigator.userAgent);
                    return e && ('safari' === e.name || 'ios' === e.name);
                })() && s.length > 0,
            n = e.entitlements
                .map(e => {
                    const t = (function(e) {
                        let t = null,
                            r = {};
                        if (e.protectionInfo)
                            switch (e.type) {
                                case 'application/dash+xml':
                                    (t = e.protectionInfo.find(e => 'Widevine' === e.type)),
                                        t &&
                                            (r = {
                                                keySystems: {'com.widevine.alpha': t.keyDeliveryUrl},
                                                emeHeaders: {Authorization: t.authenticationToken},
                                            });
                                    break;
                                case 'application/vnd.ms-sstr+xml':
                                    (t = e.protectionInfo.find(e => 'PlayReady' === e.type)),
                                        t &&
                                            (r = {
                                                keySystems: {'com.microsoft.playready': t.keyDeliveryUrl},
                                                emeHeaders: {Authorization: t.authenticationToken},
                                            });
                                    break;
                                case 'application/vnd.apple.mpegurl':
                                    (t = e.protectionInfo.find(e => 'FairPlay' === e.type)),
                                        t &&
                                            (r = {
                                                keySystems: {
                                                    'com.apple.fps.1_0': {
                                                        certificateUri: t.certificateUrl,
                                                        getContentId: function() {
                                                            return (function(e) {
                                                                let t = document.createElement('a');
                                                                return (t.href = e), t.hostname;
                                                            })(t.keyDeliveryUrl);
                                                        },
                                                        getLicense: function(e, r, s, a) {
                                                            const i =
                                                                'spc=' +
                                                                (function(e) {
                                                                    let t =
                                                                            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
                                                                        r = [];
                                                                    for (let s = 0; s < e.byteLength; ) {
                                                                        let a = e[s++];
                                                                        r.push(t.charAt(a >> 2)),
                                                                            (a = (3 & a) << 4),
                                                                            s < e.byteLength
                                                                                ? (r.push(t.charAt(a | (e[s] >> 4))),
                                                                                  (a = (15 & e[s++]) << 2),
                                                                                  s < e.byteLength
                                                                                      ? (r.push(t.charAt(a | (e[s] >> 6))),
                                                                                        r.push(t.charAt(63 & e[s++])))
                                                                                      : (r.push(t.charAt(a)), r.push('=')))
                                                                                : (r.push(t.charAt(a)), r.push('=='));
                                                                    }
                                                                    return r.join('');
                                                                })(s) +
                                                                '&assetId=' +
                                                                encodeURIComponent(r);
                                                            videojs.xhr(
                                                                {
                                                                    uri: t.keyDeliveryUrl,
                                                                    method: 'post',
                                                                    headers: {
                                                                        'Content-type': 'application/x-www-form-urlencoded',
                                                                        Authorization: t.authenticationToken,
                                                                    },
                                                                    body: i,
                                                                    responseType: 'arraybuffer',
                                                                },
                                                                videojs.xhr.httpHandler(function(e, t) {
                                                                    a(
                                                                        null,
                                                                        (function(e) {
                                                                            let t = String.fromCharCode
                                                                                    .apply(null, new Uint8Array(e))
                                                                                    .trim(),
                                                                                r = t.indexOf('<ckc>'),
                                                                                s = t.indexOf('</ckc>');
                                                                            if (-1 === r || -1 === s)
                                                                                throw Error(
                                                                                    'License data format not as expected, missing or misplaced <ckc> tag'
                                                                                );
                                                                            return (
                                                                                (r += 5),
                                                                                (t = t.substr(r, s - r)),
                                                                                (function(e) {
                                                                                    let t =
                                                                                            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
                                                                                        r = new Uint8Array(
                                                                                            new ArrayBuffer((3 * e.length) / 4 + 4)
                                                                                        ),
                                                                                        s = 0;
                                                                                    for (let a = 0; a < e.length; ) {
                                                                                        let i = t.indexOf(e.charAt(a)),
                                                                                            n = t.indexOf(e.charAt(a + 1));
                                                                                        if (
                                                                                            ((r[s++] = (i << 2) | (n >> 4)),
                                                                                            '=' !== e.charAt(a + 2))
                                                                                        ) {
                                                                                            let i = t.indexOf(e.charAt(a + 2));
                                                                                            if (
                                                                                                ((r[s++] = (n << 4) | (i >> 2)),
                                                                                                '=' !== e.charAt(a + 3))
                                                                                            ) {
                                                                                                let n = t.indexOf(e.charAt(a + 3));
                                                                                                r[s++] = (i << 6) | n;
                                                                                            }
                                                                                        }
                                                                                        a += 4;
                                                                                    }
                                                                                    return new Uint8Array(r.buffer, 0, s);
                                                                                })(t)
                                                                            );
                                                                        })(t)
                                                                    );
                                                                }, !0)
                                                            );
                                                        },
                                                    },
                                                },
                                            });
                            }
                        return r;
                    })(e);
                    return {src: e.src, type: e.type, ...t};
                })
                .filter(e => ('application/vnd.apple.mpegurl' === e.type && i) || !i);
        this.player.src(n),
            r && this.player.requestFullscreen(),
            i ||
                e.subtitles.forEach(t => {
                    this.player.addRemoteTextTrack({
                        kind: t.kind,
                        src: t.src,
                        srclang: t.srclang,
                        label: t.label,
                        enabled: t.srclang === e.subtitleLocale,
                    });
                });
    }
    destroy() {
        this.player && (!1 === this.player.ended() && this.playerLoggerService.onStop(), this.player.dispose());
    }
    getPlayer() {
        return this.player;
    }
    bindEvents() {
        this.player.on('loadeddata', () => {
            const e = this.player.audioTracks();
            for (let t = 0; t < e.length; t++) {
                const r = e[t];
                try {
                    r.label = r.language;
                } catch (e) {}
            }
        }),
            this.player.on('error', () => {
                this.playerLoggerService.onError(JSON.stringify(this.player.error()));
            }),
            this.player.on('playing', () => {
                this.firstPlayingEvent &&
                    ((this.firstPlayingEvent = !1),
                    this.articlePlayConfig.currentTime > 0 && this.player.currentTime(this.articlePlayConfig.currentTime)),
                    this.checkSelectedTracks(),
                    this.playerLoggerService.onPlaying();
            }),
            this.player.on('pause', () => {
                this.checkSelectedTracks(), this.player.paused() && !this.player.ended() && this.playerLoggerService.onPause();
            }),
            this.player.on('ended', () => {
                this.checkSelectedTracks(), this.playerLoggerService.onStop();
            }),
            this.player.on('timeupdate', () => {
                this.checkSelectedTracks(), this.playerLoggerService.onCurrentTimeUpdated(this.player.currentTime() || 0);
            }),
            this.player.on('durationchange', () => {
                this.checkSelectedTracks(), this.playerLoggerService.onDurationUpdated(this.player.duration());
            }),
            this.player.on('loadedmetadata', () => {
                const e = this.player.audioTracks();
                e && e.length > 0
                    ? (this.setDefaultAudioTrack(), this.setDefaultTextTrack(), (this.metadataLoaded = !0))
                    : setTimeout(() => {
                          this.setDefaultAudioTrack(), this.setDefaultTextTrack(), (this.metadataLoaded = !0);
                      }, 1e3);
            });
    }
    checkSelectedTracks() {
        if (!this.metadataLoaded) return !1;
        let e = '',
            t = '';
        const r = this.player.textTracks();
        for (let e = 0; e < r.length; e++) 'showing' === r[e].mode && 'subtitles' === r[e].kind && (t = r[e].language);
        const s = this.player.audioTracks();
        for (let t = 0; t < s.length; t++)
            if (s[t].enabled) {
                e = s[t].language;
                break;
            }
        this.playerLoggerService.updateProperties({textTrack: t, audioTrack: e}),
            null !== this.currentTextTrack && this.currentTextTrack !== t && this.playerLoggerService.onTextTrackChanged(t),
            (this.currentTextTrack = t),
            null !== this.currentAudioTrack && this.currentAudioTrack !== e && this.playerLoggerService.onAudioTrackChanged(e),
            (this.currentAudioTrack = e);
    }
    setDefaultTextTrack() {
        if (this.articlePlayConfig.subtitleLocale) {
            const e = this.player.textTracks();
            for (let t = 0; t < e.length; t++) 'disabled' !== e[t].mode && (e[t].mode = 'disabled');
            for (let t = 0; t < e.length; t++)
                if (e[t].language === this.articlePlayConfig.subtitleLocale.toLowerCase() && 'subtitles' === e[t].kind) {
                    e[t].mode = 'showing';
                    break;
                }
        }
    }
    setDefaultAudioTrack() {
        if (this.articlePlayConfig.audioLocale) {
            const e = this.player.audioTracks();
            for (let t = 0; t < e.length; t++)
                if (
                    (this.articlePlayConfig.audioLocale && e[t].language === this.articlePlayConfig.audioLocale.toLowerCase()) ||
                    ('' === this.articlePlayConfig.audioLocale && 0 === t)
                ) {
                    e[t].enabled = !0;
                    break;
                }
        }
    }
}
class k {
    constructor() {
        (this.castContext = null), (this.castPlayer = null), (this.castPlayerController = null);
    }
    init(e) {
        return new Promise((t, r) => {
            if (e) {
                window.__onGCastApiAvailable = r => {
                    r &&
                        cast &&
                        cast.framework &&
                        (this.initializeCastApi(e),
                        setTimeout(() => {
                            t();
                        }, 1e3));
                };
                const r = document.createElement('script');
                (r.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1'), document.head.appendChild(r);
            } else r('Chromecast Receiver Application Id is missing');
        });
    }
    initializeCastApi(e) {
        cast.framework.CastContext.getInstance().setOptions({
            receiverApplicationId: e,
            autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
        }),
            (this.castContext = cast.framework.CastContext.getInstance()),
            (this.castPlayer = new cast.framework.RemotePlayer()),
            (this.castPlayerController = new cast.framework.RemotePlayerController(this.castPlayer));
    }
    getCastMediaInfo(e, t) {
        if (e && e.entitlements && e.entitlements.length > 0) {
            const r = e.subtitles.map((e, t) => {
                const r = t + 1,
                    s = new chrome.cast.media.Track(r, chrome.cast.media.TrackType.TEXT);
                return (
                    (s.trackContentId = e.src),
                    (s.trackContentType = 'text/vtt'),
                    (s.subtype = chrome.cast.media.TextTrackType.SUBTITLES),
                    (s.name = e.label),
                    (s.language = e.srclang),
                    (s.customData = null),
                    s
                );
            });
            let s = null;
            const a = ['application/vnd.ms-sstr+xml', 'video/mp4'],
                i = e.entitlements.find(e => !!a.includes(e.type) && ((s = e.type), !0));
            let n = null;
            if (i) {
                i.protectionInfo && (n = i.protectionInfo.find(e => 'PlayReady' === e.type));
                const a = n ? n.authenticationToken : null,
                    o = new chrome.cast.media.MediaInfo(i.src, s);
                (o.streamType = chrome.cast.media.StreamType.BUFFERED),
                    (o.metadata = new chrome.cast.media.GenericMediaMetadata()),
                    (o.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC),
                    (o.metadata.title = t.title),
                    (o.tracks = r);
                const l = a ? {...this.getLicenseUrlFromSrc(n.keyDeliveryUrl, a)} : {},
                    c = e.audioLocale ? {preferredAudioLocale: e.audioLocale} : {};
                return (o.customData = {...l, ...c, pulseToken: e.pulseToken}), o;
            }
        }
        return null;
    }
    getLicenseUrlFromSrc(e, t) {
        return t ? {licenseUrl: (e.includes('?') ? `${e}&token=` : `${e}?token=`) + encodeURIComponent(t), token: t} : {};
    }
    castVideo(e, t, r) {
        if (this.isConnected()) {
            const s = this.castContext.getCurrentSession(),
                a = this.getCastMediaInfo(e, t);
            if (a) {
                const t = new chrome.cast.media.LoadRequest(a);
                if (((t.currentTime = r ? e.currentTime : 0), e.subtitleLocale)) {
                    const r = a.tracks.find(t => t.language === e.subtitleLocale);
                    r && (t.activeTrackIds = [r.trackId]);
                }
                return s.loadMedia(t);
            }
            throw {message: 'Unexpected manifest format in articlePlayConfig'};
        }
    }
    isConnected() {
        return this.castPlayer && this.castPlayer.isConnected;
    }
    stopCasting() {
        const e = cast.framework.CastContext.getInstance().getCurrentSession();
        e && e.endSession(!0);
    }
    getCastPlayer() {
        return this.castPlayer;
    }
    getCastPlayerController() {
        return this.castPlayerController;
    }
}
function T(e, t, r, s) {
    return fetch(e, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Accept: 'application/json', ...(s ? {Authorization: 'Bearer ' + s} : {})},
        body: JSON.stringify({query: t, variables: r}),
    }).then(e => e.json());
}
function P(e, t) {
    const r = e.find(e => e.key === t);
    return r ? r.value : '';
}
function C(e) {
    switch (e) {
        case 0:
            return o.offlineError;
        case 401:
        case 403:
            return o.notAuthenticated;
        case 402:
            return o.needEntitlement;
        case 404:
            return o.noPlayableAsset;
        case 429:
            return o.maxConcurrentStreamNumberError;
        default:
            return o.serverError;
    }
}
!(function(e) {
    (e.noPlayableAsset = 'noPlayableAsset'),
        (e.notAuthenticated = 'notAuthenticated'),
        (e.needEntitlement = 'needEntitlement'),
        (e.serverError = 'serverError'),
        (e.offlineError = 'offlineError'),
        (e.maxConcurrentStreamNumberError = 'maxConcurrentStreamNumberError');
})(o || (o = {}));
class _ {
    init(e, t) {
        (this.apiFetchUrl = `${e}/graphql/${t}`.replace(/\/*$/, '')), (this.token = null);
    }
    setToken(e) {
        this.token = e;
    }
    getArticleAssetPlayConfig(e, t, r) {
        return T(
            this.apiFetchUrl,
            '\n    mutation ArticleAssetPlay($articleId: Int, $assetId: Int, $protocols: [ArticlePlayProtocolEnum]) {\n        ArticleAssetPlay(article_id: $articleId, asset_id: $assetId, protocols: $protocols) {\n            article_id\n            asset_id\n            entitlements {\n                mime_type\n                protocol\n                manifest\n                token\n                encryption_type\n                key_delivery_url\n            }\n            subtitles {\n                url\n                locale\n                locale_label\n            }\n            pulse_token\n            appa\n            appr\n            fairplay_certificate_url\n            user_subtitle_locale\n            user_audio_locale\n            issued_at\n        }\n    }\n',
            {articleId: e, assetId: t, protocols: ['dash', 'mss', 'hls']},
            this.token
        ).then(e => {
            if (!e || !e.data || e.errors) {
                const {message: t, code: r} = e.errors[0];
                throw {message: t, code: r};
            }
            return (function(e, t) {
                const r = Date.parse(e.issued_at),
                    s = [],
                    a = e.entitlements.find(e => 'fps' === e.encryption_type)
                        ? e.entitlements.filter(e => 'aes' !== e.encryption_type)
                        : e.entitlements,
                    i = a.find(e => !!e.token && 'cenc' === e.encryption_type && 0 === e.protocol.indexOf('dash')),
                    n = a.find(e => !!e.token && 'cenc' === e.encryption_type && 0 === e.protocol.indexOf('mss'));
                a.forEach(t => {
                    const r = {src: t.manifest, type: t.mime_type, protectionInfo: null};
                    t.token &&
                        ((r.protectionInfo = []),
                        'cenc' === t.encryption_type
                            ? (i &&
                                  r.protectionInfo.push({
                                      type: 'Widevine',
                                      authenticationToken: 'Bearer ' + i.token,
                                      keyDeliveryUrl: i.key_delivery_url,
                                  }),
                              n &&
                                  r.protectionInfo.push({
                                      type: 'PlayReady',
                                      authenticationToken: 'Bearer=' + n.token,
                                      keyDeliveryUrl: n.key_delivery_url,
                                  }))
                            : 'fps' === t.encryption_type &&
                              (r.protectionInfo = [
                                  {
                                      type: 'FairPlay',
                                      authenticationToken: 'Bearer ' + t.token,
                                      certificateUrl: e.fairplay_certificate_url,
                                      keyDeliveryUrl: t.key_delivery_url,
                                  },
                              ])),
                        s.push(r);
                });
                const o = e.subtitles.map(e => ({src: e.url, srclang: e.locale, kind: 'subtitles', label: e.locale_label}));
                return {
                    entitlements: s,
                    subtitles: o,
                    pulseToken: e.pulse_token,
                    currentTime: t ? e.appa : 0,
                    subtitleLocale: e.user_subtitle_locale,
                    audioLocale: e.user_audio_locale,
                    localTimeDelta: isNaN(r) ? 0 : Date.now() - r,
                };
            })(e.data.ArticleAssetPlay, r);
        });
    }
    getArticle(e, t) {
        return T(
            this.apiFetchUrl,
            '\n    query Article($articleId: Int!) {\n        Article(id: $articleId) {\n            id\n            name\n            metas {\n                key\n                value\n            }\n            assets {\n                id\n                duration\n                linked_type\n                accessibility\n            }\n            posters {\n                type\n                url\n                title\n                base_url\n                file_name\n            }\n        }\n    }\n',
            {articleId: e},
            this.token
        ).then(e => {
            if (!e || !e.data || e.errors) {
                const {message: t, code: r} = e.errors[0];
                throw {message: t, code: r};
            }
            return (function(e, t) {
                const r = e.assets.find(e => e.id === t);
                return {title: P(e.metas, 'title') || e.name, asset: {linkedType: r.linked_type}};
            })(e.data.Article, t);
        });
    }
}
class S {
    constructor() {
        (this.videoPlayer = new f()), (this.castSender = new k()), (this.apiService = new _());
    }
    play({
        selector: e,
        apiBaseUrl: t,
        projectId: r,
        articleId: s,
        assetId: a,
        token: i,
        posterImageUrl: n,
        autoplay: o,
        fullScreen: l,
        continueFromPreviousPosition: c,
    }) {
        return e
            ? t
                ? s
                    ? a
                        ? r
                            ? (this.apiService.init(t, r),
                              this.apiService.setToken(i),
                              this.videoPlayer.init(e, t, r, {autoplay: o, poster: n}),
                              this.apiService
                                  .getArticleAssetPlayConfig(s, a, c)
                                  .then(e => (this.playVideo(e, n, l), e))
                                  .catch(e => {
                                      throw (console.log(C(e.code)), e);
                                  }))
                            : Promise.reject('projectId property is missing')
                        : Promise.reject('assetId property is missing')
                    : Promise.reject('articleId property is missing')
                : Promise.reject('apiBaseUrl property is missing')
            : Promise.reject('selector property is missing');
    }
    destroy() {
        this.videoPlayer.destroy();
    }
    playVideo(e, t, r) {
        this.videoPlayer.play(e, t, r);
    }
    setupChromecast(e, t) {
        const r = e instanceof Element ? e : document.querySelector(e),
            s = document.createElement('google-cast-launcher');
        return r.appendChild(s), this.castSender.init(t);
    }
    castVideo({apiBaseUrl: e, projectId: t, articleId: r, assetId: s, token: a, continueFromPreviousPosition: i}) {
        return e
            ? r
                ? s
                    ? t
                        ? (this.apiService.init(e, t),
                          this.apiService.setToken(a),
                          Promise.all([this.apiService.getArticleAssetPlayConfig(r, s, i), this.apiService.getArticle(r, s)])
                              .then(([e, t]) => (this.castSender.castVideo(e, t, i), e))
                              .catch(e => {
                                  throw (console.log(C(e.code)), e);
                              }))
                        : Promise.reject('projectId property is missing')
                    : Promise.reject('assetId property is missing')
                : Promise.reject('articleId property is missing')
            : Promise.reject('apiBaseUrl property is missing');
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
class b {
    constructor(e, t, r) {
        (this.player = e),
            (this.playerController = t),
            (this.controlInitialized = !1),
            (this.totalDuration = e.duration || 0),
            (this.currentTime = e.currentTime || 0),
            (this.currentStatus = e.playerState),
            this.createChromecastControlsTemplate(r),
            this.bindEvents(),
            this.setPlayButtonClass(),
            this.bindEventsToControls(),
            this.setProgressBarValues(),
            this.setTitle();
    }
    bindEvents() {
        this.playerController.addEventListener(cast.framework.RemotePlayerEventType.MEDIA_INFO_CHANGED, () => {
            this.rootElement && this.player.mediaInfo && (this.renderTracks(), this.renderTracksButton(), this.setTitle());
        }),
            this.playerController.addEventListener(cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED, e => {
                this.rootElement &&
                    ((this.currentTime = e.value), (this.totalDuration = this.player.duration), this.setProgressBarValues());
            }),
            this.playerController.addEventListener(cast.framework.RemotePlayerEventType.PLAYER_STATE_CHANGED, e => {
                this.rootElement &&
                    ((this.currentStatus = e.value),
                    this.checkChromecastContainerVisibility(),
                    this.setPlayButtonClass(),
                    this.setProgressBarValues());
            }),
            this.checkChromecastContainerVisibility();
    }
    createChromecastControlsTemplate(e) {
        const t = e ? document.querySelector(e) : document.body;
        t.insertAdjacentHTML(
            'beforeend',
            '\n            <div class="chromecast-controls">\n               <div class="chromecast-controls__title"></div>\n               <div class="chromecast-controls__progress-bar">\n                 <div class="chromecast-controls__progress-bar__current"></div>\n                 <input type="range"\n                        value="0"\n                        class="chromecast-controls__progress-bar__slider" \n                        min="0"\n                        max="100"/>\n                 <div class="chromecast-controls__progress-bar__total"></div>\n               </div>\n              <div class="chromecast-controls__buttons">\n                <button class="control-button button__play play-pause-button" type="button"></button>\n                <button class="control-button button__stop" type="button"></button>\n                <div class="buttons-container tracks-button-container" style="display: none">\n                  <button class="control-button button__audio-tracks" type="button"></button>\n                  <div class="chromecast-controls__subtitles" style="display: none">\n                      <div class="chromecast-controls__subtitles__close-icon">&#215;</div>\n                      <div class="container-wrapper container-wrapper_audio-tracks">\n                        <div class="list-title">Audio tracks</div>\n                      </div>\n                      <div class="container-wrapper container-wrapper_text-tracks">\n                        <div class="list-title">Text tracks</div>\n                      </div>\n                  </div>\n                </div>\n               </div>\n            </div>\n        '
        ),
            (this.rootElement = t.querySelector('.chromecast-controls')),
            this.rootElement.querySelector('.button__audio-tracks').addEventListener('click', () => this.toggleTracksDialogue()),
            this.rootElement
                .querySelector('.chromecast-controls__subtitles__close-icon')
                .addEventListener('click', () => this.toggleTracksDialogue()),
            this.rootElement.querySelector('.chromecast-controls__progress-bar__slider').addEventListener('input', e => {
                this.seek(e.target.value);
            });
    }
    setPlayButtonClass() {
        const e = this.getElement('.play-pause-button');
        this.currentStatus === chrome.cast.media.PlayerState.PAUSED
            ? e.classList.replace('button__pause', 'button__play')
            : e.classList.replace('button__play', 'button__pause');
    }
    bindEventsToControls() {
        const e = this.getElement('.play-pause-button'),
            t = this.getElement('.button__stop');
        this.controlInitialized ||
            (e.addEventListener('click', () => this.playPause()),
            t.addEventListener('click', () => this.stop()),
            (this.controlInitialized = !0));
    }
    renderTracksButton() {
        const e = this.getElement('.tracks-button-container'),
            t = cast.framework.CastContext.getInstance()
                .getCurrentSession()
                .getMediaSession();
        let r = [],
            s = [];
        this.player.mediaInfo &&
            this.player.mediaInfo.tracks &&
            t &&
            ((r = this.getTracksByType('AUDIO')), (s = this.getTracksByType('TEXT'))),
            r.length || s.length ? (e.style.display = 'unset') : (e.style.display = 'none');
    }
    renderTracks() {
        this.removeTracks();
        const e = this.getElement('.container-wrapper_audio-tracks'),
            t = this.getElement('.container-wrapper_text-tracks'),
            r = cast.framework.CastContext.getInstance()
                .getCurrentSession()
                .getMediaSession();
        let s = [],
            a = [];
        this.player.mediaInfo &&
            this.player.mediaInfo.tracks &&
            r &&
            ((s = this.getTracksByType('AUDIO')), (a = this.getTracksByType('TEXT'))),
            s.length && e.appendChild(this.getTracksList(s, 'AUDIO')),
            a.length && t.appendChild(this.getTracksList(a, 'TEXT'));
    }
    removeTracks() {
        const e = this.rootElement.getElementsByClassName('list-container');
        e.length &&
            Array.from(e).forEach(e => {
                e.remove();
            });
    }
    toggleTracksDialogue() {
        const e = this.getElement('.chromecast-controls__subtitles');
        'none' === e.style.display ? (this.renderTracks(), (e.style.display = 'unset')) : ((e.style.display = 'none'), this.removeTracks());
    }
    getTracksList(e, t) {
        const r = document.createElement('ul');
        return (
            r.classList.add('list-container'),
            r.addEventListener('click', e => this.setActiveTrack(e, 'AUDIO' === t ? 'AUDIO' : 'TEXT')),
            e.forEach(e => {
                const t = document.createElement('li');
                t.classList.add('list-item'),
                    e.active ? t.classList.add('active') : t.classList.remove('active'),
                    (t.innerText = e.locale),
                    (t.value = e.id),
                    r.appendChild(t);
            }),
            r
        );
    }
    getActiveTracksByType(e) {
        return this.getTracksByType(e)
            .filter(e => e.active)
            .map(e => e.id);
    }
    getTracksByType(e) {
        const t = cast.framework.CastContext.getInstance()
            .getCurrentSession()
            .getMediaSession();
        return this.player.mediaInfo.tracks
            .filter(t => t.type === e)
            .map(e => ({id: e.trackId, locale: e.language, active: t.activeTrackIds && -1 !== t.activeTrackIds.indexOf(e.trackId)}));
    }
    setTitle() {
        this.player.mediaInfo && (this.getElement('.chromecast-controls__title').innerText = this.player.mediaInfo.metadata.title);
    }
    getTransformedDurationValue(e) {
        const t = Math.floor(e / 3600),
            r = Math.floor((e - 3600 * t) / 60),
            s = Math.round(e - 3600 * t - 60 * r);
        let a = '';
        return e || 0 !== e ? (t > 0 && ((a = t + ':'), r < 10 && (a += '0')), (a += r + ':'), s < 10 && (a += '0'), a + s) : '-';
    }
    setProgressBarValues() {
        if (this.rootElement) {
            const e = this.getElement('.chromecast-controls__progress-bar__current'),
                t = this.getElement('.chromecast-controls__progress-bar__total'),
                r = this.getElement('.chromecast-controls__progress-bar__slider');
            (e.innerText = this.getTransformedDurationValue(this.currentTime)),
                (t.innerText = this.getTransformedDurationValue(this.totalDuration)),
                (r.max = this.totalDuration),
                (r.value = this.currentTime);
        }
    }
    checkChromecastContainerVisibility() {
        this.currentStatus === chrome.cast.media.PlayerState.IDLE
            ? (this.rootElement.style.display = 'none')
            : (this.rootElement.style.display = 'block');
    }
    playPause() {
        this.player && this.player.isConnected && this.playerController.playOrPause();
    }
    seek(e) {
        this.player && this.player.isConnected && ((this.player.currentTime = e), this.playerController.seek());
    }
    stop() {
        this.player && this.player.isConnected && this.playerController.stop();
    }
    setActiveTrack(e, t) {
        if (e.target instanceof HTMLLIElement && 'LI' === e.target.nodeName) {
            e.stopPropagation();
            const r = e.target.value,
                s = this.getActiveTracksByType('AUDIO' === t ? 'TEXT' : 'AUDIO');
            r > 0 && -1 === s.indexOf(r) && s.push(r), this.setActiveTracks(s);
        }
    }
    setActiveTracks(e) {
        if (this.player && this.player.isConnected) {
            const t = cast.framework.CastContext.getInstance()
                    .getCurrentSession()
                    .getMediaSession(),
                r = new chrome.cast.media.EditTracksInfoRequest(e);
            t.editTracksInfo(
                r,
                () => {
                    this.toggleTracksDialogue();
                },
                e => console.error('ChromeCast', e)
            );
        }
    }
    getElement(e) {
        return this.rootElement.querySelector(e);
    }
}
var E = t.Af,
    w = t.Cz,
    I = t.Yn,
    A = t.Y7;
export {E as ChromecastControls, w as ChromecastSender, I as EmbedPlayer, A as VideoPlayer};
//# sourceMappingURL=bundle.js.map
