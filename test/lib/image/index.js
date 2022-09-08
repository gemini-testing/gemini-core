'use strict';

const PngImg = require('png-img');
const utils = require('png-img/dist/utils');
const proxyquire = require('proxyquire');

const looksSameStub = sinon.stub();
const Image = proxyquire('lib/image', {
    'looks-same': looksSameStub
});
const SafeRect = require('lib/image/safe-rect');

describe('Image', () => {
    const sandbox = sinon.sandbox.create();
    let image;

    beforeEach(() => {
        // Image 1x1 pixel
        const bufferString = `iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAA
                            CQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjw
                            v8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAMSUR
                            BVBhXY2BgYAAAAAQAAVzN/2kAAAAASUVORK5CYII=`;
        const imgBuffer = new Buffer(bufferString, 'base64');

        image = Image.create(imgBuffer);

        sandbox.stub(PngImg.prototype, 'size').returns({width: 100500, height: 500100});
    });

    afterEach(() => sandbox.restore());

    describe('crop', () => {
        beforeEach(() => {
            sandbox.stub(SafeRect, 'create').returns({});

            sandbox.stub(PngImg.prototype, 'crop');
        });

        it('should create instance of "SafeRect"', () => {
            const rect = {left: 1, top: 2, width: 3, height: 4};

            return image.crop(rect)
                .then(() => {
                    assert.calledOnce(SafeRect.create);
                    assert.calledWith(SafeRect.create, rect, image.getSize());
                });
        });

        it('should consider scale factor before creating of instance of "SafeRect"', () => {
            const rect = {left: 1, top: 2, width: 3, height: 4};
            const scaledRect = {left: 2, top: 4, width: 6, height: 8};

            return image.crop(rect, {scaleFactor: 2})
                .then(() => assert.calledWith(SafeRect.create, scaledRect));
        });

        it('should use default scale factor (one) if the passed value is not positive', () => {
            const rect = {left: 1, top: 2, width: 3, height: 4};

            return image.crop(rect, {scaleFactor: null})
                .then(() => assert.calledWith(SafeRect.create, rect));
        });

        it('should crop an image', () => {
            SafeRect.create.returns({left: 1, top: 2, width: 3, height: 4});

            return image.crop({})
                .then(() => {
                    assert.calledOnce(PngImg.prototype.crop);
                    assert.calledWith(PngImg.prototype.crop, 1, 2, 3, 4);
                });
        });

        it('should be resolved with the same instance of "Image" after crop', () => {
            return image.crop({})
                .then((res) => assert.deepEqual(res, image));
        });
    });

    it('should return correct size', () => {
        PngImg.prototype.size.returns({w: 10, h: 20});
        const result = image.getSize();

        assert.deepEqual(result, {w: 10, h: 20});
    });

    it('should return RGBA', () => {
        const color = {r: 123, g: 234, b: 231, a: 132};

        sandbox.stub(PngImg.prototype, 'get').returns(color);
        const result = image.getRGBA(0, 0);

        assert.calledWith(PngImg.prototype.get, 0, 0);
        assert.deepEqual(result, color);
    });

    it('should clear a region of an image according to scale factor', () => {
        sandbox.stub(PngImg.prototype, 'fill');

        const clearArea = {top: 10, left: 20, width: 40, height: 30};
        const scaleOpts = {scaleFactor: 5};

        image.clear(clearArea, scaleOpts);

        assert.calledWith(PngImg.prototype.fill, 20 * 5, 10 * 5, 40 * 5, 30 * 5, '#000000');
    });

    it('should convert RGB to string', () => {
        sandbox.stub(utils, 'RGBToString');

        const rgb = {r: 111, g: 222, b: 123};

        Image.RGBToString(rgb);

        assert.calledWith(utils.RGBToString, rgb);
    });

    it('should save file', () => {
        const stubSave = sandbox.stub(PngImg.prototype, 'save').yields();

        return image.save('some/path')
            .then(() => {
                assert.calledOnce(stubSave);
                assert.calledWith(stubSave, 'some/path');
            });
    });

    it('should join new image to current image', () => {
        sandbox.stub(PngImg.prototype, 'insert');
        sandbox.stub(PngImg.prototype, 'setSize').returns(PngImg.prototype);
        PngImg.prototype.size.returns({width: 150, height: 200});

        image.join(image);

        assert.calledWith(PngImg.prototype.setSize, 150, 200 + 200);
        assert.calledWith(PngImg.prototype.insert, sinon.match.any, 0, 200);
    });

    it('should compare two images', () => {
        looksSameStub.yields();

        return Image.compare('some/path', 'other/path', {
            canHaveCaret: true,
            pixelRatio: 11,
            tolerance: 250,
            antialiasingTolerance: 100500,
            compareOpts: {stopOnFirstFail: true}
        })
            .then(() => {
                assert.calledOnce(looksSameStub);
                assert.calledWith(looksSameStub, 'some/path', 'other/path', {
                    ignoreCaret: true,
                    pixelRatio: 11,
                    tolerance: 250,
                    antialiasingTolerance: 100500,
                    stopOnFirstFail: true
                });
            });
    });

    it('should build diff image', () => {
        const createDiffStub = sinon.stub();
        looksSameStub.createDiff = createDiffStub;
        createDiffStub.yields();

        return Image.buildDiff({
            reference: 100,
            current: 200,
            diff: 500,
            tolerance: 300,
            diffColor: 400
        })
            .then(() => {
                assert.calledOnce(createDiffStub);
                assert.calledWith(createDiffStub, {
                    reference: 100,
                    current: 200,
                    diff: 500,
                    tolerance: 300,
                    highlightColor: 400
                });
            });
    });
});
