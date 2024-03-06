import {PlayConfigProtection, PlayEntitlement} from '../models/play-config';
import {EmeOptions} from '../models/player-options';

declare const videojs: any;

export function getEmeOptionsFromEntitlement(entitlement: PlayEntitlement): EmeOptions {
    let protectionInfo: PlayConfigProtection = null;
    let emeOptions: EmeOptions = {};

    if (entitlement.protectionInfo) {
        switch (entitlement.type) {
            case 'application/dash+xml':
                protectionInfo = entitlement.protectionInfo.find(p => p.type === 'Widevine');
                if (protectionInfo) {
                    emeOptions = {
                        keySystems: {
                            'com.widevine.alpha': protectionInfo.keyDeliveryUrl,
                        },
                        emeHeaders:
                            protectionInfo.encryptionProvider === 'azl'
                                ? {
                                      Authorization: protectionInfo.authenticationToken,
                                  }
                                : {},
                    };
                }
                break;
            case 'application/vnd.ms-sstr+xml':
                protectionInfo = entitlement.protectionInfo.find(p => p.type === 'PlayReady');
                if (protectionInfo) {
                    emeOptions = {
                        keySystems: {
                            'com.microsoft.playready': protectionInfo.keyDeliveryUrl,
                        },
                        emeHeaders: {
                            Authorization: protectionInfo.authenticationToken,
                        },
                    };
                }
                break;
            case 'application/vnd.apple.mpegurl':
                protectionInfo = entitlement.protectionInfo.find(p => p.type === 'FairPlay');
                if (protectionInfo) {
                    if (protectionInfo.encryptionProvider === 'azl') {
                        emeOptions = {
                            keySystems: {
                                'com.apple.fps.1_0': {
                                    certificateUri: protectionInfo.certificateUrl,
                                    getContentId: function() {
                                        return getHostnameFromUri(protectionInfo.keyDeliveryUrl);
                                    },
                                    getLicense: function(emeArg: any, contentId: string, keyMessage: any, callback: any) {
                                        const payload = 'spc=' + binaryToBase64(keyMessage) + '&assetId=' + encodeURIComponent(contentId);
                                        videojs.xhr(
                                            {
                                                uri: protectionInfo.keyDeliveryUrl,
                                                method: 'post',
                                                headers: {
                                                    'Content-type': 'application/x-www-form-urlencoded',
                                                    Authorization: protectionInfo.authenticationToken,
                                                },
                                                body: payload,
                                                responseType: 'arraybuffer',
                                            },
                                            videojs.xhr.httpHandler(function(err: any, response: ArrayBuffer) {
                                                callback(null, parseLicenseResponse(response));
                                            }, true)
                                        );
                                    },
                                },
                            },
                        };
                    } else {
                        emeOptions = {
                            keySystems: {
                                'com.apple.fps.1_0': {
                                    certificateUri: protectionInfo.certificateUrl,
                                    getContentId: function(args: any) {
                                        console.log('getContendId', args);
                                        return '61ed392e-d829-4ea4-a550-45e62c6a2161'; // skd://;
                                    },
                                    getLicense: function(emeArg: any, contentId: string, keyMessage: any, callback: any) {
                                        const payload = keyMessage;
                                        console.log('getLicense', emeArg, payload);
                                        videojs.xhr(
                                            {
                                                uri:
                                                    'https://drm-fairplay-licensing.axprod.net/AcquireLicense?AxDrmMessage=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXJzaW9uIjogMSwKImJlZ2luX2RhdGUiOiAiMjAwMC0wMS0wMVQxNjoxODo0MCswMzowMCIsCiJleHBpcmF0aW9uX2RhdGUiOiAiMjAyNS0xMi0zMVQyMzo1OTo0MCswMzowMCIsCiJjb21fa2V5X2lkIjogIjljNmVkOWJkLWIxOGEtNDczOC04ZjlhLWIwYjEwMTA0NzJlNyIsCiJtZXNzYWdlIjogewogICJ0eXBlIjogImVudGl0bGVtZW50X21lc3NhZ2UiLAogICJ2ZXJzaW9uIjogMiwKICAibGljZW5zZSI6IHsKICAgICJkdXJhdGlvbiI6IDMxNTM2MDAwMAogIH0sCiAgImNvbnRlbnRfa2V5c19zb3VyY2UiOiB7CiAgICAiaW5saW5lIjogWwogICAgICB7CiAgICAgICAgImlkIjogIjYxRUQzOTJFLUQ4MjktNEVBNC1BNTUwLTQ1RTYyQzZBMjE2MSIKICAgICAgfQogICAgXQogIH0KfX0.jIMMyVdiJcYBGco5El_xy8LpH7hPe9_sQxoqTCtswBs',
                                                method: 'post',
                                                headers: {
                                                    'Content-type': 'application/octet-stream',
                                                },
                                                body: payload,
                                                responseType: 'arraybuffer',
                                            },
                                            videojs.xhr.httpHandler(function(err: any, response: ArrayBuffer) {
                                                console.log('err', err, response);
                                                callback(null, response);
                                            }, true)
                                        );
                                    },
                                },
                            },
                            emeHeaders: {},
                        };

                        console.log('going for ', emeOptions);
                    }
                }
                break;
        }
    }
    return emeOptions;
}

export function binaryToBase64(a: Uint8Array) {
    let b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
        c = [];
    for (let d = 0; d < a.byteLength; ) {
        let e = a[d++];
        c.push(b.charAt(e >> 2)),
            (e = (3 & e) << 4),
            d < a.byteLength
                ? (c.push(b.charAt(e | (a[d] >> 4))),
                  (e = (15 & a[d++]) << 2),
                  d < a.byteLength
                      ? (c.push(b.charAt(e | (a[d] >> 6))), c.push(b.charAt(63 & a[d++])))
                      : (c.push(b.charAt(e)), c.push('=')))
                : (c.push(b.charAt(e)), c.push('=='));
    }
    return c.join('');
}

export function base64ToBinary(a: string) {
    let b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
        c = new Uint8Array(new ArrayBuffer((3 * a.length) / 4 + 4)),
        e = 0;
    for (let d = 0; d < a.length; ) {
        let f = b.indexOf(a.charAt(d)),
            g = b.indexOf(a.charAt(d + 1));
        if (((c[e++] = (f << 2) | (g >> 4)), '=' !== a.charAt(d + 2))) {
            let h = b.indexOf(a.charAt(d + 2));
            if (((c[e++] = (g << 4) | (h >> 2)), '=' !== a.charAt(d + 3))) {
                let i = b.indexOf(a.charAt(d + 3));
                c[e++] = (h << 6) | i;
            }
        }
        d += 4;
    }
    return new Uint8Array(c.buffer, 0, e);
}

export function parseLicenseResponse(response: ArrayBuffer) {
    const responseBody = String.fromCharCode.apply(null, new Uint8Array(response));

    let b = responseBody.trim(),
        c = b.indexOf('<ckc>'),
        d = b.indexOf('</ckc>');
    if (-1 === c || -1 === d) {
        throw Error('License data format not as expected, missing or misplaced <ckc> tag');
    }
    c += 5;
    b = b.substr(c, d - c);

    return base64ToBinary(b);
}

export function getHostnameFromUri(uri: string) {
    let link = document.createElement('a');
    link.href = uri;
    return link.hostname;
}
