import {FileData} from './file-data';

export interface Article {
    id: number;
    name: string;
    metas: {
        [key: string]: string;
    };
    posters: FileData[];
    images: FileData[];
}
