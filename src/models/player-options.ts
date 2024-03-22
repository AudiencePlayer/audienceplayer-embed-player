// or just videojs.PlayerOptions
export class PlayerOptions {
    autoplay: boolean;
    poster?: string;
    playbackRates?: number[];
    overlay?: {element: HTMLElement};
    customOverlay?: {element: HTMLElement};
}

export class EmeOptions {
    keySystems?: {
        [key: string]: any;
    };
    emeHeaders?: {
        [key: string]: any;
    };
}
