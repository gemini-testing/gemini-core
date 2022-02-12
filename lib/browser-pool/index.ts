import _ from 'lodash';
import Bluebird from 'bluebird';

import BasicPool from './basic-pool';
import CachingPool from './caching-pool';
import LimitedPool from './limited-pool';
import PerBrowserLimitedPool from './per-browser-limited-pool';

import type { Pool } from '../types/pool';
import type { Config } from '../types/config';
import type { NewBrowser } from '../types/new-browser';

export type BrowserManager = {
    create: (id: string, version: string) => NewBrowser;
    start: (browser: NewBrowser) => Bluebird<NewBrowser>;
    onStart: (browser: NewBrowser) => Bluebird<void>;
    onQuit: (browser: NewBrowser) => Bluebird<void>;
    quit: (browser: NewBrowser) => Bluebird<void>;
};

type CreateBrowserManagerOpts = {
    config: Config;
    logNamespace: string;
};

export function create(browserManager: BrowserManager, opts: CreateBrowserManagerOpts): Pool {
    browserManager = _.defaults(browserManager, {
        onStart: () => Bluebird.resolve(),
        onQuit: () => Bluebird.resolve()
    });

    let pool: Pool = BasicPool.create(browserManager, opts);

    pool = new CachingPool(pool, opts.config, opts);
    pool = new PerBrowserLimitedPool(pool, opts.config, opts);

    if (_.isFinite(opts.config.system.parallelLimit)) {
        pool = new LimitedPool(pool, {
            limit: opts.config.system.parallelLimit,
            logNamespace: opts.logNamespace,
            isSpecificBrowserLimiter: false
        });
    }

    return pool;
}
