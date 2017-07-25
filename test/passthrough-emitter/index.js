'use strict';

const PassthroughEmitter = require('lib/passthrough-emitter');

describe('PassthroughEmitter', () => {
    let runner;
    let child;

    beforeEach(function() {
        runner = new PassthroughEmitter();
        child = new PassthroughEmitter();
    });

    it('should emit event emitted by child', () => {
        const onSomeEvent = sinon.spy();

        runner.on('some-event', onSomeEvent);
        runner.passthroughEvent(child, 'some-event');

        child.emit('some-event', 'some-data');

        assert.calledOnceWith(onSomeEvent, 'some-data');
    });

    it('should emit all events emitted by child', () => {
        let onSomeEvent = sinon.spy();
        let onOtherEvent = sinon.spy();

        runner.on('event1', onSomeEvent);
        runner.on('event2', onOtherEvent);
        runner.passthroughEvent(child, ['event1', 'event2']);

        child.emit('event1', 'some-data');
        child.emit('event2', 'other-data');

        assert.calledOnceWith(onSomeEvent, 'some-data');
        assert.calledOnceWith(onOtherEvent, 'other-data');
    });

    it('should not break promise chain on event emitted by "emitAndWait"', () => {
        runner.passthroughEvent(child, 'some-event');
        runner.on('some-event', () => 'some-data');

        return child.emitAndWait('some-event')
            .then((data) => assert.equal(data, 'some-data'));
    });
});
