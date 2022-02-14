import _ from 'lodash';
import Bluebird from 'bluebird';
import EventEmitter from 'events';
import * as promiseUtils from '../../promise-utils';

type AnyArgsFunction<R = any> = (...args: Array<any>) => R;

export default class AsyncEmitter extends EventEmitter {
    public emitAndWait(event: string | symbol, ...args: Array<any>): Bluebird<any> {
        const promises = _(this.listeners(event) as Array<AnyArgsFunction>)
            .map((l) => (Bluebird.method(l) as AnyArgsFunction<Bluebird<any>>).apply(this, args))
            .thru(promiseUtils.waitForResults)
            .value();

        return Bluebird.all(promises);
    }
};
