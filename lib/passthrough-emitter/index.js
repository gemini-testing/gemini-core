'use strict';

const _ = require('lodash');
const AsyncEmitter = require('../async-emitter');

module.exports = class PassthroughEmitter extends AsyncEmitter {

    // Allow to pass only one argument with event
    emit(event, data) {
        return super.emit(event, data);
    }

    emitAndWait(event, data) {
        return super.emitAndWait(event, data, {shouldWait: true});
    }

    /**
     * Emit event emitted by emitter
     * @param {EventEmitter} emitter
     * @param {String|String[]} event or array of events to passthrough
     */
    passthroughEvent(emitter, event) {
        if (_.isArray(event)) {
            event.forEach(this.passthroughEvent.bind(this, emitter));
            return;
        }

        emitter.on(event, (data, opts) => {
            if (opts && opts.shouldWait) {
                return this.emitAndWait(event, data);
            } else {
                this.emit(event, data);
            }
        });
    }
};
