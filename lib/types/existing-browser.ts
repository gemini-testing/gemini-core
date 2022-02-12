import type { Capabilities, Options } from '@wdio/types';

import type { Browser } from "./browser";
import type { Page } from './page';
import type Calibrator from '../calibrator';
import type { AsyncEmitter } from '../events';
import type Image from '../image';

type BrowserMeta = {
    pid: NodeJS.Process['pid'];
    browserVersion: string;
};

type ScrollParams = {
    selector?: string;
    x: number;
    y: number;
};

export interface ExistingBrowser extends Browser {
    init(
        options: {
            sessionId: string,
            sessionCaps: Capabilities.DesiredCapabilities,
            sessionOpts: Options.WebdriverIO
        },
        calibrator: Calibrator
    ): Promise<this>;
    reinit(sessionId: string, sessionOpts: Options.WebdriverIO): Promise<this>;
    markAsBroken(): void;
    quit(): void;
    prepareScreenshot(selectors: Array<string>, opts: Object): Promise<Page>;
    open(url: string): Promise<string>;
    evalScript<T = any>(script: string): Promise<T>;
    injectScript<T = any>(script: string): Promise<T>;
    captureViewportImage(page?: Page, screenshotDelay?: number): Promise<Image>;
    scrollBy(params: ScrollParams): Promise<void>;

    meta: BrowserMeta;
    emitter: AsyncEmitter;
}
