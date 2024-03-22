declare const videojs: any;

export function supportsNativeHLS() {
    return (videojs.browser.IS_ANY_SAFARI && videojs.browser.IS_IOS) || videojs.browser.IS_SAFARI;
}

export function supportsHLS() {
    return videojs.browser.IS_ANY_SAFARI || videojs.browser.IS_IOS;
}
