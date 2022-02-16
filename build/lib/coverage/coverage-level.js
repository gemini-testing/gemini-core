"use strict";
exports.__esModule = true;
exports.merge = exports.NONE = exports.PARTIAL = exports.FULL = exports.CoverageValue = void 0;
var CoverageValue;
(function (CoverageValue) {
    CoverageValue["FULL"] = "full";
    CoverageValue["PARTIAL"] = "partial";
    CoverageValue["NONE"] = "none";
})(CoverageValue = exports.CoverageValue || (exports.CoverageValue = {}));
exports.FULL = CoverageValue.FULL;
exports.PARTIAL = CoverageValue.PARTIAL;
exports.NONE = CoverageValue.NONE;
function merge(oldValue, newValue) {
    if (oldValue === void 0) { oldValue = CoverageValue.NONE; }
    if (oldValue === CoverageValue.FULL || newValue === CoverageValue.FULL) {
        return CoverageValue.FULL;
    }
    if (oldValue === CoverageValue.PARTIAL || newValue === CoverageValue.PARTIAL) {
        return CoverageValue.PARTIAL;
    }
    return CoverageValue.NONE;
}
exports.merge = merge;
;
