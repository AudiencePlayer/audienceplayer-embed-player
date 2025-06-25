import { DeviceModelContextEnum, PlayParams } from '../models/play-params';
export declare class ApiService {
    private apiFetchUrl;
    private token;
    constructor(baseUrl: string, projectId: number);
    setToken(token: string): void;
    getArticle(articleId: number): Promise<import("../models/article").Article>;
    getArticleAssetPlayConfig(playParams: PlayParams, deviceModelContext?: DeviceModelContextEnum, supportsDRM?: boolean): Promise<import("..").PlayConfig>;
}
