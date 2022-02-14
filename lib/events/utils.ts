import type { EventEmitter } from 'events';

import type AsyncEmitter from './async-emitter';

const mkPassthroughFn = <T extends EventEmitter>(methodName: T extends AsyncEmitter ? 'emitAndWait' : 'emit'): (from: T, to: T, event: string | Array<string>) => void => {
    const passEvents = (from: T, to: T, event: string | Array<string>): void => {
        if (typeof event === 'string') {
            from.on(event, (...args: Array<any>) => to[methodName](event, ...args));
            return;
        }
        event.forEach((event) => passEvents(from, to, event));
    };

    return passEvents;
};

export const passthroughEvent = mkPassthroughFn('emit');
export const passthroughEventAsync = mkPassthroughFn<AsyncEmitter>('emitAndWait');
