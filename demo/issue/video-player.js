const urlQueryString = window.location.search;
const urlParams = new URLSearchParams(urlQueryString);
const testCase = +urlParams.get('testCase') || 1;

const testCaseElement = document.querySelector('#test-case');
const videoContainer = document.querySelector('#video-container');
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
    autoplay: true,
};

const player = videojs(videoElement, playOptions);
player.eme();

const playSources = [];
let testCaseText = 'Non existing test case';

switch (testCase) {
    case 1:
        testCaseText = 'Case 1. Video with Widevine; works on all tested devices.';
        playSources.push({
            src:
                'https://audienceplayer.streaming.mediaservices.windows.net/f811fab4-e387-4086-901b-e25d183024c5/returntodust-trailer-widevine-dr.ism/manifest(format=mpd-time-csf,encryption=cenc).mpd',
            type: 'application/dash+xml',
            keySystems: {
                'com.widevine.alpha':
                    'https://audienceplayer.keydelivery.westeurope.media.azure.net/Widevine/?kid=95de9701-423b-487c-a227-3d48ec38c190',
            },
            emeHeaders: {
                Authorization:
                    'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vY29yZS5hdWRpZW5jZXBsYXllci5jb20iLCJhdWQiOiJodHRwOi8vY29yZS5hdWRpZW5jZXBsYXllci5jb20iLCJuYmYiOjE3MDQyNzY3MzYsImV4cCI6MjAyMDUwMTMzNiwidXJuOm1pY3Jvc29mdDphenVyZTptZWRpYXNlcnZpY2VzOmNvbnRlbnRrZXlpZGVudGlmaWVyIjoiOTVkZTk3MDEtNDIzYi00ODdjLWEyMjctM2Q0OGVjMzhjMTkwIn0.taRMtFkaaWuZ7YdBKYx1ks1PQ1_WTSwUIMYlyonmBDM',
            },
        });
        break;
    case 2:
        testCaseText = 'Case 2. Video with Widevine; Does NOT work an Android 14 devices.';
        playSources.push({
            src:
                'https://audienceplayer.streaming.mediaservices.windows.net/5e1075e2-2acf-47e6-a9a0-938f784db7f6/triangle-of-sadness-trailer-wide.ism/manifest(format=mpd-time-csf,encryption=cenc).mpd',
            type: 'application/dash+xml',
            keySystems: {
                'com.widevine.alpha':
                    'https://audienceplayer.keydelivery.westeurope.media.azure.net/Widevine/?kid=3ebd18e4-74a6-4026-99dd-165aecc28e65',
            },
            emeHeaders: {
                Authorization:
                    'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vY29yZS5hdWRpZW5jZXBsYXllci5jb20iLCJhdWQiOiJodHRwOi8vY29yZS5hdWRpZW5jZXBsYXllci5jb20iLCJuYmYiOjE3MDQyNzY3ODUsImV4cCI6MjAyMDUwMTM4NSwidXJuOm1pY3Jvc29mdDphenVyZTptZWRpYXNlcnZpY2VzOmNvbnRlbnRrZXlpZGVudGlmaWVyIjoiM2ViZDE4ZTQtNzRhNi00MDI2LTk5ZGQtMTY1YWVjYzI4ZTY1In0.UZ_wnrQgcLBQESGZfuqiZ953O39z02HlGYQAIzFI0lk',
            },
        });
        break;
    case 3:
        testCaseText = 'Case 3. Same video as case 2, but without Widevine; Works on all tested devices';
        playSources.push({
            src:
                'https://audienceplayer.streaming.mediaservices.windows.net/dadbb15e-b7af-4702-985d-42b6757d7bd9/triangle-of-sadness-trailer-with.ism/manifest(format=mpd-time-csf).mpd',
            type: 'application/dash+xml',
        });
        break;
    default:
        console.warn('Non existing test case');
}

player.src(playSources);

console.log(`Testcase  ${testCase}`);
testCaseElement.innerHTML = testCaseText;
