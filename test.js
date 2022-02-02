const {Promise} = require('bluebird');
const sharp = require('sharp');
const Image = require('./lib/image');
const PngJsImage = require('./lib/image/index-pngjs');
const OldImage = require('./lib/image/index-old');
const fs = require('fs');
const util = require('util');
const _ = require('lodash');
const {performance, PerformanceObserver} = require('perf_hooks');

let imagesToJoin,
    library;

(async function() {
    const array = createPerformanceObserver();
    const images = await generateImages();
    const libs = [
        'pngjs',
        'sharp',
        'png_img'
    ];

    for (const lib of libs) {
        await testLib(lib, images);
    }

    const results = prepareResults(array);

    await util.promisify(fs.writeFile.bind(fs))('test-result.json', JSON.stringify(results, null, 4));
})()
    .then(res => res && console.log(res))
    .catch(console.error);

function createPerformanceObserver() {
    const array = [];

    const obs = new PerformanceObserver((list) => {
        const entry = list.getEntries()[0];

        array.push(entry);
    });

    obs.observe({entryTypes: ['measure']});

    return array;
}

async function generateImages() {
    const images = [
        // {width: 50, height: 50},
        {width: 10, height: 10},
        {width: 100, height: 100},
        {width: 1000, height: 1000},
        {width: 1000, height: 2000},
        {width: 2000, height: 1000},
        {width: 2000, height: 2000},
        {width: 4000, height: 2000},
        {width: 2000, height: 4000},
        {width: 4000, height: 4000}
    ];

    return Promise.all(images.map(async image => ({
        name: `${image.width}x${image.height}`,
        base64: (await sharp({
            create: {
                channels: 3,
                background: {r: 255, g: 255, b: 255},
                width: image.width,
                height: image.height
            }
        }).png().toBuffer()).toString('base64')
    })));
}

async function testLib(lib, images) {
    if (lib === 'pngjs') {
        library = PngJsImage;
    } else if (lib === 'sharp') {
        library = Image;
    } else {
        library = OldImage;
    }

    imagesToJoin = images.reduce((res, {name, base64}) => ({
        [name]: library.fromBase64(base64),
        ...res
    }), {});

    await pW(`${lib}-total`, async () => {
        for (const {name, base64} of images) {
            await pW(`${lib}-${name}-total`, () => testImage(lib, name, base64));
        }
    });
}

async function pW(markName, fn) {
    performance.mark(`${markName}-start`, {
        startTime: Date.now()
    });

    try {
        return await fn();
    } finally {
        performance.measure(markName, `${markName}-start`);
    }
}

async function testImage(lib, name, base64) {
    const image = await pW(`${lib}-${name}-fromBase64`, () => library.fromBase64(base64));
    const size = await pW(`${lib}-${name}-getSize`, () => image.getSize());

    // const image = sharp({
    //     create: {
    //         channels: 3,
    //         background: '#fff',
    //         width: 50,
    //         height: 50
    //     }
    // });

    // console.log('image.options.composite', image.options.composite);

    // image.composite([{
    //     input: {
    //         create: {
    //             channels: 3,
    //             background: '#00f',
    //             width: 40,
    //             height: 40
    //         }
    //     },
    //     left: 10,
    //     top: 10
    // }]);

    // await image.clear({
    //     left: 10,
    //     top: 10,
    //     width: 40,
    //     height: 40
    // });

    // console.log('image.options.composite', image.options.composite);

    // await image.crop({
    //     left: 1,
    //     top: 1,
    //     width: 10,
    //     height: 10
    // });

    // await image.save('test.png');

    // if (name.split('x').every(dimension => Number(dimension) <= 1000)) {
    //     await pW(`${lib}-${name}-getRGBA`, async () => {
    //         for (let x = 0; x < size.width; x++) {
    //             for (let y = 0; y < size.height; y++) {
    //                 await image.getRGBA(x, y);
    //             }
    //         }
    //     });
    // }

    await pW(`${lib}-${name}-clear`, () => image.clear({
        left: Math.round(size.width / 4),
        top: Math.round(size.height / 4),
        width: size.width / 2,
        height: size.height / 2
    }));

    // await imagesToJoin[name].clear({
    //     left: 250,
    //     top: 250,
    //     width: 600,
    //     height: 600
    // });

    // await imagesToJoin[name].save('test.png');

    // await imagesToJoin[name].crop({
    //     left: 500,
    //     top: 500,
    //     width: 700,
    //     height: 700
    // });

    // await imagesToJoin[name].save('test.png');

    // console.log('imagesToJoin[name]._img.options.composite', imagesToJoin[name]._img.options.composite);

    // console.log('size', size);
    // console.log('await imagesToJoin[name].getSize()', await imagesToJoin[name].getSize());
    // console.log({
    //     left: Math.round(size.width / 2),
    //     top: Math.round(size.height / 2),
    //     width: size.width / 2,
    //     height: size.height / 2
    // });

    await imagesToJoin[name].crop({
        left: Math.round(size.width / 4),
        top: Math.round(size.height / 4),
        width: size.width / 2,
        height: size.height / 2
    });

    await pW(`${lib}-${name}-crop`, () => imagesToJoin[name].crop({
        left: Math.round(size.width / 4),
        top: Math.round(size.height / 4),
        width: size.width / 2,
        height: size.height / 2
    }));
    // await pW(`${lib}-${name}-crop_horizontal`, () => imagesToJoin[name].crop({
    //     left: 0,
    //     top: Math.round(size.height / 4),
    //     width: size.width,
    //     height: size.height / 2
    // }));
    // await pW(`${lib}-${name}-crop_vertical`, () => imagesToJoin[name].crop({
    //     left: 0,
    //     top: 0,
    //     width: size.width / 2,
    //     height: size.height / 2
    // }));

    await pW(`${lib}-${name}-join`, async () => {
        if (lib === 'sharp') {
            return image.join([
                imagesToJoin[name],
                imagesToJoin[name],
                imagesToJoin[name],
                imagesToJoin[name],
                imagesToJoin[name],
                imagesToJoin[name],
                imagesToJoin[name]
            ]);
        }

        await image.join(imagesToJoin[name]);
        await image.join(imagesToJoin[name]);
        await image.join(imagesToJoin[name]);
        await image.join(imagesToJoin[name]);
        await image.join(imagesToJoin[name]);
        await image.join(imagesToJoin[name]);
        await image.join(imagesToJoin[name]);
    });

    await pW(`${lib}-${name}-save`, () => image.save(`test-${name}.png`));
}

function prepareResults(performanceEntries) {
    return _(performanceEntries)
        .groupBy(entry => getLibName(entry.name))
        .mapValues((entries) => {
            return _(entries)
                .groupBy(entry => getImgName(entry.name))
                .mapValues((entries, imgName) => {
                    if (imgName === 'total') {
                        return entries[0].duration;
                    }

                    return entries.reduce((res, entry) => ({
                        ...res,
                        [getActionName(entry.name)]: entry.duration
                    }), {});
                })
                .value();
        })
        .value();
}

function getLibName(entryName) {
    return entryName.split('-')[0];
}

function getImgName(entryName) {
    return entryName.split('-')[1];
}

function getActionName(entryName) {
    return entryName.split('-')[2];
}
