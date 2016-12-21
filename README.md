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
