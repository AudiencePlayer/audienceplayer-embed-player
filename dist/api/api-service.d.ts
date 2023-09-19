export declare class ApiService {
    private apiFetchUrl;
    private token;
    constructor(baseUrl: string, projectId: number);
    setToken(token: string): void;
    getArticleAssetPlayConfig(
        articleId: number,
        assetId: number,
        continueFromPreviousPosition: boolean
    ): Promise<import('../models/play-config').ArticlePlayConfig>;
    getArticle(articleId: number): Promise<import('../models/article').Article>;
}
