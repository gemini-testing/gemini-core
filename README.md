# gemini-core

[![Build Status](https://travis-ci.org/gemini-testing/gemini-core.svg?branch=master)](https://travis-ci.org/gemini-testing/gemini-core)

Utility which contains common modules for [gemini](https://github.com/gemini-testing/gemini) and [hermione](https://github.com/gemini-testing/hermione).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [SetsBuilder](#setsbuilder)
- [Options](#options)
  - [Sets](#sets)
- [BrowserPool](#browserpool)
- [events](#events)
  - [AsyncEmitter](#asyncemitter)
  - [utils](#utils)
- [promiseUtils](#promiseutils)
- [BrowserAgent](#browseragent)
- [Errors](#errors)
  - [CancelledError](#cancellederror)
- [Image](#image)
  - [Methods](#methods)
    - [crop](#crop)
    - [getSize](#getsize)
    - [getRGBA](#getrgba)
    - [save](#save)
    - [clear](#clear)
    - [join](#join)
  - [Static methods](#static-methods)
    - [fromBase64](#frombase64)
    - [RGBToString](#rgbtostring)
    - [compare](#compare)
    - [buildDiff](#builddiff)
- [Temp](#temp)
  - [init](#init)
  - [path](#path)
  - [serialize](#serialize)
  - [attach](#attach)
- [clientBdridge](#clientbdridge)
- [coverageLevel](#coveragelevel)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

### SetsBuilder
Creates mapping of test files with browsers in which they should be run and vice versa.

Example of usage:

```js
const SetsBuilder = require('gemini-core').SetsBuilder;
const sets = {
    desktop: {
        files: ['desktop/tests/**.js'],
        ignoreFiles: ['desktop/tests/fixtures/**'], // exclude directories from reading while test finding
        browsers: ['bro1'],
    },
    touch-phone: {
        files: ['touch-phone/tests'],
        browsers: ['bro2']
    }
};

SetsBuilder
    .create(sets, {defaultDir: 'default/path'}) // creates setsBuilder using specified tests and options
    .useSets(['desktop']) // use only the specified sets
    .useBrowsers(['bro1']) // use only specified browsers
    .useFiles(['desktop/tests/test.js']) // use only specified files if sets
                                      //and files to use are not specified
    .build('/root', globOpts) // builds a collection of sets with paths expanded according
                                  // to the project root and glob options
    .then((setCollection) => {
        setCollection.groupByFile(); // groups all browsers of test-sets by file:
                                    // {'desktop/tests/test.js': ['bro1']}
        setCollection.groupByBrowser(); // groups all files of test-sets by browser:
                                       // {'bro': ['desktop/tests/test.js']}
    })
    .done();
```

### Options

Returns an object with some options.

```js
const options = require('gemini-core').config.options;
```

#### Sets

```js
const sets = options.sets; // returns a section for configparser with two options – files and browsers.
                           // Default value is an empty set - all: {files: []}
```

### BrowserPool

Example:
```js
const BrowserPool = require('gemini-core').BrowserPool;

// Some browser realization
class Browser {
    constructor(id) {
        this.id = 'bro'; // required field
        this.sessionId = null; // required field
    }

    launch() {
        return doLaunch()
            .then((sessionId) => this.sessionId = sessionId);
    }

    // required method
    reset() {
        return doSomeReset();
    }

    quit() {
        return doQuit();
    }
}

const BrowserManager = {
    create: (id) => new Browser(id),

    start: (browser) => browser.launch(),
    onStart: (browser) => emitter.emitAndWait('sessionStart', browser),

    onQuit: (browser) => emitter.emitAndWait('sessionEnd', browser),
    quit: (browser) => browser.quit()
};

const config = {
    forBrowser: (id) => {
        return {
            parallelLimit: 1, // maximum number of specific browser sessions executed in parallel
            sessionUseLimit: 2 // maxiumu number of session reuse (test per session, for example)
        };
    },

    getBrowserIds: () => config.getBrowserIds(),

    system: {
        parallelLimit: 10 // maximum number of browser sessions at all
    }
};

const pool = BrowserPool.create(BrowserManager, {
    logNamespace: 'gemini', // prefix for logger. log = require('debug')(`${logNamespace}:pool:...`)
    config
});

return pool.getBrowser('bro'/*, {highPriority: true}*/)
    .then((bro) => {
        ...
        return pool.freeBrowser(bro);
    });

```

### events

#### AsyncEmitter

Node.js event emitter with promises support.

Node.js builtin `EventEmitter` class executes all handlers synchronously without waiting for completion of any async operations that may happen inside.

`AsyncEmitter` is the subclass of `EventEmitter` which adds ability to return a promise from event handler and wait until it resolved. Just use `emitAndWait` instead of `emit`:

```js
const AsyncEmitter = require('gemini-core').events.AsyncEmitter;
const emitter = new AsyncEmitter();
emitter.on('event', function() {
    return Promise.delay(1000);
});

emitter.emitAndWait('event')
    .then(function() {
        console.log('All handlers finished'); // Would be called after 1 second
    });
```

`emitAndWait` returns promise.

#### utils
`passthroughEvent(from, to, event)`

Passes `event` from `from` to `to`. `event` can be an array of events.

### promiseUtils

`waitForResults(promises)`

Waits for all promises in array to be resolved or rejected.
If any promise is rejected - rejects with the first rejection error, otherwise resolves.

### BrowserAgent

Example:
```js
const BrowserAgent = require('gemini-core').BrowserAgent;
const BrowserPool = require('gemini-core').BrowserPool;
const pool = BrowserPool.create(/*BrowserManager, config*/);
const browserAgent = BrowserAgent.create('bro-id', pool);

return browserAgent.getBrowser(/*{highPriority: true}*/)
    .then((bro) => {
        ...
        return browserAgent.freeBrowser(bro/*, {force: true}*/);
    });
```

### Errors

#### CancelledError
This error will be thrown on browser pool cancel:
```js
const BrowserPool = require('gemini-core').BrowserPool;
const CancelledError = require('gemini-core').errors.CancelledError;
...
pool.getBrowser('bro')
    .then((bro) => ...)
    .catch((e) => {
        if (e instanceof CancelledError) {
            console.log('cancelled')
        }
    });

pool.cancel();
```

### Image

API for working with images.

```js
const {Image} = require('gemini-core');
const imgBuffer = new Buffer('someBufferString', 'base64');
const image = new Image(imgBuffer);

const imageSize = image.getSize();
```

#### Methods

##### crop
Crop image to the passed sizes depending on scale factor. Modifies current image.
Returns Promise with image instance.

```js
const image = new Image(imgBuffer);
const cropArea = {
    top: 10,
    left: 10,
    width: 100,
    height: 100
};

image.crop(cropArea, 2); // will crop double sized image i.e width=200, heigth=200 etc.
```

##### getSize

Returns object with current image size e.g. `{width: 100, height: 100}`

##### getRGBA

Returns RGBA color of the passed image pixel in row.
Takes pixel number in row as first argument and row nomber as second.
Returns object with color.

```js
const image = new Image(imgBuffer);

const color = image.getRGBA(1, 2); // {r: 255, g: 0, b: 0, a:255}
```

##### save

Save image to the passed path. Asynchronous operation.
Returns Promise with current image instance.

##### clear

Fill image area with black color depending on scale factor.

```js
const image = new Image(imgBuffer);
const clearArea = {
    top: 10,
    left: 10,
    width: 100,
    height: 100
};

image.clear(clearArea, {scaleFactor: 1});
```

##### join

Append another image to current. Modifies current image.

```js
const image1 = new Image(imgBuffer);
const image2 = new Image(imgBuffer);

image1.join(image2);
```

#### Static methods

##### fromBase64

Returns new Image instance from base64 hash.

##### RGBToString

Convert object-like RGB color to string.

```js
const color = Image.RGBToString({r: 255, g: 0, b: 0}); // returns #ff0000
```

##### compare

Compare images with passed options. Asynchronous operation.
Returns compare result sa Boolean value.

```js
const opts = {
    canHaveCaret: true,
    pixelRatio: 1,
    tolerance: 2,
    antialiasingTolerance: 3
};

return Image.compare(path1, path2, opts)
    .then((isEqual) => {
        console.log(isEqual);
    });
```

##### buildDiff

Save new diff image with passed options on the file system.

```js
const diffOpts = {
    reference: '/ref/path/image.png',
    current: '/curr/path/image.png',
    diff: '/diff/path/image.png',
    diffColor: '#f5f5f5',
    tolerance: 2
};

return Image.buildDiff(diffOpts); // will save image with diff to /diff/path/image.png
```

### Temp

Class for creating temp direcroty for image save. Directory will be removed on process end.

#### init

Init temp directory.

#### path

Generate random path relative temp directory.

#### serialize

Serialize Temp instance.

#### attach

Attach passed directory to the current Temp instance.

### clientBdridge

```js
const {clientBridge} = require('gemini-core');

return clientBridge.build(browser, {calibration, coverage});
```

### coverageLevel

```js
const {coverage: {coverageLevel}} = require('gemini-core');

coverageLevel.merge(oldValue, newValue);
```
