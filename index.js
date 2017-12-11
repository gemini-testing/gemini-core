'use strict';

module.exports = {
    SetsBuilder: require('./lib/sets-builder'),
    config: {
        options: require('./lib/config/options')
    },
    BrowserPool: require('./lib/browser-pool'),
    BrowserAgent: require('./lib/browser-agent'),
    Image: require('./lib/image'),
    Temp: require('./lib/temp'),
    errors: require('./lib/errors'),
    events: require('./lib/events'),
    promiseUtils: require('./lib/promise-utils')
};
