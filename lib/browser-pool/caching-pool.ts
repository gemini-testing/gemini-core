import Bluebird from 'bluebird';
import debug from 'debug';

import LimitedUseSet from './limited-use-set';
import { buildCompositeBrowserId } from './utils';

import type { Pool } from '../types/pool';
import type { NewBrowser } from '../types/new-browser';
import type { Config } from '../types/config';

type CachingPoolOpts = {
    logNamespace?: string;
};

export default class CachingPool implements Pool {
    public log: debug.Debugger;
    public underlyingPool: Pool;
    private _caches: Record<string, LimitedUseSet<NewBrowser>>;
    private _config: Config;
    private _logNamespace?: string;

    constructor(underlyingPool: Pool, config: Config, opts: CachingPoolOpts) {
        this.log = debug(`${opts.logNamespace}:pool:caching`);
        this.underlyingPool = underlyingPool;
        this._caches = {};
        this._config = config;
        this._logNamespace = opts.logNamespace;
    }

    private _getCacheFor(id: string, version: string): LimitedUseSet<NewBrowser> {
        const compositeId = buildCompositeBrowserId(id, version);

        this.log(`request for ${compositeId}`);

        if (!this._caches[compositeId]) {
            this.log(`init for ${compositeId}`);
            this._initPool(id, version);
        }

        return this._caches[compositeId];
    }

    public getBrowser(id: string, opts: any = {}): Bluebird<NewBrowser> {
        const {version} = opts;
        const cache = this._getCacheFor(id, version);
        const browser = cache.pop();

        if (!browser) {
            this.log(`no cached browser for ${buildCompositeBrowserId(id, version)}, requesting new`);

            return this.underlyingPool.getBrowser(id, opts);
        }

        this.log(`has cached browser ${browser.fullId}`);

        return browser.reset()
            .catch((e: unknown) => {
                const reject = Bluebird.reject.bind(null, e);

                return this.underlyingPool.freeBrowser(browser)
                    .then(reject, reject);
            })
            .then(() => browser);
    }

    private _initPool(browserId: string, version: string): void {
        const compositeId = buildCompositeBrowserId(browserId, version);
        const freeBrowser = this.underlyingPool.freeBrowser.bind(this.underlyingPool);
        const browserConfig = this._config.forBrowser(browserId);

        this._caches[compositeId] = new LimitedUseSet({
            formatItem: (item) => item.fullId,
            // browser does not get put in a set on first usages, so if
            // we want to limit it usage to N times, we must set N-1 limit
            // for the set.
            useLimit: browserConfig.sessionUseLimit - 1,
            finalize: freeBrowser,
            logNamespace: this._logNamespace
        });
    }

    /**
     * Free browser
     * @param {Browser} browser session instance
     * @param {Object} [options] - advanced options
     * @param {Boolean} [options.force] - if `true` than browser should
     * not be cached
     * @returns {Bluebird<undefined>}
     */
    public freeBrowser(browser: NewBrowser, options: any = {}): Bluebird<void> {
        const shouldFreeForNextRequest = () => {
            const {compositeIdForNextRequest} = options;

            if (!compositeIdForNextRequest) {
                return false;
            }

            const {hasFreeSlots} = options;
            const hasCacheForNextRequest = this._caches[options.compositeIdForNextRequest];

            return !hasFreeSlots && !hasCacheForNextRequest;
        };
        const force = options.force || shouldFreeForNextRequest();

        this.log(`free ${browser.fullId} force=${force}`);

        if (force) {
            return this.underlyingPool.freeBrowser(browser);
        }

        const cache = this._getCacheFor(browser.id, browser.version);

        return cache.push(browser);
    }

    public cancel(): void {
        this.log('cancel');
        this.underlyingPool.cancel();
    }
}
