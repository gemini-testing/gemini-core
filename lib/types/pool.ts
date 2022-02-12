import type Bluebird from 'bluebird';

import type { NewBrowser } from "./new-browser";

export interface Pool {
    getBrowser(id: string, opts?: any): Bluebird<NewBrowser>;
    freeBrowser(browser: NewBrowser, opts?: any): Bluebird<void>;
    cancel(): void;
};
