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
const errors_1 = require("../errors");
class ClientBridge {
    constructor(_browser, _script) {
        this._browser = _browser;
        this._script = _script;
    }
    static create(browser, script) {
        return new ClientBridge(browser, script);
    }
    call(name, args = []) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._callCommand(this._clientMethodCommand(name, args), true);
        });
    }
    _callCommand(command, injectAllowed) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._browser.evalScript(command);
            try {
                if (!result || !result.isClientScriptNotInjected) {
                    return bluebird_1.default.resolve(result);
                }
                if (injectAllowed) {
                    yield this._inject();
                    return this._callCommand(command, false);
                }
                return bluebird_1.default.reject(new errors_1.ClientBridgeError('Unable to inject gemini-core client script'));
            }
            catch (e) {
                return bluebird_1.default.reject(new errors_1.ClientBridgeError(e.message));
            }
        });
    }
    _clientMethodCommand(name, args) {
        const params = args.map((arg) => JSON.stringify(arg)).join(', ');
        const call = `__geminiCore.${name}(${params})`;
        return this._guardClientCall(call);
    }
    _guardClientCall(call) {
        return `typeof __geminiCore !== "undefined" ? ${call} : {isClientScriptNotInjected: true}`;
    }
    _inject() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._browser.injectScript(this._script);
        });
    }
}
exports.default = ClientBridge;
;
