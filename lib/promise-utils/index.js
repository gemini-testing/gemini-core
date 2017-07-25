'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

// Waits for all promises in array to be resolved or rejected.
// If any promise is rejected - rejects with the first rejection error, otherwise resolves.
exports.waitForResults = function(promises) {
    return Promise.all(promises.map((p) => p.reflect()))
        .then((results) => {
            const rejected = _.find(results, (r) => r.isRejected());
            return rejected ? Promise.reject(rejected.reason()) : Promise.resolve();
        });
};
