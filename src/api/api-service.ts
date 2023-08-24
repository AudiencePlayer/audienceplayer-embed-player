import {graphRequest} from './graph-request';
import {articleAssetPlayMutation, articleQuery} from './queries';
import {toArticle, toPlayConfig} from './converters';

export class ApiService {
    private apiFetchUrl: string;
    private token: string;

    init(baseUrl: string, projectId: number) {
        this.apiFetchUrl = `${baseUrl}/graphql/${projectId}`.replace(/\/*$/, '');
        this.token = null;
    }

    setToken(token: string) {
        this.token = token;
    }

    getArticleAssetPlayConfig(articleId: number, assetId: number, continueFromPreviousPosition: boolean) {
        return graphRequest(
            this.apiFetchUrl,
            articleAssetPlayMutation,
            {articleId, assetId, protocols: ['dash', 'mss', 'hls']},
            this.token
        ).then((response: any) => {
            if (!response || !response.data || response.errors) {
                const {message, code} = response.errors[0];
                throw {message, code}; // @TODO to play config error
            }

            return toPlayConfig(response.data.ArticleAssetPlay, continueFromPreviousPosition);
        });
    }

    getArticle(articleId: number, assetId: number) {
        return graphRequest(this.apiFetchUrl, articleQuery, {articleId}, this.token).then((response: any) => {
            if (!response || !response.data || response.errors) {
                const {message, code} = response.errors[0];
                throw {message, code};
            }
            return toArticle(response.data.Article, assetId);
        });
    }
}
