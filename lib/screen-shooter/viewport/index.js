'use strict';

const _ = require('lodash');

const CoordValidator = require('./coord-validator');

module.exports = class Viewport {
    static create(...args) {
        return new Viewport(...args);
    }

    constructor(viewport, image, pixelRatio, opts) {
        this._viewport = _.clone(viewport);
        this._images = [image];
        this._pixelRatio = pixelRatio;
        this._opts = opts;
    }

    async _getImage() {
        if (this._images.length === 1) {
            return this._images[0];
        }

        const [firstImage, ...otherImages] = this._images;
        const joinedImage = await firstImage.join(otherImages);
        this._images = [joinedImage];

        return joinedImage;
    }

    validate(captureArea, browser) {
        CoordValidator.create(browser, this._opts).validate(this._viewport, captureArea);
    }

    async ignoreAreas(areas) {
        await Promise.all(
            _(areas)
                .map((area) => this._getIntersectionWithViewport(area))
                .compact()
                .map(async (area) => {
                    const image = await this._getImage();

                    return image.clear(this._transformToViewportOrigin(area), {scaleFactor: this._pixelRatio});
                })
                .value()
        );
    }

    async crop(captureArea) {
        const image = await this._getImage();

        return image.crop(this._transformToViewportOrigin(captureArea), {scaleFactor: this._pixelRatio});
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

    async save(path) {
        return this._getImage().save(path);
    }

    async extendBy(scrollHeight, newImage) {
        const newImageSize = await newImage.getSize();
        const physicalScrollHeight = scrollHeight * this._pixelRatio;

        this._viewport.height += scrollHeight;

        const croppedImage = await newImage.crop({
            left: 0,
            top: newImageSize.height - physicalScrollHeight,
            width: newImageSize.width,
            height: physicalScrollHeight
        });

        this._images.push(croppedImage);
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
