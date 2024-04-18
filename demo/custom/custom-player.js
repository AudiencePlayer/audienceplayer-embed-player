import {VideoPlayer} from '../../dist/bundle.js';

(function() {
    const urlQueryString = window.location.search;
    const urlParams = new URLSearchParams(urlQueryString);
    const allProperties = [
        'protocol',
        'src',
        'mediaProvider',
        'encryptionProvider',
        'keyDeliveryUrl',
        'token',
        'certificateUrl',
        'contentKeyId',
    ];

    loadValues();
    storeValues(false);

    const protocol = localStorage.getItem('protocol');
    const src = localStorage.getItem('src');
    const mediaProvider = localStorage.getItem('mediaProvider');
    const encryptionProvider = localStorage.getItem('encryptionProvider');
    const keyDeliveryUrl = localStorage.getItem('keyDeliveryUrl');
    const token = localStorage.getItem('token');
    const certificateUrl = localStorage.getItem('certificateUrl');
    const contentKeyId = localStorage.getItem('contentKeyId');

    const tokenParameter = token ? {token} : {};
    const output = document.querySelector('#output');

    const initParam = {
        selector: '.media-player__video-player',
        options: {
            autoplay: true,
        },
    };

    document.getElementById('video-button-start').addEventListener('click', playVideo);
    document.getElementById('video-button-destroy').addEventListener('click', destroyVideo);
    document.getElementById('setButton').addEventListener('click', () => storeValues(true));

    const videoPlayer = new VideoPlayer();
    videoPlayer.init(initParam);

    function playVideo() {
        const config = {
            pulseToken: null,
            entitlements: [
                {
                    src: src,
                    type: protocol,
                    protectionInfo:
                        encryptionProvider === 'none'
                            ? null
                            : {
                                  encryptionProvider: encryptionProvider,
                                  keyDeliveryUrl: keyDeliveryUrl,
                                  token: token,
                                  certificateUrl: certificateUrl,
                                  contentKeyId: contentKeyId,
                              },
                    mediaProvider: mediaProvider,
                },
            ],
            subtitles: [],
            audioLocale: '',
        };

        //

        videoPlayer.play(config, initParam);

        const playerInstance = videoPlayer.getPlayer();

        playerInstance.on('loadedmetadata', () => {
            output.innerText = 'Loaded metadata';
            const audioTracks = playerInstance.audioTracks();
            const out = [];
            if (audioTracks) {
                for (let i = 0; i < audioTracks.length; i++) {
                    out.push({
                        selected: audioTracks[i].enabled,
                        language: audioTracks[i].language,
                    });
                }
            }
            output.innerText = 'Audio tracks \n' + JSON.stringify(out, null, 4);
        });
    }

    function destroyVideo() {
        videoPlayer.destroy();
    }

    function storeProperty(name) {
        const propertyEl = document.getElementById(name);
        const value = propertyEl.type === 'checkbox' ? (propertyEl.checked ? 'true' : 'false') : '' + propertyEl.value;
        localStorage.setItem(name, value);
    }

    function loadProperty(name) {
        const propertyEl = document.getElementById(name);
        if (propertyEl.type === 'checkbox') {
            propertyEl.checked = localStorage.getItem(name) === 'true';
        } else {
            propertyEl.value = urlParams.get(name) || localStorage.getItem(name) || '';
        }
    }

    function storeValues(reload) {
        allProperties.forEach(name => {
            storeProperty(name);
        });

        if (reload) {
            const qs = allProperties.map(name => name + '=' + encodeURIComponent(localStorage.getItem(name))).join('&');
            location.href = `${location.protocol}//${location.host}${location.pathname}?${qs}&${Math.random()}`;
        }
    }

    function loadValues() {
        allProperties.forEach(name => {
            loadProperty(name);
        });
    }
})();
