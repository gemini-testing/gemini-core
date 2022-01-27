'use strict';

const Promise = require('bluebird');
const looksSame = require('looks-same');
const sharp = require('sharp');
const SafeRect = require('./safe-rect');

module.exports = class Image {
    static create(buffer) {
        return new this(buffer);
    }

    constructor(buffer) {
        this._img = sharp(buffer);
        this._compositeImages = [];
        this._imageData = null;
    }

    async crop(rect, opts = {}) {
        rect = this._scale(rect, (opts).scaleFactor);

        const imageSize = await this.getSize();
        const safeRect = SafeRect.create(rect, imageSize);

        try {
            this._img.extract(safeRect);
            this._adjustCompositeImages(safeRect);
        } catch (err) {
            throw new Error(err.message);
        }

        this._resetImageData();

        return this;
    }

    _adjustCompositeImages(newArea) {
        this._img.options.composite = this._img.options.composite.map(compositeParams => {
            const safeCompositeArea = SafeRect.create(
                {
                    left: compositeParams.left - newArea.left,
                    top: compositeParams.top - newArea.top,
                    width: compositeParams.input.createWidth,
                    height: compositeParams.input.createHeight
                }, {
                    width: newArea.width,
                    height: newArea.height
                }
            );

            return {
                ...compositeParams,
                input: {
                    ...compositeParams.input,
                    createWidth: safeCompositeArea.width,
                    createHeight: safeCompositeArea.height
                },
                left: safeCompositeArea.left,
                top: safeCompositeArea.top
            };
        });
    }

    async getSize() {
        const {info} = await this._getImageData();

        return {
            width: info.width,
            height: info.height
        };
    }

    async _getImageData() {
        if (!this._imageData) {
            this._imageData = await this._img.raw().toBuffer({resolveWithObject: true});
        }

        return this._imageData;
    }

    _resetImageData() {
        this._imageData = null;
    }

    async getRGBA(x, y) {
        const {data, info} = await this._getImageData();
        const idx = (info.width * y + x) * info.channels;

        return {
            r: data[idx],
            g: data[idx + 1],
            b: data[idx + 2],
            a: info.channels === 4 ? data[idx + 3] : 1
        };
    }

    async save(file) {
        try {
            return await this._img.png().removeAlpha().toFile(file);
        } catch (err) {
            throw new Error(err.message);
        }
    }

    async clear(area, opts = {}) {
        area = this._scale(area, (opts).scaleFactor);

        const {info} = await this._getImageData();

        this._composite({
            input: {
                create: {
                    channels: info.channels,
                    background: {r: 0, g: 0, b: 0, alpha: 1},
                    width: area.width,
                    height: area.height
                }
            },
            left: area.left,
            top: area.top
        });

        this._resetImageData();

        return this;
    }

    _composite(images) {
        this._compositeImages = this._compositeImages.concat(images);
        this._img.composite(this._compositeImages);
    }

    async join(attachedImages) {
        attachedImages = [].concat(attachedImages);

        const oldImageSize = await this.getSize();
        const imageSizes = await Promise.all(attachedImages.map(img => img.getSize()));

        function calculateTotalHeight(metas) {
            return metas.reduce((totalHeight, meta) => totalHeight + meta.height, 0);
        }

        this._img.resize({
            width: Math.max(...[].concat(oldImageSize.width, imageSizes.map(meta => meta.width))),
            height: oldImageSize.height + calculateTotalHeight(imageSizes),
            fit: 'contain',
            position: 'top'
        });

        const compositeData = await Promise.all(attachedImages.map(async (image, i) => ({
            input: await image._img.png().toBuffer(),
            left: 0,
            top: oldImageSize.height + calculateTotalHeight(imageSizes.slice(0, i))
        })));

        this._composite(compositeData);

        this._resetImageData();

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

    async toBase64() {
        return this._img.raw().toBuffer();
    }

    static fromBase64(base64) {
        return new Image(Buffer.from(base64, 'base64'));
    }

    static RGBToString(rgb) {
        return '#' + colorToString(rgb.r) + colorToString(rgb.g) + colorToString(rgb.b);
    }

    static compare(path1, path2, opts = {}) {
        const compareOptions = {
            ignoreCaret: opts.canHaveCaret,
            pixelRatio: opts.pixelRatio,
            ...opts.compareOpts
        };
        ['tolerance', 'antialiasingTolerance'].forEach((option) => {
            if (option in opts) {
                compareOptions[option] = opts[option];
            }
        });
        return Promise.fromCallback((cb) => {
            looksSame(path1, path2, compareOptions, cb);
        });
    }

    static buildDiff(opts) {
        const {diffColor: highlightColor, ...otherOpts} = opts;
        const diffOptions = {highlightColor, ...otherOpts};

        return Promise.fromCallback((cb) => looksSame.createDiff(diffOptions, cb));
    }
};

function colorToString(color) {
    const str = color.toString(16);

    return str.length < 2 ? '0' + str : str;
}
