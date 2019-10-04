'use strict';

const Promise = require('bluebird');
const looksSame = require('looks-same');
const PngImg = require('png-img');
const utils = require('png-img/utils');
const SafeRect = require('./safe-rect');

module.exports = class Image {
    static create(buffer) {
        return new this(buffer);
    }

    constructor(buffer) {
        this._img = new PngImg(buffer);
        this._ignoreAreas = [];
    }

    crop(rect, opts = {}) {
        rect = this._scale(rect, (opts).scaleFactor);
        const imageSize = this.getSize();
        const safeRect = SafeRect.create(rect, imageSize);

        this._cropAreas(safeRect);

        this._img.crop(
            safeRect.left,
            safeRect.top,
            safeRect.width,
            safeRect.height
        );

        return Promise.resolve(this);
    }

    _cropAreas(rect) {
        this._ignoreAreas.forEach((area) => {
            area.top -= rect.top;
            area.left -= rect.left;
        });
    }

    getIgnoreAreas() {
        return this._ignoreAreas;
    }

    getSize() {
        return this._img.size();
    }

    getRGBA(x, y) {
        return this._img.get(x, y);
    }

    save(file) {
        return Promise.fromCallback((cb) => this._img.save(file, cb));
    }

    setIgnoreAreas(areas, opts = {}) {
        this._ignoreAreas = areas.map((area) => {
            return this._scale(area, opts.scaleFactor);
        });
    }

    clear(area, opts = {}) {
        area = this._scale(area, (opts).scaleFactor);
        this._img.fill(
            area.left,
            area.top,
            area.width,
            area.height,
            '#000000'
        );
    }

    frame(area, opts = {}) {
        area = this._scale(area, opts.scaleFactor);
        const lineWidth = opts.scaleFactor,
            color = '#000000';

        /* top line */
        this._img.fill(
            area.left,
            area.top,
            area.width,
            lineWidth,
            color
        );

        /* bottom line */
        this._img.fill(
            area.left,
            area.top + area.height - lineWidth,
            area.width,
            lineWidth,
            color
        );

        /* left line */
        this._img.fill(
            area.left,
            area.top,
            lineWidth,
            area.height,
            color
        );

        /* right line */
        this._img.fill(
            area.left + area.width - lineWidth,
            area.top,
            lineWidth,
            area.height,
            color
        );
    }

    join(newImage) {
        const imageSize = this.getSize();
        const newIgnoreAreas = newImage.getIgnoreAreas();

        this._img
            .setSize(imageSize.width, imageSize.height + newImage.getSize().height)
            .insert(newImage._img, 0, imageSize.height);

        newIgnoreAreas.forEach(({top, left, height, width}) => {
            this._ignoreAreas.push({
                top: top + imageSize.height,
                left,
                height,
                width
            });
        });

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
        return new Image(new Buffer(base64, 'base64'));
    }

    static RGBToString(rgb) {
        return utils.RGBToString(rgb);
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
