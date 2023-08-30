// or just videojs.PlayerOptions
export class PlayerOptions {
    autoplay: boolean;
    poster?: string;
    playbackRates?: number[];
}

export class EmeOptions {
    keySystems?: {
        [key: string]: any;
    };
    emeHeaders?: {
        Authorization: string;
    };
}
