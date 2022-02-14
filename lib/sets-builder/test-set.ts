import * as globExtra from 'glob-extra';
import _ from 'lodash';
import mm from 'micromatch';
import path from 'path';
import Bluebird from 'bluebird';
import baseFs from 'fs';

const fs = Bluebird.promisifyAll(baseFs);

import type { SetConfig } from '../config/options';

export default class TestSet {
    private _set: SetConfig;

    static create(set: SetConfig): TestSet {
        return new TestSet(set);
    }

    constructor(set: SetConfig) {
        this._set = _.clone(set);
    }

    public async expandFiles(expandOpts: globExtra.ExpandOpts, globOpts: globExtra.GlobOpts = {}): Promise<SetConfig> {
        const {files, ignoreFiles = []} = this._set;

        globOpts = _.clone(globOpts);
        globOpts.ignore = ([] as Array<string>)
            .concat(globOpts.ignore || [], ignoreFiles)
            .map((p) => path.resolve(expandOpts.root, p));

        const expandedFiles = await globExtra.expandPaths(files, expandOpts, globOpts);

        return this._set = _.extend(this._set, {files: expandedFiles});
    }

    public async transformDirsToMasks(): Promise<Array<string>> {
        const files = await Bluebird.map(this._set.files, async (file) => {
            if (globExtra.isMask(file)) {
                return file;
            }

            try {
                const stat = await fs.statAsync(file);

                return stat.isDirectory() ? path.join(file, '**') : file;
            } catch {
                return Bluebird.reject(new Error(`Cannot read such file or directory: '${file}'`));
            }
        });

        return this._set.files = files;
    }

    public resolveFiles(projectRoot: string): void {
        this._set.files = this._set.files.map((file) => path.resolve(projectRoot, file));
    }

    public getFiles(): Array<string> {
        return this._set.files;
    }

    public getBrowsers(): Array<string> {
        return this._set.browsers;
    }

    public getFilesForBrowser(browser: string): Array<string> {
        return _.includes(this._set.browsers, browser) ? this._set.files : [];
    }

    public getBrowsersForFile(file: string): Array<string> {
        return _.includes(this._set.files, file) ? this._set.browsers : [];
    }

    public useFiles(files: Array<string>): void {
        if (_.isEmpty(files)) {
            return;
        }

        this._set.files = _.isEmpty(this._set.files) ? files : mm(files, this._set.files);
    }

    public useBrowsers(browsers: Array<string>): void {
        this._set.browsers = _.isEmpty(browsers)
            ? this._set.browsers
            : _.intersection(this._set.browsers, browsers);
    }
};
