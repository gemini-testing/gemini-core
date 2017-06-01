'use strict';

const Promise = require('bluebird');

exports.stubBrowser = function(id) {
    return {
        id: id || 'default-id',
        sessionId: process.hrtime().join('_'), // must be unique
        reset: sinon.stub().returns(Promise.resolve())
    };
};
