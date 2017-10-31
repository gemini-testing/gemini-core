'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

exports.waitForResults = (promises) => {
    return Promise.all(promises.map((p) => p.reflect()))
        .then((res) => {
            // Заменить _.find на нативный после переезда gemini-covergae и glob-extra на bluebird
            const firstRejection = _.find(res, (v) => v.isRejected());

            return firstRejection ? Promise.reject(firstRejection.reason()) : res.map((r) => r.value());
        });
};
