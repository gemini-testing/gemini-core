'use strict';

const _ = require('lodash');

module.exports = class BaseStats {
    static create(...args) {
        return new this(...args);
    }

    constructor(statNames) {
        this._tests = {};
        this._retries = 0;
        this._statNames = statNames;

        const statValues = _.values(statNames);
        this._stats = _.zipObject(statValues, Array(statValues.length).fill(0));
    }

    addPassed(test) {
        this._addStat(this._statNames.PASSED, test);
    }

    addFailed(test) {
        this._addStat(this._statNames.FAILED, test);
    }

    addSkipped(test) {
        this._addStat(this._statNames.SKIPPED, test);
    }

    addRetries() {
        this._retries++;
    }

    _addStat(stat, test) {
        const key = `${this._buildSuiteKey(test)} ${this._buildStateKey(test)}`;
        const prevStat = this._tests[key];

        if (!prevStat) {
            this._tests[key] = stat;
            this._stats[stat]++;

            return;
        }

        if (prevStat !== stat) {
            this._stats[prevStat]--;
            this._stats[stat]++;
        }
    }

    _buildStateKey() {
        throw new Error('Method must be implemented in child classes');
    }

    _buildSuiteKey() {
        throw new Error('Method must be implemented in child classes');
    }

    getResult() {
        return _.extend(this._stats, {
            total: _.keys(this._tests).length,
            retries: this._retries
        });
    }
};
