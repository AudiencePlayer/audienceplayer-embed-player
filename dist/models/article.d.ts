import {FileData} from './file-data';
export interface Article {
    name: string;
    metas: Array<{
        key: string;
        value: string;
    }>;
    posters: FileData[];
    images: FileData[];
}
