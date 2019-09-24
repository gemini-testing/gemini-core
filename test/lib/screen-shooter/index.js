'use strict';

const Image = require('lib/image');
const ScreenShooter = require('lib/screen-shooter');
const Viewport = require('lib/screen-shooter/viewport');

describe('screen-shooter', () => {
    const sandbox = sinon.sandbox.create();

    beforeEach(() => {
        sandbox.spy(Viewport, 'create');
        sandbox.stub(Viewport.prototype, 'crop');
        sandbox.stub(Viewport.prototype, 'ignoreAreas');
        sandbox.spy(Viewport.prototype, 'extendBy');
    });

    afterEach(() => sandbox.restore());

    describe('capture', () => {
        let browser;

        const stubPage = (page) => Object.assign({viewport: {}, captureArea: {}}, page);
        const capture = (page, opts, errorHandler) => ScreenShooter.create(browser, errorHandler).capture(stubPage(page), opts);

        beforeEach(() => {
            browser = {
                config: {},
                captureViewportImage: sandbox.stub().resolves(),
                scrollBy: sandbox.stub().resolves()
            };
        });

        it('should take vieport image', () => {
            return capture({viewport: 'foo', captureArea: 'bar'})
                .then(() => assert.calledOnceWith(browser.captureViewportImage, sinon.match({viewport: 'foo', captureArea: 'bar'})));
        });

        it('should create viewport instance', () => {
            browser.captureViewportImage.resolves({baz: 'qux'});

            return capture({viewport: 'foo', pixelRatio: 'bar'})
                .then(() => assert.calledOnceWith(Viewport.create, 'foo', {baz: 'qux'}, 'bar'));
        });

        ['allowViewportOverflow', 'insideViewport'].forEach((option) => {
            it(`should create Viewport instance with default "${option}" option`, async () => {
                browser.captureViewportImage.resolves();

                await capture();

                assert.calledOnceWith(
                    Viewport.create, sinon.match.any, sinon.match.any, sinon.match.any, sinon.match({[option]: false})
                );
            });

            it(`should create Viewport instance with passed "${option}" option`, async () => {
                browser.captureViewportImage.resolves();

                await capture({}, {[option]: true});

                assert.calledOnceWith(
                    Viewport.create, sinon.match.any, sinon.match.any, sinon.match.any, sinon.match({[option]: true})
                );
            });
        });

        it('should pass screenshotDelay from options option to captureViewportImage', async () => {
            await capture(stubPage(), {screenshotDelay: 2000});

            assert.calledWithMatch(browser.captureViewportImage, sinon.match.any, 2000);
        });

        it('should crop image of passed size', () => {
            return capture({captureArea: {foo: 'bar'}})
                .then(() => assert.calledOnceWith(Viewport.prototype.crop, {foo: 'bar'}));
        });

        it('should clear configured ignore areas', () => {
            return capture({ignoreAreas: {foo: 'bar'}})
                .then(() => assert.calledWith(Viewport.prototype.ignoreAreas, {foo: 'bar'}));
        });

        it('should return croped image', () => {
            Viewport.prototype.crop.resolves({foo: 'bar'});

            return assert.becomes(capture(), {foo: 'bar'});
        });

        describe('if validation fails', () => {
            describe('with NOT `HeightViewportError`', () => {
                it('should not crop image', () => {
                    return capture({captureArea: {top: -1}})
                        .catch(() => assert.notCalled(Viewport.prototype.crop));
                });
            });

            describe('with `HeightViewportError`', () => {
                describe('option `compositeImage` is switched off', () => {
                    it('should not crop image', () => {
                        return capture({captureArea: {height: 7}, viewport: {height: 5}})
                            .catch(() => assert.notCalled(Viewport.prototype.crop));
                    });
                });

                describe('option `compositeImage` is switched on', () => {
                    let image;

                    beforeEach(() => {
                        image = sinon.createStubInstance(Image);
                        image.crop.resolves({});
                        image.getSize.returns({});
                        image.save.resolves();

                        browser.config.compositeImage = true;
                        browser.captureViewportImage.resolves(image);
                    });

                    it('should scroll vertically if capture area is higher then viewport', () => {
                        const page = {captureArea: {height: 7}, viewport: {top: 0, height: 5}};

                        return capture(page)
                            .then(() => assert.calledOnceWith(browser.scrollBy, 0, 2));
                    });

                    it('should scroll vertically until the end of capture area', () => {
                        const page = {captureArea: {height: 11}, viewport: {top: 0, height: 5}};

                        return capture(page)
                            .then(() => {
                                assert.calledTwice(browser.scrollBy);
                                assert.calledWith(browser.scrollBy, 0, 5);
                                assert.calledWith(browser.scrollBy, 0, 1);
                            });
                    });

                    it('should capture scrolled viewport image', () => {
                        const page = {captureArea: {height: 7}, viewport: {top: 0, height: 5}};

                        return capture(page)
                            .then(() => assert.calledWithMatch(browser.captureViewportImage, {viewport: {top: 2}}));
                    });

                    // Test does not fairly check that `captureViewportImage` was called after resolving of `scrollBy`
                    it('should capture viewport image after scroll', () => {
                        const page = {captureArea: {height: 7}, viewport: {top: 0, height: 5}};
                        const scrolledPage = {captureArea: {height: 7}, viewport: {top: 2, height: 5}};

                        const captureViewportImage = browser.captureViewportImage.withArgs(scrolledPage).named('captureViewportImage');
                        const scroll = browser.scrollBy.withArgs(0, 2).named('scroll');

                        return capture(page)
                            .then(() => assert.callOrder(scroll, captureViewportImage));
                    });

                    it('should extend original image by scrolled viewport image', () => {
                        const page = {captureArea: {height: 7}, viewport: {top: 0, height: 5}};

                        const scrolledPage = {captureArea: {height: 7}, viewport: {top: 2, height: 5}};
                        const scrolledViewportScreenshot = image;

                        browser.captureViewportImage.withArgs(scrolledPage).returns(Promise.resolve(scrolledViewportScreenshot));

                        return capture(page)
                            .then(() => assert.calledOnceWith(Viewport.prototype.extendBy, 2, scrolledViewportScreenshot));
                    });

                    it('should crop capture area which is higher then viewport', () => {
                        const page = {captureArea: {height: 7}, viewport: {top: 0, height: 5}};

                        return capture(page)
                            .then(() => assert.calledOnceWith(Viewport.prototype.crop, page.captureArea));
                    });

                    it('should clear configured ignore areas', () => {
                        return capture({ignoreAreas: {foo: 'bar'}})
                            .then(() => assert.calledWith(Viewport.prototype.ignoreAreas, {foo: 'bar'}));
                    });

                    it('should return cropped image', () => {
                        Viewport.prototype.crop.resolves('foo bar');

                        return assert.becomes(capture(), 'foo bar');
                    });
                });
            });
        });
    });
});
