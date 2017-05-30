'use strict';

const Promise = require('bluebird');
const Pool = require('./pool');
const CancelledError = require('../errors/cancelled-error');
const debug = require('debug');

module.exports = class LimitedPool extends Pool {
    static create(underlyingPool, opts) {
        return new LimitedPool(underlyingPool, opts);
    }

    /**
     * @extends BasicPool
     * @param {Number} limit
     * @param {BasicPool} underlyingPool
     */
    constructor(underlyingPool, opts) {
        super();

        this.log = debug(`${opts.logNamespace}:pool:limited`);

        this.underlyingPool = underlyingPool;
        this._limit = opts.limit;
        this._launched = 0;
        this._requests = 0;
        this._requestQueue = [];
    }

    getBrowser(id) {
        this.log(`get browser ${id} (launched ${this._launched}, limit ${this._limit})`);

        ++this._requests;
        return this._getBrowser(id)
            .catch((e) => {
                --this._requests;
                return Promise.reject(e);
            });
    }

    freeBrowser(browser, opts) {
        this.log(`free browser ${browser}`);
        --this._requests;

        const force = opts && opts.force || this._launched > this._requests;
        return this.underlyingPool.freeBrowser(browser, {force})
            .finally(() => this._launchNextBrowser());
    }

    cancel() {
        this.log('cancel');
        this._requestQueue.forEach((entry) => entry.reject(new CancelledError()));

        this._requestQueue.length = 0;
        this.underlyingPool.cancel();
    }

    _getBrowser(id) {
        if (this._launched < this._limit) {
            this.log('can launch one more');
            this._launched++;
            return this._newBrowser(id);
        }

        this.log('queuing the request');
        return new Promise((resolve, reject) => {
            this._requestQueue.unshift({id, resolve, reject});
        });
    }

    /**
     * @param {String} id
     * @returns {Promise<Browser>}
     */
    _newBrowser(id) {
        this.log('launching new browser', id);
        return this.underlyingPool.getBrowser(id)
            .catch((e) => {
                this._launchNextBrowser();
                return Promise.reject(e);
            });
    }

    _launchNextBrowser() {
        const queued = this._requestQueue.pop();
        if (queued) {
            this.log('has queued requests');
            this.log(`remaining queue length: ${this._requestQueue.length}`);
            this._newBrowser(queued.id)
                .then(queued.resolve, queued.reject);
        } else {
            this._launched--;
        }
    }
};
