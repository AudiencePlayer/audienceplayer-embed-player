declare const SubtitlesButton: any;
declare const MenuItem: any;
declare class CustomTextTrackMenuItem extends MenuItem {
    constructor(player: any, options: any);
    handleClick(event: any): void;
    handleTracksChange(event?: any): void;
    handleSelectedLanguageChange(event: any): void;
    dispose(): void;
}
export declare class CustomTextTrackButton extends SubtitlesButton {
    constructor(player: any, options?: any);
    createItems(items?: any, TrackMenuItem?: typeof CustomTextTrackMenuItem): any;
}
export declare class CustomSubtitlesButton extends CustomTextTrackButton {
    constructor(player: any, options: any, ready: any);
    buildCSSClass(): string;
    buildWrapperCSSClass(): string;
}
export {};
