'use strict';

const Promise = require('bluebird');
const yallist = require('yallist');
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
        this._requestQueue = yallist.create();
        this._highPriorityRequestQueue = yallist.create();
    }

    getBrowser(id, opts = {}) {
        this.log(`get browser ${id} (launched ${this._launched}, limit ${this._limit})`);

        ++this._requests;
        return this._getBrowser(id, opts)
            .catch((e) => {
                --this._requests;
                return Promise.reject(e);
            });
    }

    freeBrowser(browser, opts) {
        this.log(`free browser ${browser.id}`);
        --this._requests;

        const force = opts && opts.force || this._launched > this._requests;
        return this.underlyingPool.freeBrowser(browser, {force})
            .finally(() => this._launchNextBrowser());
    }

    cancel() {
        this.log('cancel');

        const reject_ = (entry) => entry.reject(new CancelledError());
        this._highPriorityRequestQueue.forEach(reject_);
        this._requestQueue.forEach(reject_);

        this._highPriorityRequestQueue = yallist.create();
        this._requestQueue = yallist.create();

        this.underlyingPool.cancel();
    }

    _getBrowser(id, opts = {}) {
        if (this._launched < this._limit) {
            this.log('can launch one more');
            this._launched++;
            return this._newBrowser(id, opts);
        }

        this.log('queuing the request');
        const queue = opts.highPriority ? this._highPriorityRequestQueue : this._requestQueue;
        return new Promise((resolve, reject) => {
            queue.push({id, resolve, reject});
        });
    }

    /**
     * @param {String} id
     * @returns {Promise<Browser>}
     */
    _newBrowser(id, opts) {
        this.log('launching new browser', id);
        return this.underlyingPool.getBrowser(id, opts)
            .catch((e) => {
                this._launchNextBrowser();
                return Promise.reject(e);
            });
    }

    _launchNextBrowser() {
        const queued = this._highPriorityRequestQueue.shift() || this._requestQueue.shift();
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
