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
const viewport_1 = __importDefault(require("./viewport"));
const height_viewport_error_1 = __importDefault(require("./viewport/coord-validator/errors/height-viewport-error"));
class ScreenShooter {
    constructor(_browser) {
        this._browser = _browser;
    }
    static create(browser) {
        return new ScreenShooter(browser);
    }
    capture(page, opts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const { allowViewportOverflow, compositeImage, screenshotDelay, selectorToScroll } = opts;
            const viewportOpts = { allowViewportOverflow, compositeImage };
            const cropImageOpts = { screenshotDelay, compositeImage, selectorToScroll };
            const viewportImage = yield this._browser.captureViewportImage(page, screenshotDelay);
            const viewport = viewport_1.default.create(page.viewport, viewportImage, page.pixelRatio, viewportOpts);
            return this._cropImage(viewport, page, cropImageOpts);
        });
    }
    _cropImage(viewport, page, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                viewport.validate(page.captureArea, this._browser);
            }
            catch (e) {
                return e instanceof height_viewport_error_1.default && opts.compositeImage
                    ? this._extendImage(viewport, page, opts)
                    : bluebird_1.default.reject(e);
            }
            viewport.ignoreAreas(page.ignoreAreas);
            return viewport.crop(page.captureArea);
        });
    }
    _extendImage(viewport, page, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const scrollHeight = Math.min(viewport.getVerticalOverflow(page.captureArea), page.viewport.height);
            yield this._browser.scrollBy({ x: 0, y: scrollHeight, selector: opts.selectorToScroll });
            page.viewport.top += scrollHeight;
            const newImage = yield this._browser.captureViewportImage(page, opts.screenshotDelay);
            yield viewport.extendBy(scrollHeight, newImage);
            return this._cropImage(viewport, page, opts);
        });
    }
}
exports.default = ScreenShooter;
;
