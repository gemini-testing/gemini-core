import Bluebird from 'bluebird';
import debug from 'debug';
import _ from 'lodash';

type LimitedUseSetOpts<T> = {
    useLimit: number;
    finalize: (value: T, ...args: [...any]) => Bluebird<void>;
    formatItem?: (value: T) => any;
    logNamespace?: string;
};

/**
 * Set implementation which allows to get and put an object
 * there only limited amout of times. After limit is reached
 * attempt to put an object there causes the object to be finalized.
 *
 * @constructor
 * @param useLimit number of times object can be popped from set
 * before finalizing.
 * @param finalize callback which will be called when value in
 * set needs to be finalized.
 */
export default class LimitedUseSet<T extends object> {
    private _useCounts: WeakMap<T, number>;
    private _useLimit: number;
    private _finalize: (value: T) => Bluebird<void>;
    private _formatItem: (value: T) => any;
    private _objects: Array<T>;
    public log: debug.Debugger;

    constructor(opts: LimitedUseSetOpts<T>) {
        this._useCounts = new WeakMap<T, number>();
        this._useLimit = opts.useLimit;
        this._finalize = opts.finalize;
        this._formatItem = opts.formatItem || _.identity;
        this._objects = [];

        this.log = debug(`${opts.logNamespace}:pool:limited-use-set`);
    }

    public push(value: T): Bluebird<void> {
        const formatedItem = this._formatItem(value);

        this.log(`push ${formatedItem}`);

        if (this._isOverLimit(value)) {
            this.log(`over limit, finalizing ${formatedItem}`);

            return this._finalize(value);
        }

        this.log(`under limit for ${formatedItem}`);
        this._objects.push(value);

        return Bluebird.resolve();
    }

    private _isOverLimit(value: T): boolean {
        if (this._useLimit === 0) {
            return true;
        }

        return this._useCounts.has(value) && (this._useCounts.get(value) || 0) >= this._useLimit;
    }

    public pop(): T | null {
        const result = this._objects.pop();

        if (!result) {
            return null;
        }

        const useCount = this._useCounts.get(result) || 0;
        const formatedItem = this._formatItem(result);

        this.log(`popping ${formatedItem}`);
        this.log(`previous use count ${formatedItem}:${useCount}`);

        this._useCounts.set(result, useCount + 1);

        return result;
    }
};
