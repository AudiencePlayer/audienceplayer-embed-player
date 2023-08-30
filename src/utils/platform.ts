import {parseUserAgent} from 'detect-browser';

export function willPlayHls() {
    const browser = parseUserAgent(navigator.userAgent);
    return browser && (browser.name === 'safari' || browser.name === 'ios');
}
