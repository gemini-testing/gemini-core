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
const lodash_1 = __importDefault(require("lodash"));
const utils = __importStar(require("./utils"));
const image_1 = __importDefault(require("../../image"));
class Camera {
    constructor(_screenshotMode, _takeScreenshot) {
        this._screenshotMode = _screenshotMode;
        this._takeScreenshot = _takeScreenshot;
        this._calibration = null;
    }
    static create(screenshotMode, takeScreenshot) {
        return new this(screenshotMode, takeScreenshot);
    }
    calibrate(calibration) {
        this._calibration = calibration;
    }
    captureViewportImage(page) {
        return __awaiter(this, void 0, void 0, function* () {
            const base64 = yield this._takeScreenshot();
            const image = yield this._applyCalibration(image_1.default.fromBase64(base64));
            return this._cropToViewport(image, page);
        });
    }
    _applyCalibration(image) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._calibration) {
                return image;
            }
            const { left, top } = this._calibration;
            const { width, height } = image.getSize();
            return image.crop({ left, top, width: width - left, height: height - top });
        });
    }
    _cropToViewport(image, page) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!page) {
                return image;
            }
            const isFullPage = utils.isFullPage(image, page, this._screenshotMode);
            const cropArea = lodash_1.default.clone(page.viewport);
            if (!isFullPage) {
                lodash_1.default.extend(cropArea, {
                    top: 0,
                    left: 0
                });
            }
            return image.crop(cropArea, { scaleFactor: page.pixelRatio });
        });
    }
}
exports.default = Camera;
;
