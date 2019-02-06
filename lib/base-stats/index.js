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

        this._stats = this._fillEmptyStats();
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
        this._addStatOnce(stat, test, this._stats, this._tests);
    }

    _addStatOnce(stat, test, statsStorage, testsStorage) {
        const key = `${this._buildSuiteKey(test)} ${this._buildStateKey(test)}`;
        const prevStat = testsStorage[key];

        if (!prevStat) {
            testsStorage[key] = stat;
            statsStorage[stat]++;

            return;
        }

        if (prevStat !== stat) {
            statsStorage[prevStat]--;
            statsStorage[stat]++;
        }
    }

    _fillEmptyStats() {
        const statValues = _.values(this._statNames);

        return _.zipObject(statValues, Array(statValues.length).fill(0));
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
