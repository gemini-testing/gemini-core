import Bluebird from 'bluebird';
import debug from 'debug';
import _ from 'lodash';

import CancelledError from '../errors/cancelled-error';

import type { BrowserManager } from '.';
import type { Pool } from '../types/pool';
import type { NewBrowser } from '../types/new-browser';

export default class BasicPool implements Pool {
    public log: debug.Debugger;
    private _browserMgr: BrowserManager;
    private _activeSessions: Record<string, NewBrowser>;
    private _cancelled?: boolean;

    public static create(browserManager: BrowserManager, opts: any): BasicPool {
        return new BasicPool(browserManager, opts);
    }

    constructor(browserManager: BrowserManager, opts: any) {
        this._browserMgr = browserManager;
        this.log = debug(`${opts.logNamespace}:pool:basic`);

        this._activeSessions = {};
    }

    public getBrowser(id: string, opts: any = {}): Bluebird<NewBrowser> {
        const {version} = opts;
        const browser = this._browserMgr.create(id, version);

        return this._browserMgr.start(browser)
            .then(() => this.log(`browser ${browser.fullId} started`))
            .then(() => this._browserMgr.onStart(browser))
            .then(() => {
                if (this._cancelled) {
                    return Bluebird.reject(new CancelledError());
                }

                return this._activeSessions[browser.sessionId] = browser;
            })
            .then(() => browser.reset())
            .then(() => browser)
            .catch(async (e: unknown) => {
                if (browser.publicAPI) {
                    await this.freeBrowser(browser);
                }

                return Bluebird.reject(e);
            });
    }

    public freeBrowser(browser: NewBrowser): Bluebird<void> {
        delete this._activeSessions[browser.sessionId];

        this.log(`stop browser ${browser.fullId}`);

        return this._browserMgr.onQuit(browser)
            .catch((err: unknown) => {
                console.warn(err instanceof Error ? err.stack : err);
            })
            .then(() => this._browserMgr.quit(browser));
    }

    public cancel(): void {
        this._cancelled = true;

        _.forEach(this._activeSessions, (browser) => this._browserMgr.quit(browser));

        this._activeSessions = {};
    }
}
