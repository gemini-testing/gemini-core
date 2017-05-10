'use strict';

const _ = require('lodash');
const configParser = require('gemini-configparser');

const root = configParser.root;
const section = configParser.section;
const option = configParser.option;

const getParser = (defaults) => {
    return root(section({
        enabled: option({
            defaultValue: true,
            parseEnv: JSON.parse,
            validate: _.isBoolean
        }),
        path: option({
            defaultValue: defaults.PATH || '',
            validate: _.isString
        })
    }), {envPrefix: defaults.ENV_PREFIX || ''});
};

module.exports = (options, defaults) => {
    const env = process.env;
    const argv = process.argv;

    return getParser(defaults || {})({options, env, argv});
};
