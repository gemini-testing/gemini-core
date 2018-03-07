'use strict';

const Promise = require('bluebird');
const Viewport = require('./viewport');
const HeightViewportError = require('./viewport/coord-validator/errors/height-viewport-error');

module.exports = class ScreenShooter {
    static create(browser) {
        return new ScreenShooter(browser);
    }

    constructor(browser) {
        this._browser = browser;
    }

    capture(page) {
        return this._browser.captureViewportImage(page)
            .then((viewportImage) => Viewport.create(page.viewport, viewportImage, page.pixelRatio))
            .then((viewport) => this._cropImage(viewport, page));
    }

    _cropImage(viewport, page) {
        try {
            viewport.validate(page.captureArea, this._browser);
        } catch (e) {
            return e instanceof HeightViewportError && this._browser.config.compositeImage
                ? this._extendImage(viewport, page)
                : Promise.reject(e);
        }

        viewport.ignoreAreas(page.ignoreAreas);

        return viewport.crop(page.captureArea);
    }

    _extendImage(viewport, page) {
        const scrollHeight = Math.min(
            viewport.getVerticalOverflow(page.captureArea),
            page.viewport.height
        );

        return this._browser
            .scrollBy(0, scrollHeight)
            .then(() => {
                page.viewport.top += scrollHeight;
                return this._browser.captureViewportImage(page);
            })
            .then((newImage) => viewport.extendBy(scrollHeight, newImage))
            .then(() => this._cropImage(viewport, page));
    }
};
