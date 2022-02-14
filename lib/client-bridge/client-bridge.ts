import Bluebird from 'bluebird';
import { ClientBridgeError } from '../errors';

import type { ExistingBrowser } from '../types/existing-browser';

export default class ClientBridge {
    public static create(browser: ExistingBrowser, script: string): ClientBridge {
        return new ClientBridge(browser, script);
    }

    constructor(
        private _browser: ExistingBrowser,
        private _script: string
    ) {}

    public async call(name: string, args = []): Promise<any> {
        return this._callCommand(this._clientMethodCommand(name, args), true);
    }

    private async _callCommand(command: string, injectAllowed: boolean): Promise<any> {
        const result = await this._browser.evalScript(command);

        try {
            if (!result || !result.isClientScriptNotInjected) {
                return Bluebird.resolve(result);
            }
    
            if (injectAllowed) {
                await this._inject();

                return this._callCommand(command, false);
            }
    
            return Bluebird.reject(new ClientBridgeError('Unable to inject gemini-core client script'));
        } catch (e: unknown) {
            return Bluebird.reject(new ClientBridgeError((e as Error).message));
        }
    }

    private _clientMethodCommand(name: string, args: Array<any>): string {
        const params = args.map((arg) => JSON.stringify(arg)).join(', ');
        const call = `__geminiCore.${name}(${params})`;

        return this._guardClientCall(call);
    }

    private _guardClientCall(call: string): string {
        return `typeof __geminiCore !== "undefined" ? ${call} : {isClientScriptNotInjected: true}`;
    }

    private async _inject(): Promise<any> {
        return this._browser.injectScript(this._script);
    }
};
