'use strict';

const level = require('build/lib/coverage/coverage-level');

describe('coverage level', () => {
    describe('merge', () => {
        it('NONE + NONE should equal NONE', () => {
            assert.equal(level.merge(level.NONE, level.NONE), level.NONE);
        });

        it('NONE + PARTIAL should equal PARTIAL', () => {
            assert.equal(level.merge(level.NONE, level.PARTIAL), level.PARTIAL);
        });

        it('PARTIAL + NONE should equal PARTIAL', () => {
            assert.equal(level.merge(level.PARTIAL, level.NONE), level.PARTIAL);
        });

        it('NONE + FULL should equal FULL', () => {
            assert.equal(level.merge(level.NONE, level.FULL), level.FULL);
        });

        it('FULL + NONE should equal FULL', () => {
            assert.equal(level.merge(level.FULL, level.NONE), level.FULL);
        });

        it('PARTIAL + FULL should equal FULL', () => {
            assert.equal(level.merge(level.PARTIAL, level.FULL), level.FULL);
        });

        it('FULL + PARTIAL should equal FULL', () => {
            assert.equal(level.merge(level.FULL, level.PARTIAL), level.FULL);
        });

        it('FULL + FULL should equal FULL', () => {
            assert.equal(level.merge(level.FULL, level.FULL), level.FULL);
        });
    });
});
