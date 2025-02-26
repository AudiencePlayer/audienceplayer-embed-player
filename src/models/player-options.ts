// or just videojs.PlayerOptions
export class PlayerOptions {
    autoplay: boolean;
    poster?: string;
    playbackRates?: number[];
    overlay?: {element: HTMLElement};
    customOverlay?: {element: HTMLElement};
    skipIntro?: {label: string};
}

export class EmeOptions {
    keySystems?: {
        [key: string]: any;
    };
    emeHeaders?: {
        [key: string]: any;
    };
}
