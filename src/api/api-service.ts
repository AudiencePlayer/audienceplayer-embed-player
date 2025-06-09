import {graphRequest} from './graph-request';
import {articleAssetPlayMutation, articleQuery} from './queries';
import {toArticle, toPlayConfig} from './converters';
import {DeviceModelContextEnum, PlayParams} from '../models/play-params';

export class ApiService {
    private apiFetchUrl: string;
    private token: string;

    constructor(baseUrl: string, projectId: number) {
        this.apiFetchUrl = `${baseUrl}/graphql/${projectId}`;
        this.token = null;
    }

    setToken(token: string) {
        this.token = token;
    }

    getArticle(articleId: number) {
        return graphRequest(this.apiFetchUrl, articleQuery, {articleId}, this.token).then((response: any) => {
            if (!response || !response.data || response.errors) {
                const {message, code} = response.errors[0];
                throw {message, code};
            }
            return toArticle(response.data.Article);
        });
    }

    getArticleAssetPlayConfig(playParams: PlayParams, deviceModelContext: DeviceModelContextEnum = null) {
        return graphRequest(
            this.apiFetchUrl,
            articleAssetPlayMutation,
            {
                articleId: playParams.articleId,
                assetId: playParams.assetId,
                protocols: ['dash', 'hls'],
                device_model_context: deviceModelContext,
            },
            this.token
        ).then((response: any) => {
            if (!response || !response.data || response.errors) {
                const {message, code} = response.errors[0];
                throw {message, code};
            }

            return toPlayConfig(response.data.ArticleAssetPlay, playParams);
        });
    }
}
