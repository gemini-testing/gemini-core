'use strict';

const Promise = require('bluebird');
const looksSame = require('looks-same');
const {PNG} = require('pngjs');
const fs = require('fs');

const SafeRect = require('./safe-rect');

module.exports = class Image {
    static create(buffer) {
        return new this(buffer);
    }

    constructor(buffer) {
        this._img = PNG.sync.read(buffer);
    }

    crop(rect, opts = {}) {
        rect = this._scale(rect, (opts).scaleFactor);
        const imageSize = this.getSize();
        const safeRect = SafeRect.create(rect, imageSize);

        const croppedImage = new PNG({
            width: safeRect.width,
            height: safeRect.height
        });

        PNG.bitblt(
            this._img,
            croppedImage,
            safeRect.left,
            safeRect.top,
            safeRect.width,
            safeRect.height
        );

        this._img = croppedImage;

        return Promise.resolve(this);
    }

    getSize() {
        return {
            width: this._img.width,
            height: this._img.height
        };
    }

    getRGBA(x, y) {
        const idx = (this._img.width * y + x) * 4;
        const imgData = this._img.data;

        return {
            r: imgData[idx],
            g: imgData[idx + 1],
            b: imgData[idx + 2],
            a: imgData[idx + 3]
        };
    }

    save(file) {
        return Promise.fromCallback((cb) => fs.writeFile(file, PNG.sync.write(this._img), cb));
    }

    clear(area, opts = {}) {
        area = this._scale(area, (opts).scaleFactor);

        const clearedAreaImage = new PNG({
            width: area.width,
            height: area.height
        });

        for (let alphaIndex = 3; alphaIndex < clearedAreaImage.data.length; alphaIndex += 4) {
            clearedAreaImage.data[alphaIndex] = 255;
        }

        PNG.bitblt(
            clearedAreaImage,
            this._img,
            0,
            0,
            area.width,
            area.height,
            area.left,
            area.top
        );

        return this;
    }

    join(attachedImage) {
        const imageSize = this.getSize();
        const attachedImageSize = attachedImage.getSize();

        const newImage = new PNG({
            width: imageSize.width,
            height: imageSize.height + attachedImageSize.height
        });

        PNG.bitblt(
            this._img,
            newImage,
            0,
            0,
            imageSize.width,
            imageSize.height
        );

        PNG.bitblt(
            attachedImage._img,
            newImage,
            0,
            0,
            attachedImageSize.width,
            attachedImageSize.height,
            0,
            imageSize.height
        );

        this._img = newImage;

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
