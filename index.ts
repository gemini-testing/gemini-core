'use strict';

module.exports = {
    BaseStats: require('./lib/base-stats'),
    SetsBuilder: require('./lib/sets-builder'),
    config: {
        options: require('./lib/config/options')
    },
    Calibrator: require('./lib/calibrator'),
    BrowserPool: require('./lib/browser-pool'),
    BrowserAgent: require('./lib/browser-agent'),
    Image: require('./lib/image'),
    temp: require('./lib/temp'),
    errors: require('./lib/errors'),
    events: require('./lib/events'),
    promiseUtils: require('./lib/promise-utils'),
    clientBridge: require('./lib/client-bridge'),
    coverage: {
        coverageLevel: require('./lib/coverage/coverage-level')
    },
    browser: {
        Camera: require('./lib/browser/camera')
    },
    ScreenShooter: require('./lib/screen-shooter'),
    Viewport: require('./lib/screen-shooter/viewport'),
    CoordValidator: require('./lib/screen-shooter/viewport/coord-validator')
};
