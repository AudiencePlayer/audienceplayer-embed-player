const MAX_PAYLOAD = 1024;
const MAX_STACK = 400;
const MAX_MESSAGE = 200;
const MAX_VALUE = 150;
const MAX_KEYS = 10;

export function serializeError(err: unknown): string {
    try {
        const normalized = normalizeError(err);
        let json = safeStringify(normalized);

        if (json.length > MAX_PAYLOAD) {
            json = json.slice(0, MAX_PAYLOAD - 1) + '…';
        }

        return json;
    } catch {
        return '{"message":"serialization_failed"}';
    }
}

function normalizeError(err: unknown) {
    // Handle promise rejection wrappers
    const e: any = (err as any)?.rejection ?? err;

    if (e instanceof Error) {
        return {
            type: e.name,
            message: trunc(e.message, MAX_MESSAGE),
            stack: trunc(cleanStack(e.stack), MAX_STACK),
        };
    }

    if (typeof e === 'string') {
        return {
            type: 'StringError',
            message: trunc(e, MAX_MESSAGE),
        };
    }

    if (typeof e === 'object' && e !== null) {
        return limitObject(e);
    }

    return {
        type: typeof e,
        value: trunc(String(e), MAX_VALUE),
    };
}

function cleanStack(stack?: string): string {
    if (!stack) {
        return '';
    }

    return stack
        .split('\n')
        .slice(0, 8) // keep top frames only
        .join('\n');
}

function limitObject(obj: any) {
    const out: any = {};
    let count = 0;

    for (const k of Object.keys(obj)) {
        if (count++ >= MAX_KEYS) {
            break;
        }

        try {
            const v = obj[k];

            if (v instanceof Error) {
                out[k] = normalizeError(v);
            } else if (typeof v === 'object') {
                out[k] = trunc(JSON.stringify(v), MAX_VALUE);
            } else {
                out[k] = trunc(v, MAX_VALUE);
            }
        } catch {
            out[k] = '[unserializable]';
        }
    }

    return out;
}

function safeStringify(obj: any): string {
    const seen = new WeakSet();

    return JSON.stringify(obj, function (_, val) {
        if (typeof val === 'object' && val !== null) {
            if (seen.has(val)) {
                return '[circular]';
            }
            seen.add(val);
        }
        return val;
    });
}

function trunc(val: any, max: number): string {
    const s = String(val ?? '');
    return s.length > max ? s.slice(0, max) + '…' : s;
}
