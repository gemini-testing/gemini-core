"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireWithNoCache = void 0;
function requireWithNoCache(moduleName) {
    delete require.cache[moduleName];
    return require(moduleName);
}
exports.requireWithNoCache = requireWithNoCache;
;
