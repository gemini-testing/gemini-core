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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const bluebird_1 = __importDefault(require("bluebird"));
const events_1 = __importDefault(require("events"));
const promiseUtils = __importStar(require("../../promise-utils"));
class AsyncEmitter extends events_1.default {
    emitAndWait(event, ...args) {
        const promises = (0, lodash_1.default)(this.listeners(event))
            .map((l) => bluebird_1.default.method(l).apply(this, args))
            .thru(promiseUtils.waitForResults)
            .value();
        return bluebird_1.default.all(promises);
    }
}
exports.default = AsyncEmitter;
;
