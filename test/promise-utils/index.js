'use strict';

const Promise = require('bluebird');
const utils = require('lib/promise-utils');

describe('promise-utils', () => {
    describe('waitForResults', () => {
        it('should return fulfilled promise if no promises passed', () => {
            return assert.isFulfilled(utils.waitForResults([]));
        });

        it('should wait until all promises resolved', function() {
            const first = Promise.delay(10);
            const second = Promise.delay(20);

            return utils.waitForResults([first, second])
                .then(() => assert.isFulfilled(first))
                .then(() => assert.isFulfilled(second));
        });

        it('should reject if any of passed promises rejected', function() {
            const resolved = Promise.resolve();
            const rejected1 = Promise.reject('foo');
            const rejected2 = Promise.reject('bar');

            return assert.isRejected(utils.waitForResults([resolved, rejected1, rejected2]), /foo/);
        });

        it('should not immediately reject when any of promises is rejected', function() {
            const first = Promise.reject();
            const second = Promise.delay(10);

            return utils.waitForResults([first, second])
                .catch(() => {
                    assert.equal(first.isRejected(), true);
                    assert.equal(second.isFulfilled(), true);
                });
        });
    });
});
