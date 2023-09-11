// or just videojs.PlayerOptions
export class PlayerOptions {
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
