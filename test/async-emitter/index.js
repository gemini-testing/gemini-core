'use strict';

const AsyncEmitter = require('lib/async-emitter');
const Promise = require('bluebird');

describe('async-emitter', () => {
    let emitter;

    beforeEach(() => {
        emitter = new AsyncEmitter();
    });

    it('should wait until all promises from handler will be resolved', () => {
        const afterWait = sinon.spy().named('afterWait');
        const insideHandler1 = sinon.spy().named('insideHandler1');
        const insideHandler2 = sinon.spy().named('insideHandler2');

        emitter.on('event', () => Promise.delay(1).then(insideHandler1));
        emitter.on('event', () => Promise.delay(2).then(insideHandler2));

        return emitter.emitAndWait('event')
            .then(afterWait)
            .then(() => assert.callOrder(insideHandler1, insideHandler2, afterWait));
    });

    it('should the arguments except first', () => {
        const listener = sinon.spy().named('listener');

        emitter.on('event', listener);

        return emitter.emitAndWait('event', 'arg1', 'arg2')
            .then(() => assert.calledOnceWith(listener, 'arg1', 'arg2'));
    });
});
