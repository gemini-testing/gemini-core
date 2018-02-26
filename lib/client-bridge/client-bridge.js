'use strict';

const Promise = require('bluebird');
const ClientBridgeError = require('../errors').ClientBridgeError;
const NO_CLIENT_FUNC = 'ERRNOFUNC';

module.exports = class ClientBridge {
    static create(browser, script) {
        return new ClientBridge(browser, script);
    }

    constructor(browser, script) {
        this._browser = browser;
        this._script = script;
    }

    call(name, args = []) {
        return this._callCommand(this._clientMethodCommand(name, args), true);
    }

    _callCommand(command, injectAllowed) {
        return this._browser.evalScript(command)
            .then((result) => {
                if (!result || !result.error) {
                    return Promise.resolve(result);
                }

                if (result.error !== NO_CLIENT_FUNC) {
                    return Promise.reject(new ClientBridgeError(result.message));
                }

                if (injectAllowed) {
                    return this._inject()
                        .then(() => this._callCommand(command, false));
                }
                return Promise.reject(new ClientBridgeError('Unable to inject gemini-core client script'));
            });
    }

    _clientMethodCommand(name, args) {
        const params = args.map(JSON.stringify).join(', ');
        const call = `__geminiCore.${name}(${params})`;

        return this._guardClientCall(call);
    }

    _guardClientCall(call) {
        return `typeof __geminiCore !== "undefined"? ${call} : {error: "${NO_CLIENT_FUNC}"}`;
    }

    _inject() {
        return this._browser.injectScript(this._script);
    }
};
