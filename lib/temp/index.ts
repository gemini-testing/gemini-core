import temp from 'temp';
import { resolve as resolvePath } from 'path';
import _ from 'lodash';

temp.track();

type TempConstructorOpts = {
    attach?: boolean;
};
type SerializedTemp = {
    dir: string;
};

class Temp {
    private _tempDir: string;

    constructor(dir: string, opts: TempConstructorOpts = {}) {
        this._tempDir = opts.attach
            ? dir
            : temp.mkdirSync({
                dir: dir && resolvePath(dir),
                prefix: '.screenshots.tmp.'
            });
    }

    path(opts: temp.AffixOptions = {}): string {
        return temp.path(_.extend(opts, {
            dir: this._tempDir
        }));
    }

    serialize(): SerializedTemp {
        return {dir: this._tempDir};
    }
}

let tempInstance: Temp;

export function init(dir: string): void {
    if (!tempInstance) {
        tempInstance = new Temp(dir);
    }
}
export function attach(serializedTemp: SerializedTemp): void {
    if (!tempInstance) {
        tempInstance = new Temp(serializedTemp.dir, {attach: true});
    }
}
export function path(opts: temp.AffixOptions): string {
    return tempInstance.path(opts);
}
export function serialize(): SerializedTemp {
    return tempInstance.serialize();
}
