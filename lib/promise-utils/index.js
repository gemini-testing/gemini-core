'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

exports.waitForResults = function(promises) {
    return Promise.all(promises.map((p) => p.reflect()))
        .then((results) => {
            const rejected = _.find(results, (r) => r.isRejected());
            return rejected ? Promise.reject(rejected.reason()) : Promise.resolve();
        });
};
