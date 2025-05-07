import { DeviceModelContextEnum } from '../models/play-params';
export declare class ApiService {
    private apiFetchUrl;
    private token;
    constructor(baseUrl: string, projectId: number);
    setToken(token: string): void;
    getArticleAssetPlayConfig(articleId: number, assetId: number, continueFromPreviousPosition: boolean, deviceModelContext?: DeviceModelContextEnum): Promise<import("..").PlayConfig>;
    getArticle(articleId: number): Promise<import("../models/article").Article>;
}
