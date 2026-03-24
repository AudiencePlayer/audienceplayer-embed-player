export function supportsNativeHLS(videojs: any) {
    // return true when we expect that there is a native video player available
    return (videojs.browser.IS_ANY_SAFARI && videojs.browser.IS_IOS) || videojs.browser.IS_SAFARI;
}

export function supportsHLS(videojs: any) {
    // return true when we expect that HLS AND FPS are supported
    return videojs.browser.IS_ANY_SAFARI || videojs.browser.IS_IOS;
}
