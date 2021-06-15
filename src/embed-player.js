export default class EmbedPlayer {
  constructor() {
    this.isPlaying = false;
    this.isFirstPlay = true;
    this.lastPlayTime = Date.now();
    this.myPlayer = null;
    this.castPlayer = null;
    this.castContext = null;
    this.castPlayerController = null;
  }

  initPlayer(selector) {
    this.destroy();
    const videoContainer = document.querySelector(selector);
    const videoElement = document.createElement("video");
    videoElement.setAttribute(
      "class",
      ["azuremediaplayer", "amp-flush-skin", "amp-big-play-centered"].join(" ")
    );
    videoElement.setAttribute("tabIndex", "0");
    videoElement.setAttribute("width", "100%");
    videoElement.setAttribute("height", "100%");
    videoElement.setAttribute("id", "azuremediaplayer");
    videoContainer.appendChild(videoElement);
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
  }) {
    if (!selector) {
      return Promise.reject("selector property is missing");
    }
    if (!apiBaseUrl) {
      return Promise.reject("apiBaseUrl property is missing");
    }
    if (!articleId) {
      return Promise.reject("articleId property is missing");
    }
    if (!assetId) {
      return Promise.reject("assetId property is missing");
    }
    if (!projectId) {
      return Promise.reject("projectId property is missing");
    }
    const apiFetchUrl = `${apiBaseUrl}/graphql/${projectId}`;
    const heartBeatUrl = `${apiBaseUrl}/service/analytics/stream/pulse/`;
    this.initPlayer(selector);
    return this.getPlayConfig(
      apiFetchUrl,
      articleId,
      assetId,
      heartBeatUrl,
      token
    ).then((config) => {
      this.playVideo(config, posterImageUrl, !!autoplay);
      return config;
    });
  }

  destroy() {
    if (this.myPlayer) {
      this.myPlayer.dispose();
      this.myPlayer = null;
    }
  }

  playVideo(configData, posterUrl, autoplay) {
    const videoElement = document.querySelector("video");
    var myOptions = {
      autoplay,
      controls: true,
      fluid: true,
    };
    if (posterUrl) {
      myOptions.poster = posterUrl;
    }
    this.myPlayer = amp(videoElement, myOptions);
    this.myPlayer.src(configData.config.player, configData.config.options);
    this.bindEvents(configData);
  }

  bindEvents(configData) {
    if (this.myPlayer) {
      this.myPlayer.addEventListener("error", (event) =>
        this.eventHandler(event, configData)
      );

      this.myPlayer.addEventListener("ended", (event) =>
        this.eventHandler(event, configData)
      );

      this.myPlayer.addEventListener("pause", (event) =>
        this.eventHandler(event, configData)
      );

      this.myPlayer.addEventListener("timeupdate", (event) =>
        this.eventHandler(event, configData)
      );

      this.myPlayer.addEventListener("playing", (event) =>
        this.eventHandler(event, configData)
      );
    }
  }

  eventHandler(event, config) {
    switch (event.type) {
      case "timeupdate":
        {
          if (this.isPlaying) {
            if (Date.now() - this.lastPlayTime > 30000) {
              this.sendPulse(
                config.heartBeatUrl + "update",
                this.getHeartBeatParams(config)
              );
              this.lastPlayTime = Date.now();
            }
          }
        }
        break;
      case "playing":
        {
          if (this.isFirstPlay) {
            this.isFirstPlay = false;
            this.myPlayer.currentTime(config.currentTime);
          }
          this.sendPulse(
            config.heartBeatUrl + "init",
            this.getHeartBeatParams(config)
          );
          this.lastPlayTime = Date.now();
          this.isPlaying = true;
        }
        break;
      case "pause":
        {
          this.sendPulse(
            config.heartBeatUrl + "update",
            this.getHeartBeatParams(config)
          );
          this.lastPlayTime = Date.now();
          this.isPlaying = false;
        }
        break;
      case "ended":
        {
          this.sendPulse(
            config.heartBeatUrl + "finish",
            this.getHeartBeatParams(config)
          );
          this.lastPlayTime = Date.now();
          this.isPlaying = false;
        }
        break;
    }
  }

  getHeartBeatParams(config) {
    return {
      appa: "" + this.myPlayer.currentTime(),
      appr:
        "" +
        Math.min(this.myPlayer.currentTime() / this.myPlayer.duration(), 1),
      pulseToken: config.pulseToken,
    };
  }

  sendPulse(heartBeatUrl, config) {
    const url = `${heartBeatUrl}?pulse_token=${config.pulseToken}&appa=${config.appa}&appr=${config.appr}`;
    fetch(url).then();
  }

  getPlayConfig(apiBaseUrl, articleId, assetId, heartBeatUrl, token) {
    let article = {};
    let config = {};

    return this.getArticle(apiBaseUrl, articleId, token)
      .then((response) => response.json())
      .then((articleData) => {
        if (!articleData || !articleData.data || articleData.errors) {
          const { message, code } = articleData.errors[0];
          throw { message, code };
        }
        article = { ...articleData.data.Article };
        return this.getArticleAssetPlayConfig(
          apiBaseUrl,
          articleId,
          assetId,
          token
        );
      })
      .then((response) => response.json())
      .then((configData) => {
        if (!configData || !configData.data || configData.errors) {
          const { message, code } = configData.errors[0];
          throw { message, code };
        }
        config = this.toPlayConfigConverter(
          article,
          assetId,
          configData.data.ArticleAssetPlay,
          heartBeatUrl
        );
        return config;
      });
  }

  getArticle(apiBaseUrl, articleId, token) {
    const articleQuery = `
            query Article($articleId: Int!) {
                Article(id: $articleId) {
                    id
                    name
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

    const authHeader = token ? { Authorization: "Bearer " + token } : {};

    return fetch(apiBaseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...authHeader,
      },
      body: JSON.stringify({
        query: articleQuery,
        variables: { articleId },
      }),
    });
  }

  getArticleAssetPlayConfig(apiBaseUrl, articleId, assetId, token) {
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
                    }
                    subtitles_new {
                        url
                        locale
                        locale_label
                    }
                    pulse_token
                    appa
                    appr
                    fairplay_certificate_url
                }
            }
        `;

    const authHeader = token ? { Authorization: "Bearer " + token } : {};

    return fetch(apiBaseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...authHeader,
      },
      body: JSON.stringify({
        query: articleAssetPlayMutation,
        variables: { articleId, assetId, protocols: ["dash", "mss", "hls"] },
      }),
    });
  }

  toPlayConfigConverter(article, assetId, config, heartBeatUrl) {
    const asset = article.assets.find((item) => item.id === assetId);
    const options = config.subtitles_new.map((item) => ({
      src: item.url,
      srclang: item.locale,
      kind: "subtitles",
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
      heartBeatUrl: heartBeatUrl,
    };
  }

  isSafari() {
    let chromeUserAgent = navigator.userAgent.indexOf("Chrome") > -1;
    let safariUserAgent = navigator.userAgent.indexOf("Chrome") > -1;
    if (chromeUserAgent && safariUserAgent) safariUserAgent = false;
    return safariUserAgent;
  }

  getPlayerConfig(config) {
    const playerConfigs = [];

    // check if the entitlements contain FPS in order to know when to filter out aes
    const filterAES = !!config.entitlements.find(
      (entitlement) => entitlement.encryption_type === "fps"
    );
    const entitlements = filterAES
      ? config.entitlements.filter((entitlement) => {
          return entitlement.encryption_type !== "aes";
        })
      : config.entitlements;

    entitlements.forEach((entitlement) => {
      const entitlementConfig = {
        src: entitlement.manifest,
        type: entitlement.mime_type,
        protectionInfo: null,
      };

      if (entitlement.token) {
        if (entitlement.encryption_type === "cenc") {
          entitlementConfig.protectionInfo = [
            {
              type: "PlayReady",
              authenticationToken: "Bearer=" + entitlement.token,
            },
            {
              type: "Widevine",
              authenticationToken: "Bearer " + entitlement.token,
            },
          ];
        } else if (entitlement.encryption_type === "fps") {
          entitlementConfig.protectionInfo = [
            {
              type: "FairPlay",
              authenticationToken: "Bearer " + entitlement.token,
              certificateUrl: config.fairplay_certificate_url,
            },
          ];
        }
      }
      playerConfigs.push(entitlementConfig);
    });
    return playerConfigs;
  }

  setupChromecast(selector, chromecastReceiverAppId) {
    const castButtonContaner = document.querySelector(selector);
    const castButton = document.createElement("google-cast-launcher");
    castButtonContaner.appendChild(castButton);
    if (chromecastReceiverAppId) {
      window["__onGCastApiAvailable"] = (isAvailable) => {
        if (isAvailable && cast && cast.framework) {
          this.initializeCastApi(chromecastReceiverAppId);
        }
      };

      const scriptElement = document.createElement("script");
      scriptElement.src =
        "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";
      document.head.appendChild(scriptElement);
    }
  }

  initializeCastApi(chromecastReceiverAppId) {
    cast.framework.CastContext.getInstance().setOptions({
      receiverApplicationId: chromecastReceiverAppId,
      autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
    });
    this.castContext = cast.framework.CastContext.getInstance();
    this.castPlayer = new cast.framework.RemotePlayer();
    this.playerController = new cast.framework.RemotePlayerController(
      this.castPlayer
    );
  }

  getCastMediaInfo = (articlePlayConfig) => {
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
        castTrack.trackContentType = "text/vtt";
        castTrack.subtype = chrome.cast.media.TextTrackType.SUBTITLES;
        castTrack.name = option.label;
        castTrack.language = option.srclang;
        castTrack.customDate = null;
        return castTrack;
      });
      const contentType = "application/vnd.ms-sstr+xml";
      const entitlement = articlePlayConfig.config.player.find((item) => {
        return item.type === contentType;
      });
      const protectionConfig = entitlement.protectionInfo.find((protection) => {
        return protection.type === "PlayReady";
      });
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
      mediaInfo.metadata.title = articlePlayConfig.article.name;
      mediaInfo.tracks = tracks;
      mediaInfo.customData = {
        ...this.getLicenseUrlFromSrc(entitlement.src, token),
        pulseToken: articlePlayConfig.pulseToken,
      };
      mediaInfo.currentTime = articlePlayConfig.currentTime;
      mediaInfo.autoplay = true;

      return mediaInfo;
    }
    return null;
  };

  getLicenseUrlFromSrc = (src, token) => {
    if (token) {
      const res1 = src.match(
        /^https:\/\/([^.]+)\.streaming\.mediaservices\.windows\.net\/.*/i
      );
      const res2 = src.match(
        /^https:\/\/([a-z0-9_]+)-euwe.streaming\.media\.azure\.net\/.*/i
      );
      const res = res1 ? res1 : res2;

      if (res && res.length === 2) {
        const licenseUrl =
          "https://" +
          res[1] +
          ".keydelivery.westeurope.media.azure.net/PlayReady/?token=" +
          encodeURIComponent(token);
        return {
          licenseUrl,
          token,
        };
      }
    }
    return {};
  };

  castVideo({ apiBaseUrl, projectId, articleId, assetId, token }) {
    if (!apiBaseUrl) {
      return Promise.reject("apiBaseUrl property is missing");
    }
    if (!articleId) {
      return Promise.reject("articleId property is missing");
    }
    if (!assetId) {
      return Promise.reject("assetId property is missing");
    }
    if (!projectId) {
      return Promise.reject("projectId property is missing");
    }
    const apiFetchUrl = `${apiBaseUrl}/graphql/${projectId}`;
    return this.getPlayConfig(
      apiFetchUrl,
      articleId,
      assetId,
      null,
      token
    ).then((config) => {
      if (this.isConnected()) {
        const castSession = this.castContext.getCurrentSession();
        const mediaInfo = this.getCastMediaInfo(config);

        if (mediaInfo) {
          const request = new chrome.cast.media.LoadRequest(mediaInfo);
          request.currentTime = config.currentTime;
          return castSession.loadMedia(request);
        } else {
          throw { message: "Unexpected manifest format in articlePlayConfig" };
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
//         posterImageUrl: ''
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
//         selector: '.video-wrapper',
//         apiBaseUrl: '',
//         projectId: '',
//         articleId: '',
//         assetId: '',
//         token: '',
//     })
//     .then(config => {
//         console.log('Config', config);
//     })
//     .catch(error => {
//         console.log('Error', error);
//     });
