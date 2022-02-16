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
const lodash_1 = __importDefault(require("lodash"));
class BrowserAgent {
    constructor(browserId, _pool) {
        this.browserId = browserId;
        this._pool = _pool;
        this._sessions = [];
    }
    static create(browserId, pool) {
        return new BrowserAgent(browserId, pool);
    }
    getBrowser(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const browser = yield this._pool.getBrowser(this.browserId, opts);
            if (lodash_1.default.includes(this._sessions, browser.sessionId)) {
                yield this.freeBrowser(browser, { force: true });
                return this.getBrowser(opts);
            }
            this._sessions.push(browser.sessionId);
            return browser;
        });
    }
    freeBrowser(browser, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._pool.freeBrowser(browser, opts);
        });
    }
}
exports.default = BrowserAgent;
