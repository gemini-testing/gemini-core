import type { Capabilities, Options } from '@wdio/types';
import type { Browser as Session } from 'webdriverio';

import type { Config } from './config';

type BrowserState = {
    isBroken: boolean;
}

export interface Browser {
    id: string;
    version: string;

    attach(sessionId: string, sessionCaps: Capabilities.DesiredCapabilities, sessionOpts: Options.WebdriverIO): void;
    setHttpTimeout(timeout: number): void;
    restoreHttpTimeout(): void;

    applyState(state: BrowserState): void;

    fullId: string;
    publicAPI: Session<'async'>;
    sessionId: string;
    config: Config;
    state: BrowserState;
    capabilities: Capabilities.RemoteCapability;
}
