import debug from 'debug';
import _ from 'lodash';

import LimitedPool from './limited-pool';

import type Bluebird from 'bluebird';

import type { Pool } from '../types/pool';
import type { NewBrowser } from '../types/new-browser';
import type { Config } from '../types/config';

type PerBrowserLimitedPoolOpts = {
    logNamespace?: string;
};

export default class PerBrowserLimitedPool implements Pool {
    public log: debug.Debugger;
    private _browserPools: Record<string, LimitedPool>;

    constructor(underlyingPool: Pool, config: Config, opts: PerBrowserLimitedPoolOpts) {
        this.log = debug(`${opts.logNamespace}:pool:per-browser-limited`);

        const ids = config.getBrowserIds();
        this._browserPools = _.zipObject(
            ids,
            ids.map((id: string) => LimitedPool.create(underlyingPool, {
                limit: config.forBrowser(id).parallelLimit,
                logNamespace: opts.logNamespace
            }))
        );
    }

    public getBrowser(id: string, opts: any): Bluebird<NewBrowser> {
        this.log(`request ${id} with opts: ${JSON.stringify(opts)}`);

        return this._browserPools[id].getBrowser(id, opts);
    }

    public freeBrowser(browser: NewBrowser, opts: any): Bluebird<void> {
        this.log(`free ${browser.fullId}`);

        return this._browserPools[browser.id].freeBrowser(browser, opts);
    }

    public cancel(): void {
        this.log('cancel');
        _.forEach(this._browserPools, (pool) => pool.cancel());
    }
};
