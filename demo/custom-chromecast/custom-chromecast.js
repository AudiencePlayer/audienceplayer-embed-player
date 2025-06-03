import {ChromecastSender, ChromecastControls} from '../../dist/bundle.js';

(function() {
    const urlQueryString = window.location.search;
    const urlParams = new URLSearchParams(urlQueryString);
    const allProperties = ['articleId', 'assetId', 'chromecastReceiver', 'token'];

    loadValues();
    storeValues(false);

    const chromecastReceiver = localStorage.getItem('chromecastReceiver');
    const castSender = new ChromecastSender(chromecastReceiver);

    const output = document.querySelector('#output');

    document.getElementById('video-button-start').addEventListener('click', playVideo);
    document.getElementById('setButton').addEventListener('click', () => storeValues(true));

    const initPromise = castSender.init();

    onInit();

    function onInit() {
        initPromise.then(() => {
            const castButtonContaner = document.querySelector('#cast-button');
            const castButton = document.createElement('google-cast-launcher');
            castButtonContaner.appendChild(castButton);

            const controls = new ChromecastControls(castSender);

            castSender.setOnConnectedListener(({connected, friendlyName}) => {
                output.innerText = connected ? 'Connected to ' + friendlyName : 'Not connected';
            });
        });
    }

    function playVideo() {
        const assetId = +localStorage.getItem('assetId');
        const articleId = +localStorage.getItem('articleId');
        const token = localStorage.getItem('token');

        castSender.castVideoByParams({assetId, articleId, token});
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
