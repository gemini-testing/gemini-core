'use strict';

console.log('HELLO FROM GEMINI-CORE');

module.exports = {
    SetsBuilder: require('./lib/sets-builder'),
    config: {
        options: require('./lib/config/options')
    },
    BrowserPool: require('./lib/browser-pool'),
    BrowserAgent: require('./lib/browser-agent'),
    errors: require('./lib/errors')
};
