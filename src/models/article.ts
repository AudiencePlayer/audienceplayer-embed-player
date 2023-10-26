import {FileData} from './file-data';

export interface Article {
    name: string;
    metas: {
        [key: string]: string;
    };
    posters: FileData[];
    images: FileData[];
}
