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
const bluebird_1 = __importDefault(require("bluebird"));
const fs_1 = __importDefault(require("fs"));
const lodash_1 = __importDefault(require("lodash"));
const looks_same_1 = __importDefault(require("looks-same"));
const path_1 = __importDefault(require("path"));
const errors_1 = require("../errors");
const clientScriptCalibrate = fs_1.default.readFileSync(path_1.default.join(__dirname, '..', 'browser', 'client-scripts', 'calibrate.min.js'), 'utf8');
var DIRECTION;
(function (DIRECTION) {
    DIRECTION["FORWARD"] = "forward";
    DIRECTION["REVERSE"] = "reverse";
})(DIRECTION || (DIRECTION = {}));
;
class Calibrator {
    constructor() {
        this._cache = {};
    }
    calibrate(browser) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._cache[browser.id]) {
                return bluebird_1.default.resolve(this._cache[browser.id]);
            }
            yield browser.open('about:blank');
            const features = yield browser.evalScript(clientScriptCalibrate);
            const image = yield browser.captureViewportImage();
            const { innerWidth, pixelRatio } = features;
            const hasPixelRatio = Boolean(pixelRatio && pixelRatio > 1.0);
            const imageFeatures = this._analyzeImage(image, { calculateColorLength: hasPixelRatio });
            if (!imageFeatures) {
                return bluebird_1.default.reject(new errors_1.CoreError('Could not calibrate. This could be due to calibration page has failed to open properly'));
            }
            const calibrationResult = lodash_1.default.extend(features, {
                top: imageFeatures.viewportStart.y,
                left: imageFeatures.viewportStart.x,
                usePixelRatio: hasPixelRatio && (imageFeatures.colorLength || 0) > innerWidth
            });
            this._cache[browser.id] = calibrationResult;
            return calibrationResult;
        });
    }
    _analyzeImage(image, params) {
        const imageHeight = image.getSize().height;
        for (let y = 0; y < imageHeight; y++) {
            const result = analyzeRow(y, image, params);
            if (result) {
                return result;
            }
        }
        return null;
    }
}
exports.default = Calibrator;
;
function analyzeRow(row, image, params = {}) {
    const markerStart = findMarkerInRow(row, image, DIRECTION.FORWARD);
    if (markerStart === -1) {
        return null;
    }
    const result = { viewportStart: { x: markerStart, y: row } };
    if (!params.calculateColorLength) {
        return result;
    }
    const markerEnd = findMarkerInRow(row, image, DIRECTION.REVERSE);
    const colorLength = markerEnd - markerStart + 1;
    return lodash_1.default.extend(result, { colorLength });
}
function findMarkerInRow(row, image, searchDirection) {
    const imageWidth = image.getSize().width;
    const searchColor = { R: 148, G: 250, B: 0 };
    if (searchDirection === DIRECTION.REVERSE) {
        return searchReverse_();
    }
    else {
        return searchForward_();
    }
    function searchForward_() {
        for (let x = 0; x < imageWidth; x++) {
            if (compare_(x)) {
                return x;
            }
        }
        return -1;
    }
    function searchReverse_() {
        for (let x = imageWidth - 1; x >= 0; x--) {
            if (compare_(x)) {
                return x;
            }
        }
        return -1;
    }
    function compare_(x) {
        const color = pickRGB(image.getRGBA(x, row));
        return looks_same_1.default.colors(color, searchColor);
    }
}
function pickRGB(rgba) {
    return {
        R: rgba.r,
        G: rgba.g,
        B: rgba.b
    };
}
