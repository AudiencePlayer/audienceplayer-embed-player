declare const videojs: any;

export function supportsNativeHLS() {
    return videojs.browser.IS_IOS;
}
