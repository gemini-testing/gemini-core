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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bluebird_1 = __importDefault(require("bluebird"));
const looks_same_1 = __importDefault(require("looks-same"));
const png_img_1 = __importDefault(require("png-img"));
const utils = __importStar(require("png-img/utils"));
const safe_rect_1 = __importDefault(require("./safe-rect"));
class Image {
    constructor(buffer) {
        this._img = new png_img_1.default(buffer);
    }
    static create(buffer) {
        return new this(buffer);
    }
    crop(rect, opts = {}) {
        rect = this._scale(rect, (opts).scaleFactor);
        const imageSize = this.getSize();
        const safeRect = safe_rect_1.default.create(rect, imageSize);
        this._img.crop(safeRect.left, safeRect.top, safeRect.width, safeRect.height);
        return bluebird_1.default.resolve(this);
    }
    getSize() {
        return this._img.size();
    }
    getRGBA(x, y) {
        return this._img.get(x, y);
    }
    save(file) {
        return bluebird_1.default.fromCallback((cb) => this._img.save(file, cb));
    }
    clear(area, opts = {}) {
        area = this._scale(area, (opts).scaleFactor);
        this._img.fill(area.left, area.top, area.width, area.height, '#000000');
    }
    join(newImage) {
        const imageSize = this.getSize();
        this._img
            .setSize(imageSize.width, imageSize.height + newImage.getSize().height)
            .insert(newImage._img, 0, imageSize.height);
        return this;
    }
    _scale(area, scaleFactor) {
        scaleFactor = scaleFactor || 1;
        return {
            left: area.left * scaleFactor,
            top: area.top * scaleFactor,
            width: area.width * scaleFactor,
            height: area.height * scaleFactor
        };
    }
    static fromBase64(base64) {
        return new Image(Buffer.from(base64, 'base64'));
    }
    static RGBToString(rgb) {
        return utils.RGBToString(rgb);
    }
    static compare(path1, path2, opts = {}) {
        const compareOptions = Object.assign({ ignoreCaret: opts.canHaveCaret, pixelRatio: opts.pixelRatio }, opts.compareOpts);
        ['tolerance', 'antialiasingTolerance'].forEach((option) => {
            if (option in opts) {
                compareOptions[option] = opts[option];
            }
        });
        return bluebird_1.default.fromCallback((cb) => {
            (0, looks_same_1.default)(path1, path2, compareOptions, cb);
        });
    }
    static buildDiff(opts) {
        const { diffColor: highlightColor } = opts, otherOpts = __rest(opts, ["diffColor"]);
        const diffOptions = Object.assign({ highlightColor }, otherOpts);
        return bluebird_1.default.fromCallback((cb) => looks_same_1.default.createDiff(diffOptions, cb));
    }
}
exports.default = Image;
;
