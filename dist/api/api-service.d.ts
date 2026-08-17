import { PlayParams } from '../models/play-params';
export declare class ApiService {
    private apiFetchUrl;
    private token;
    constructor(baseUrl: string, projectId: number);
    setToken(token: string): void;
    getArticle(articleId: number): Promise<import("..").Article>;
    getArticleAssetPlayConfig(playParams: PlayParams, supportsDRM?: boolean): Promise<import("..").PlayConfig>;
}
