import {FileData} from './file-data';

export interface Article {
    id: number;
    name: string;
    metas: {
        [key: string]: string;
    };
    posters: FileData[];
    images: FileData[];
    assets: Asset[];
}

export interface Asset {
    id: number;
    duration: number;
    linkedType: 'episode' | 'film' | 'preview' | 'trailer';
    accessibility: 'everyone' | 'non_authenticated_only' | 'authenticated_only' | 'authorized_only';
    type: 'audio' | 'video' | 'live_video' | 'mock';
    screenshots: FileData[];
}
