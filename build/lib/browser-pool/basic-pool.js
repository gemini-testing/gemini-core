"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bluebird_1 = __importDefault(require("bluebird"));
const debug_1 = __importDefault(require("debug"));
const lodash_1 = __importDefault(require("lodash"));
const cancelled_error_1 = __importDefault(require("../errors/cancelled-error"));
class BasicPool {
    constructor(browserManager, opts) {
        this._browserMgr = browserManager;
        this.log = (0, debug_1.default)(`${opts.logNamespace}:pool:basic`);
        this._activeSessions = {};
    }
    static create(browserManager, opts) {
        return new BasicPool(browserManager, opts);
    }
    getBrowser(id, opts = {}) {
        const { version } = opts;
        const browser = this._browserMgr.create(id, version);
        return this._browserMgr.start(browser)
            .then(() => this.log(`browser ${browser.fullId} started`))
            .then(() => this._browserMgr.onStart(browser))
            .then(() => {
            if (this._cancelled) {
                return bluebird_1.default.reject(new cancelled_error_1.default());
            }
            return this._activeSessions[browser.sessionId] = browser;
        })
            .then(() => browser.reset())
            .then(() => browser)
            .catch((e) => __awaiter(this, void 0, void 0, function* () {
            if (browser.publicAPI) {
                yield this.freeBrowser(browser);
            }
            return bluebird_1.default.reject(e);
        }));
    }
    freeBrowser(browser) {
        delete this._activeSessions[browser.sessionId];
        this.log(`stop browser ${browser.fullId}`);
        return this._browserMgr.onQuit(browser)
            .catch((err) => {
            console.warn(err instanceof Error ? err.stack : err);
        })
            .then(() => this._browserMgr.quit(browser));
    }
    cancel() {
        this._cancelled = true;
        lodash_1.default.forEach(this._activeSessions, (browser) => this._browserMgr.quit(browser));
        this._activeSessions = {};
    }
}
exports.default = BasicPool;
