'use strict';

const Promise = require('bluebird');
const Pool = require('./pool');
const LimitedUseSet = require('./limited-use-set');
const debug = require('debug');

module.exports = class CachingPool extends Pool {
    /**
     * @constructor
     * @extends BasicPool
     * @param {BasicPool} underlyingPool
     */
    constructor(underlyingPool, config, opts) {
        super();

        this.log = debug(`${opts.logNamespace}:pool:caching`);

        this.underlyingPool = underlyingPool;
        this._caches = {};

        const freeBrowser = underlyingPool.freeBrowser.bind(underlyingPool);

        config.getBrowserIds().forEach((id) => {
            const browserConfig = config.forBrowser(id);
            this._caches[id] = new LimitedUseSet({
                // browser does not get put in a set on first usages, so if
                // we want to limit it usage to N times, we must set N-1 limit
                // for the set.
                useLimit: browserConfig.sessionUseLimit - 1,

                finalize: freeBrowser,
                logNamespace: opts.logNamespace
            });
        });
    }

    getBrowser(id) {
        this.log(`request for ${id}`);
        const browser = this._caches[id].pop();
        if (!browser) {
            this.log('no cached browser, requesting new');
            return this.underlyingPool.getBrowser(id);
        }

        this.log(`has cached browser ${browser}`);
        return browser.reset()
            .catch((e) => {
                const reject = Promise.reject.bind(null, e);
                return this.underlyingPool.freeBrowser(browser)
                    .then(reject, reject);
            })
            .then(() => browser);
    }

    /**
     * Free browser
     * @param {Browser} browser session instance
     * @param {Object} [options] - advanced options
     * @param {Boolean} [options.force] - if `true` than browser should
     * not be cached
     * @returns {Promise<undefined>}
     */
    freeBrowser(browser, options) {
        this.log(`free ${browser.id}`);
        const shouldBeFreed = options && options.force;
        return shouldBeFreed
            ? this.underlyingPool.freeBrowser(browser)
            : this._caches[browser.id].push(browser);
    }

    cancel() {
        this.log('cancel');
        this.underlyingPool.cancel();
    }
};
