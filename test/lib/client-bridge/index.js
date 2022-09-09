'use strict';

const proxyquire = require('proxyquire');
const ClientBridge = require('lib/client-bridge/client-bridge');

describe('clientBridge', () => {
    const sandbox = sinon.sandbox.create();

    let clientBridge, browserify, script;

    beforeEach(() => {
        script = {
            exclude: sandbox.stub(),
            transform: sandbox.stub(),
            bundle: sinon.stub().yields(null, Buffer.from('scripts', 'utf-8'))
        };

        browserify = sandbox.stub().returns(script);

        clientBridge = proxyquire('lib/client-bridge', {browserify});

        sandbox.stub(ClientBridge, 'create');
    });

    afterEach(() => sandbox.restore());

    describe('build', () => {
        it('should browserify client scripts', () => {
            return clientBridge.build()
                .then(() => assert.calledOnceWith(browserify, sinon.match({entries: './index', basedir: sinon.match(/browser\/client-scripts/)})));
        });

        it('should exclude coverage client script if coverage is disabled', () => {
            return clientBridge.build(null, {coverage: false})
                .then(() => assert.calledOnceWith(script.exclude, './index.coverage'));
        });

        it('should not exclude coverage client script if coverage is enabled', () => {
            return clientBridge.build(null, {coverage: true})
                .then(() => assert.notCalled(script.exclude));
        });

        it('should transform client scripts', () => {
            return clientBridge.build()
                .then(() => {
                    assert.calledWith(script.transform, {
                        sourceMap: false,
                        global: true,
                        ie8: true
                    }, 'uglifyify');
                });
        });

        it('should transform client scripts after excluding of a coverage client script', () => {
            return clientBridge.build(null, {coverage: false})
                .then(() => assert.callOrder(script.exclude, script.transform));
        });

        it('should transform client scripts using native library', () => {
            return clientBridge.build(null, {calibration: {needsCompatLib: false}})
                .then(() => {
                    assert.calledWith(script.transform, sinon.match({
                        aliases: {
                            './lib': {relative: './lib.native.js'}
                        },
                        verbose: false
                    }));
                });
        });

        it('should transform client scripts using compat library', () => {
            return clientBridge.build(null, {calibration: {needsCompatLib: true}})
                .then(() => {
                    assert.calledWith(script.transform, sinon.match({
                        aliases: {
                            './lib': {relative: './lib.compat.js'}
                        },
                        verbose: false
                    }));
                });
        });

        it('should transform client scripts NOT for deprecated mode', () => {
            return clientBridge.build(null, {supportDeprecated: false})
                .then(() => {
                    assert.calledWith(script.transform, sinon.match({
                        aliases: {
                            './ignore-areas': {relative: './ignore-areas.js'}
                        },
                        verbose: false
                    }));
                });
        });

        it('should transform client scripts for deprecated mode', () => {
            return clientBridge.build(null, {supportDeprecated: true})
                .then(() => {
                    assert.calledWith(script.transform, sinon.match({
                        aliases: {
                            './ignore-areas': {relative: './ignore-areas.deprecated.js'}
                        },
                        verbose: false
                    }));
                });
        });

        it('should create client bridge instance', () => {
            script.bundle.yields(null, Buffer.from('foo bar script', 'utf-8'));

            ClientBridge.create.withArgs({some: 'browser'}, 'foo bar script').returns({client: 'bridge'});

            return assert.becomes(clientBridge.build({some: 'browser'}), {client: 'bridge'});
        });
    });
});
