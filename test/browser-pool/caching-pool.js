'use strict';

const Promise = require('bluebird');
const Pool = require('lib/browser-pool/caching-pool');
const stubBrowser = require('./util').stubBrowser;

describe('browser-pool/caching-pool', () => {
    const sandbox = sinon.sandbox.create();

    let underlyingPool;

    const poolWithReuseLimits_ = (limits) => {
        const config = {
            getBrowserIds: sinon.stub().returns(Object.keys(limits)),
            forBrowser: (id) => {
                return {
                    sessionUseLimit: limits[id]
                };
            }
        };

        return new Pool(underlyingPool, config, {});
    };

    const makePool_ = () => poolWithReuseLimits_({bro: Infinity});

    beforeEach(() => {
        underlyingPool = {
            getBrowser: sinon.stub().callsFake((id) => Promise.resolve(stubBrowser(id))),
            freeBrowser: sinon.stub().returns(Promise.resolve()),
            finalizeBrowsers: sinon.stub().returns(Promise.resolve()),
            cancel: sinon.stub()
        };
    });

    afterEach(() => sandbox.restore());

    it('should create new browser when requested first time', () => {
        const pool = makePool_();

        return pool.getBrowser('bro')
            .then(() => assert.calledOnceWith(underlyingPool.getBrowser, 'bro'));
    });

    it('should return same browser as returned by underlying pool', () => {
        const browser = stubBrowser('bro');
        underlyingPool.getBrowser.withArgs('bro').returns(Promise.resolve(browser));

        return makePool_()
            .getBrowser('bro')
            .then((bro) => assert.equal(bro, browser));
    });

    it('should not reset new browser', () => {
        const browser = stubBrowser();
        underlyingPool.getBrowser.withArgs('bro').returns(Promise.resolve(browser));

        return makePool_()
            .getBrowser('bro')
            .then(() => assert.notCalled(browser.reset));
    });

    it('should create and launch new browser if there is free browser with different id', () => {
        underlyingPool.getBrowser
            .withArgs('first').returns(Promise.resolve(stubBrowser('first')))
            .withArgs('second').returns(Promise.resolve(stubBrowser('second')));

        const pool = poolWithReuseLimits_({
            first: 1,
            second: 1
        });

        return pool.getBrowser('first')
            .then((browser) => pool.freeBrowser(browser))
            .then(() => pool.getBrowser('second'))
            .then(() => assert.calledWith(underlyingPool.getBrowser, 'second'));
    });

    it('should not quit browser when freed', () => {
        underlyingPool.getBrowser.withArgs('bro').returns(Promise.resolve(stubBrowser('bro')));
        const pool = makePool_();

        return pool.getBrowser('bro')
            .then((browser) => pool.freeBrowser(browser, {force: false}))
            .then(() => assert.notCalled(underlyingPool.freeBrowser));
    });

    it('should quit browser when there are no more requests', () => {
        underlyingPool.getBrowser.withArgs('bro').returns(Promise.resolve(stubBrowser('bro')));
        const pool = makePool_();

        return pool.getBrowser('bro')
            .then((browser) => pool.freeBrowser(browser, {force: true}))
            .then(() => assert.calledOnce(underlyingPool.freeBrowser));
    });

    describe('when there is free browser with the same id', () => {
        let browser, pool;

        beforeEach(() => {
            browser = stubBrowser('bro');
            pool = makePool_();
            return pool.freeBrowser(browser);
        });

        it('should not create second instance', () => {
            return pool.getBrowser('bro')
                .then(() => assert.notCalled(underlyingPool.getBrowser));
        });

        it('should reset the browser', () => {
            return pool.getBrowser('bro')
                .then(() => assert.calledOnce(browser.reset));
        });

        describe('when reset failed', () => {
            it('should fail to get browser', () => {
                browser.reset.returns(Promise.reject('some-error'));
                return assert.isRejected(pool.getBrowser('bro'), /some-error/);
            });

            it('should put browser back', () => {
                browser.reset.returns(Promise.reject());

                return pool.getBrowser('bro')
                    .catch(() => assert.calledOnceWith(underlyingPool.freeBrowser, browser));
            });

            it('should keep original error if failed to put browser back', () => {
                browser.reset.returns(Promise.reject('reset-error'));
                underlyingPool.freeBrowser.returns(Promise.reject('free-error'));

                return assert.isRejected(pool.getBrowser('bro'), /reset-error/);
            });
        });
    });

    describe('when there are multiple browsers with same id', () => {
        let firstBrowser, secondBrowser, pool;

        beforeEach(() => {
            firstBrowser = stubBrowser('bro');
            secondBrowser = stubBrowser('bro');
            pool = makePool_();
            return Promise.all([
                pool.freeBrowser(firstBrowser),
                pool.freeBrowser(secondBrowser)
            ]);
        });

        it('should return last browser in cache on first getBrowser', () => {
            return assert.becomes(pool.getBrowser('bro'), secondBrowser);
        });

        it('should return first browser on second getBrowser', () => {
            return pool.getBrowser('bro')
                .then(() => assert.becomes(pool.getBrowser('bro'), firstBrowser));
        });

        it('should launch new session when there are no free browsers left', () => {
            return pool.getBrowser('bro')
                .then(() => pool.getBrowser('bro'))
                .then(() => pool.getBrowser('bro'))
                .then(() => assert.calledWith(underlyingPool.getBrowser, 'bro'));
        });
    });

    describe('when there is reuse limit', () => {
        const launchAndFree_ = (pool, id) => {
            return pool.getBrowser(id)
                .then((browser) => pool.freeBrowser(browser));
        };

        it('should launch only one session within the reuse limit', () => {
            underlyingPool.getBrowser.returns(Promise.resolve(stubBrowser('bro')));
            const pool = poolWithReuseLimits_({bro: 2});
            return launchAndFree_(pool, 'bro')
                .then(() => pool.getBrowser('bro'))
                .then(() => assert.calledOnce(underlyingPool.getBrowser));
        });

        it('should launch next session when over reuse limit', () => {
            underlyingPool.getBrowser
                .onFirstCall().returns(Promise.resolve(stubBrowser('bro')))
                .onSecondCall().returns(Promise.resolve(stubBrowser('bro')));
            const pool = poolWithReuseLimits_({bro: 2});
            return launchAndFree_(pool, 'bro')
                .then(() => launchAndFree_(pool, 'bro'))
                .then(() => pool.getBrowser('bro'))
                .then(() => assert.calledTwice(underlyingPool.getBrowser));
        });

        it('should get new session for each suite if reuse limit equal 1', () => {
            underlyingPool.getBrowser
                .onFirstCall().returns(Promise.resolve(stubBrowser('browserId')))
                .onSecondCall().returns(Promise.resolve(stubBrowser('browserId')));
            const pool = poolWithReuseLimits_({browserId: 1});
            return launchAndFree_(pool, 'browserId')
                .then(() => pool.getBrowser('browserId'))
                .then(() => assert.calledTwice(underlyingPool.getBrowser));
        });

        it('should close old session when reached reuse limit', () => {
            const browser = stubBrowser('bro');
            underlyingPool.getBrowser.returns(Promise.resolve(browser));
            const pool = poolWithReuseLimits_({bro: 2});
            return launchAndFree_(pool, 'bro')
                .then(() => launchAndFree_(pool, 'bro'))
                .then(() => assert.calledWith(underlyingPool.freeBrowser, browser));
        });

        it('should cache browser with different id even if the first one is over limit', () => {
            underlyingPool.getBrowser
                .withArgs('first').returns(Promise.resolve(stubBrowser('first')));

            const createSecondBrowser = underlyingPool.getBrowser.withArgs('second');
            createSecondBrowser.returns(Promise.resolve(stubBrowser('second')));

            const pool = poolWithReuseLimits_({
                first: 2,
                second: 2
            });
            return launchAndFree_(pool, 'first')
                .then(() => launchAndFree_(pool, 'second'))
                .then(() => launchAndFree_(pool, 'first'))
                .then(() => pool.getBrowser('second'))
                .then(() => assert.calledOnce(createSecondBrowser));
        });
    });

    describe('cancel', () => {
        it('should cancel an underlying pool', () => {
            const pool = makePool_();

            pool.cancel();

            assert.calledOnce(underlyingPool.cancel);
        });
    });
});
