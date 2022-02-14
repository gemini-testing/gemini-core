import _ from "lodash";

type StatNames<T extends string = 'passed' | 'failed' | 'skipped'> = Record<Uppercase<T>, Lowercase<T>>;

type Stats = { [StatName in StatNames[keyof StatNames]]: number };
type StatsResult = Stats & {
    total: number;
    retries: number;
};

export default class BaseStats {
    private _tests: Set<string>;
    private _retries: number;
    private _statNames: StatNames;
    private _stats: Stats;

    public static create(statNames: StatNames): BaseStats {
        return new this(statNames);
    }

    constructor(statNames: StatNames) {
        this._tests = new Set();
        this._retries = 0;
        this._statNames = statNames;

        this._stats = this._fillEmptyStats();
    }

    public addPassed(test: unknown) {
        this._addStat(this._statNames.PASSED, test);
    }

    public addFailed(test: unknown) {
        this._addStat(this._statNames.FAILED, test);
    }

    public addSkipped(test: unknown) {
        this._addStat(this._statNames.SKIPPED, test);
    }

    public addRetries() {
        this._retries++;
    }

    private _addStat(stat: StatNames[keyof StatNames], test: unknown, statsStorage = this._stats, testsStorage = this._tests) {
        const key = `${this._buildSuiteKey(test)} ${this._buildStateKey(test)}`;

        statsStorage[stat]++;
        testsStorage.add(key);
    }

    private _fillEmptyStats(): Stats {
        const statValues = _.values(this._statNames);

        return _.zipObject(statValues, Array(statValues.length).fill(0)) as Stats;
    }

    private _buildStateKey(_test: unknown): string {
        throw new Error('Method must be implemented in child classes');
    }

    private _buildSuiteKey(_test: unknown): string {
        throw new Error('Method must be implemented in child classes');
    }

    public getResult(): StatsResult {
        return _.extend(this._stats, {
            total: this._tests.size,
            retries: this._retries
        });
    }
};
