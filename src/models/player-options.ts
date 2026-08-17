// or just videojs.PlayerOptions
export class PlayerOptions {
    autoplay: boolean;
    // preferFullWindow: true together with playsinline: true to force non native iOS player.
    // In practice this can not be used for protected HLS content due to IOS policy.
    preferFullWindow?: boolean;
    playsinline?: boolean;
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
