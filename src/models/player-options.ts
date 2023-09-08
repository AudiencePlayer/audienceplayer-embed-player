// or just videojs.PlayerOptions
export class PlayerOptions {
    autoplay: boolean;
    poster?: string;
}

export class EmeOptions {
    keySystems?: {
        [key: string]: any;
    };
    emeHeaders?: {
        Authorization: string;
    };
}
