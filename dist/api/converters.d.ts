import { ArticlePlayConfig, ArticlePlayErrors } from '../models/play-config';
import { Article } from '../models/article';
import { FileData } from '../models/file-data';
export declare function toPlayConfig(config: any, continueFromPreviousPosition: boolean): ArticlePlayConfig;
export declare function toArticle(article: any): Article;
export declare function toFile(file: any): FileData;
export declare function getMetaValue(metas: any, key: string): any;
export declare function getResizedUrl(fileData: FileData, size: {
    width: number;
    height: number;
}): string;
export declare function getArticleTitle(article: Article): any;
export declare function getArticleBackgroundImage(article: Article): FileData;
export declare function toPlayConfigError(code: number): ArticlePlayErrors;
