'use strict';

const Promise = require('bluebird');

exports.waitForResults = function(promises) {
    return Promise.all(promises.map((p) => p.reflect()))
        .call('find', (res) => res.isRejected())
        .then((rejected) => rejected ? Promise.reject(rejected.reason()) : Promise.resolve());
};
