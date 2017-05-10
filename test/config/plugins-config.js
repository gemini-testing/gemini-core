'use strict';

const parseConfig = require('../../lib/config/plugins-config');

describe('pluginsConfig', () => {
    const defaults = {
        ENV_PREFIX: 'some_prefix_',
        PATH: 'some/path'
    };

    afterEach(() => delete process.env[defaults.ENV_PREFIX]);

    it('should be enabled by default', () => {
        assert.equal(parseConfig({}, defaults).enabled, true);
    });

    it('should use path by default from passed defaults object', () => {
        assert.equal(parseConfig({}, defaults).path, 'some/path');
    });

    describe('plugin file path', () => {
        it('should set from configuration file', () => {
            const config = parseConfig({path: 'config/path'});

            assert.equal(config.path, 'config/path');
        });

        it('should set from environment variable', () => {
            process.env['some_prefix_path'] = 'env/path';

            assert.equal(parseConfig({}, defaults).path, 'env/path');
        });
    });
});
