declare const videojs: any;

export function supportsHLS() {
    return videojs.browser.IS_SAFARI || videojs.browser.IS_IOS;
}
