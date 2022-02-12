import type Bluebird from "bluebird";

import type { Browser } from "./browser";

export interface NewBrowser extends Browser {
    init(): Bluebird<this>;
    reset(): Bluebird<void>;
    quit(): Bluebird<void>;
}
