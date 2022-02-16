"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serialize = exports.path = exports.attach = exports.init = void 0;
const temp_1 = __importDefault(require("temp"));
const path_1 = require("path");
const lodash_1 = __importDefault(require("lodash"));
temp_1.default.track();
class Temp {
    constructor(dir, opts = {}) {
        this._tempDir = opts.attach
            ? dir
            : temp_1.default.mkdirSync({
                dir: dir && (0, path_1.resolve)(dir),
                prefix: '.screenshots.tmp.'
            });
    }
    path(opts = {}) {
        return temp_1.default.path(lodash_1.default.extend(opts, {
            dir: this._tempDir
        }));
    }
    serialize() {
        return { dir: this._tempDir };
    }
}
let tempInstance;
function init(dir) {
    if (!tempInstance) {
        tempInstance = new Temp(dir);
    }
}
exports.init = init;
function attach(serializedTemp) {
    if (!tempInstance) {
        tempInstance = new Temp(serializedTemp.dir, { attach: true });
    }
}
exports.attach = attach;
function path(opts) {
    return tempInstance.path(opts);
}
exports.path = path;
function serialize() {
    return tempInstance.serialize();
}
exports.serialize = serialize;
