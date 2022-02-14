'use strict';

const _ = require('lodash');

const CoordValidator = require('./coord-validator');

module.exports = class Viewport {
    static create(...args) {
        return new Viewport(...args);
    }

    constructor(viewport, image, pixelRatio, opts) {
        this._viewport = _.clone(viewport);
        this._image = image;
        this._pixelRatio = pixelRatio;
        this._opts = opts;
    }

    validate(captureArea, browser) {
        CoordValidator.create(browser, this._opts).validate(this._viewport, captureArea);
    }

    ignoreAreas(areas) {
        _(areas)
            .map((area) => this._getIntersectionWithViewport(area))
            .compact()
            .forEach((area) => this._image.clear(this._transformToViewportOrigin(area), {scaleFactor: this._pixelRatio}));
    }

    crop(captureArea) {
        return this._image.crop(this._transformToViewportOrigin(captureArea), {scaleFactor: this._pixelRatio});
    }

    _getIntersectionWithViewport(area) {
        const top = Math.max(this._viewport.top, area.top);
        const bottom = Math.min(getAreaBottom(this._viewport), getAreaBottom(area));
        const left = Math.max(this._viewport.left, area.left);
        const right = Math.min(getAreaRight(this._viewport), getAreaRight(area));

        if (left >= right || top >= bottom) {
            return null;
        }
        return {top, left, width: right - left, height: bottom - top};
    }

    _transformToViewportOrigin(area) {
        return _.extend({}, area, {
            top: area.top - this._viewport.top,
            left: area.left - this._viewport.left
        });
    }

    save(path) {
        return this._image.save(path);
    }

    extendBy(scrollHeight, newImage) {
        const newImageSize = newImage.getSize();
        const physicalScrollHeight = scrollHeight * this._pixelRatio;

        this._viewport.height += scrollHeight;

        return newImage.crop({
            left: 0,
            top: newImageSize.height - physicalScrollHeight,
            width: newImageSize.width,
            height: physicalScrollHeight
        })
            .then((croppedImage) => this._image.join(croppedImage));
    }

    getVerticalOverflow(captureArea) {
        return (captureArea.top + captureArea.height) - (this._viewport.top + this._viewport.height);
    }
};

function getAreaBottom(area) {
    return area.top + area.height;
}

function getAreaRight(area) {
    return area.left + area.width;
}
