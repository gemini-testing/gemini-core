'use strict';

const BasicPool = require('build/lib/browser-pool/basic-pool').default;
const LimitedPool = require('build/lib/browser-pool/limited-pool').default;
const PerBrowserLimitedPool = require('build/lib/browser-pool/per-browser-limited-pool').default;
const pool = require('build/lib/browser-pool');
const _ = require('lodash');

describe('browser-pool', () => {
    const sandbox = sinon.sandbox.create();

    afterEach(() => sandbox.restore());

    const mkConfig_ = (opts) => {
        return {
            system: opts && opts.system || {},
            forBrowser: sinon.stub().returns({id: 'id'}),
            getBrowserIds: sinon.stub().returns(['id'])
        };
    };

    const mkPool_ = (opts) => {
        opts = _.defaults(opts, {
            browserManager: {},
            config: mkConfig_()
        });

        return pool.create(opts.browserManager, opts);
    };

    it('should create basic pool', () => {
        const browserManager = {foo: 'bar'};
        const opts = {config: mkConfig_()};
        sandbox.spy(BasicPool, 'create');

        pool.create(browserManager, opts);

        assert.calledOnce(BasicPool.create);
        assert.calledWith(BasicPool.create, browserManager, opts);
    });

    it('should create pool according to perBrowserLimit by default', () => {
        const browserPool = mkPool_();

        assert.instanceOf(browserPool, PerBrowserLimitedPool);
    });

    it('should create pool according to parallelLimit if that option exist', () => {
        const config = mkConfig_({system: {parallelLimit: 10}});

        const browserPool = mkPool_({config});

        assert.instanceOf(browserPool, LimitedPool);
    });

    it('should ignore parallelLimit if its value is Infinity', () => {
        const config = mkConfig_({system: {parallelLimit: Infinity}});

        const browserPool = mkPool_({config});

        assert.instanceOf(browserPool, PerBrowserLimitedPool);
    });

    it('should ignore parallelLimit if its value is not set', () => {
        const config = mkConfig_({system: {}});

        const browserPool = mkPool_({config});

        assert.instanceOf(browserPool, PerBrowserLimitedPool);
    });
});
