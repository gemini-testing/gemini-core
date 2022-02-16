"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const globExtra = __importStar(require("glob-extra"));
const lodash_1 = __importDefault(require("lodash"));
const micromatch_1 = __importDefault(require("micromatch"));
const path_1 = __importDefault(require("path"));
const bluebird_1 = __importDefault(require("bluebird"));
const fs_1 = __importDefault(require("fs"));
const fs = bluebird_1.default.promisifyAll(fs_1.default);
class TestSet {
    constructor(set) {
        this._set = lodash_1.default.clone(set);
    }
    static create(set) {
        return new TestSet(set);
    }
    expandFiles(expandOpts, globOpts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const { files, ignoreFiles = [] } = this._set;
            globOpts = lodash_1.default.clone(globOpts);
            globOpts.ignore = []
                .concat(globOpts.ignore || [], ignoreFiles)
                .map((p) => path_1.default.resolve(expandOpts.root, p));
            const expandedFiles = yield globExtra.expandPaths(files, expandOpts, globOpts);
            return this._set = lodash_1.default.extend(this._set, { files: expandedFiles });
        });
    }
    transformDirsToMasks() {
        return __awaiter(this, void 0, void 0, function* () {
            const files = yield bluebird_1.default.map(this._set.files, (file) => __awaiter(this, void 0, void 0, function* () {
                if (globExtra.isMask(file)) {
                    return file;
                }
                try {
                    const stat = yield fs.statAsync(file);
                    return stat.isDirectory() ? path_1.default.join(file, '**') : file;
                }
                catch (_a) {
                    return bluebird_1.default.reject(new Error(`Cannot read such file or directory: '${file}'`));
                }
            }));
            return this._set.files = files;
        });
    }
    resolveFiles(projectRoot) {
        this._set.files = this._set.files.map((file) => path_1.default.resolve(projectRoot, file));
    }
    getFiles() {
        return this._set.files;
    }
    getBrowsers() {
        return this._set.browsers;
    }
    getFilesForBrowser(browser) {
        return lodash_1.default.includes(this._set.browsers, browser) ? this._set.files : [];
    }
    getBrowsersForFile(file) {
        return lodash_1.default.includes(this._set.files, file) ? this._set.browsers : [];
    }
    useFiles(files) {
        if (lodash_1.default.isEmpty(files)) {
            return;
        }
        this._set.files = lodash_1.default.isEmpty(this._set.files) ? files : (0, micromatch_1.default)(files, this._set.files);
    }
    useBrowsers(browsers) {
        this._set.browsers = lodash_1.default.isEmpty(browsers)
            ? this._set.browsers
            : lodash_1.default.intersection(this._set.browsers, browsers);
    }
}
exports.default = TestSet;
;
