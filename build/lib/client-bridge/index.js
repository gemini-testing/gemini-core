"use strict";
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
exports.build = exports.ClientBridge = void 0;
const path_1 = __importDefault(require("path"));
const bluebird_1 = __importDefault(require("bluebird"));
const browserify_1 = __importDefault(require("browserify"));
const client_bridge_1 = __importDefault(require("./client-bridge"));
var client_bridge_2 = require("./client-bridge");
Object.defineProperty(exports, "ClientBridge", { enumerable: true, get: function () { return __importDefault(client_bridge_2).default; } });
const build = (browser, opts = {}) => __awaiter(void 0, void 0, void 0, function* () {
    const script = (0, browserify_1.default)({
        entries: './index',
        basedir: path_1.default.join(__dirname, '..', 'browser', 'client-scripts')
    });
    if (!opts.coverage) {
        script.exclude('./index.coverage');
    }
    script.transform('uglifyify', {
        sourcemap: false,
        global: true,
        compress: { screw_ie8: false },
        mangle: { screw_ie8: false },
        output: { screw_ie8: false } // eslint-disable-line camelcase
    });
    const lib = opts.calibration && opts.calibration.needsCompatLib ? './lib.compat.js' : './lib.native.js';
    const ignoreAreas = opts.supportDeprecated ? './ignore-areas.deprecated.js' : './ignore-areas.js';
    script.transform('aliasify', {
        aliases: {
            './lib': { relative: lib },
            './ignore-areas': { relative: ignoreAreas }
        },
        verbose: false
    });
    const buf = yield bluebird_1.default.fromCallback((cb) => script.bundle(cb));
    const scripts = buf.toString();
    return client_bridge_1.default.create(browser, scripts);
});
exports.build = build;
