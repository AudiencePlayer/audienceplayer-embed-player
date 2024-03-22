import { PlayEntitlement } from '../models/play-config';
import { EmeOptions } from '../models/player-options';
export declare function getEmeOptionsFromEntitlement(entitlement: PlayEntitlement): EmeOptions;
export declare function binaryToBase64(a: Uint8Array): string;
export declare function base64ToBinary(a: string): Uint8Array;
export declare function parseLicenseResponse(response: ArrayBuffer): Uint8Array;
export declare function getHostnameFromUri(uri: string): string;
