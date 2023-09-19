/// <reference types="chromecast-caf-sender" />
/// <reference types="chrome/chrome-cast" />
import {ArticlePlayConfig} from '../models/play-config';
import {Article} from '../models/article';
export declare class ChromecastSender {
    castContext: cast.framework.CastContext;
    castPlayer: cast.framework.RemotePlayer;
    castPlayerController: cast.framework.RemotePlayerController;
    init(chromecastReceiverAppId: string): Promise<void>;
    initializeCastApi(chromecastReceiverAppId: string): void;
    getCastMediaInfo(articlePlayConfig: ArticlePlayConfig, article: Article): chrome.cast.media.MediaInfo;
    getLicenseUrlFromSrc(
        src: string,
        token: string
    ):
        | {
              licenseUrl: string;
              token: string;
          }
        | {
              licenseUrl?: undefined;
              token?: undefined;
          };
    castVideo(playConfig: ArticlePlayConfig, article: Article, continueFromPreviousPosition: boolean): Promise<chrome.cast.ErrorCode>;
    isConnected(): boolean;
    stopCasting(): void;
    getCastPlayer(): cast.framework.RemotePlayer;
    getCastPlayerController(): cast.framework.RemotePlayerController;
}
