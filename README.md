# gemini-core

[![Build Status](https://travis-ci.org/gemini-testing/gemini-core.svg?branch=master)](https://travis-ci.org/gemini-testing/gemini-core)
[![Coverage Status](https://coveralls.io/repos/github/gemini-testing/gemini-core/badge.svg?branch=master)](https://coveralls.io/github/gemini-testing/gemini-core?branch=master)

Utility which contains common modules for [gemini](https://github.com/gemini-testing/gemini) and [hermione](https://github.com/gemini-testing/hermione).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [SetsBuilder](#setsbuilder)
- [Options](#options)
  - [Sets](#sets)
- [BrowserPool](#browserpool)
- [BrowserAgent](#browseragent)
- [Errors](#errors)
  - [CancelledError](#cancellederror)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

### SetsBuilder
Creates mapping of test files with browsers in which they should be run and vice versa.

Example of usage:

```js
const SetsBuilder = require('gemini-core').SetsBuilder;
const sets = {
    desktop: {
        files: ['desktop/tests/**.js'],
        browsers: ['bro1']
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

return pool.getBrowser('bro')
    .then((bro) => {
        ...
        return pool.freeBrowser(bro);
    });

```

### BrowserAgent

Example:
```js
const BrowserAgent = require('gemini-core').BrowserAgent;
const BrowserPool = require('gemini-core').BrowserPool;
const pool = BrowserPool.create(/*BrowserManager, config*/);
const browserAgent = BrowserAgent.create('bro-id', pool);

return browserAgent.getBrowser()
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
