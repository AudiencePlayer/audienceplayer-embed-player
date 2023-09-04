export function binaryToBase64(a: Uint8Array) {
    let b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=', c = [];
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
    for (let d = 0; d < a.length;) {
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
    (c += 5), (b = b.substr(c, d - c));

    return base64ToBinary(b);
}

export function getHostnameFromUri(uri: string) {
    let link = document.createElement('a');
    link.href = uri;
    return link.hostname;
}
