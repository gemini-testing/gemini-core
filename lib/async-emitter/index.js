'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const EventEmitter = require('events').EventEmitter;

module.exports = class AsyncEmitter extends EventEmitter {
    emitAndWait(event) {
        const args = _.tail(arguments);
        const listeners = this.listeners(event);

        return Promise.all(listeners.map((l) => l.apply(this, args)));
    }
};
