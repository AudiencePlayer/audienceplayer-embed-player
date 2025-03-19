export function supportsNativeHLS(videojs: any) {
    return (videojs.browser.IS_ANY_SAFARI && videojs.browser.IS_IOS) || videojs.browser.IS_SAFARI;
}

export function supportsHLS(videojs: any) {
    return videojs.browser.IS_ANY_SAFARI || videojs.browser.IS_IOS;
}
