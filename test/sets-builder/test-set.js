'use strict';

const fs = require('fs');
const TestSet = require('../../lib/sets-builder/test-set');

describe('TestSet', () => {
    const sandbox = sinon.sandbox.create();

    afterEach(() => sandbox.restore());

    it('should return all set files', () => {
        const set = TestSet.create({
            files: ['some/path/file.js']
        });

        assert.deepEqual(set.getFiles(), ['some/path/file.js']);
    });

    it('should return all set browsers', () => {
        const set = TestSet.create({browsers: ['bro1', 'bro2']});

        assert.deepEqual(set.getBrowsers(), ['bro1', 'bro2']);
    });

    describe('getBrowsersForFile', () => {
        it('should return all browsers for file', () => {
            const set = TestSet.create({
                files: ['some/path/file.js'],
                browsers: ['bro1', 'bro2']
            });
            const browsers = set.getBrowsersForFile('some/path/file.js');

            assert.deepEqual(browsers, ['bro1', 'bro2']);
        });

        it('should return empty array if no such file in the set', () => {
            const set = TestSet.create({
                files: ['some/path/file.js'],
                browsers: ['bro1', 'bro2']
            });
            const browsers = set.getBrowsersForFile('other/path/file1.js');

            assert.deepEqual(browsers, []);
        });
    });

    describe('getFilesForBrowser', () => {
        it('should return all files for browser', () => {
            const set = TestSet.create({
                files: ['some/path/file.js'],
                browsers: ['bro1']
            });
            const files = set.getFilesForBrowser('bro1');

            assert.deepEqual(files, ['some/path/file.js']);
        });

        it('should return empty array if no such browser in the set', () => {
            const set = TestSet.create({
                files: ['some/path/file.js'],
                browsers: ['bro1']
            });
            const files = set.getFilesForBrowser('bro2');

            assert.deepEqual(files, []);
        });
    });

    describe('useFiles', () => {
        it('should return intersection of set files and passed files', () =>{
            const set = TestSet.create({
                files: ['some/path/file.js'],
                browsers: ['bro1', 'bro2']
            });
            set.useFiles(['some/path/file.js', 'some/path/file2.js']);

            assert.deepEqual(set.getFiles(), ['some/path/file.js']);
        });

        it('should return passed files if there are no files in a set', () => {
            const set = TestSet.create({files: []});
            set.useFiles(['some/path/file.js']);

            assert.deepEqual(set.getFiles(), ['some/path/file.js']);
        });

        it('should use set files if passed files are empty', () => {
            const set = TestSet.create({files: ['some/path/file.js']});
            set.useFiles([]);

            assert.deepEqual(set.getFiles(), ['some/path/file.js']);
        });

        it('should use passed files if set files contain masks and files', () => {
            const set = TestSet.create({files: ['some/path/*.hermione.js', 'some/path/test1.hermione.js']});
            set.useFiles(['some/path/test2.hermione.js']);

            assert.deepEqual(set.getFiles(), ['some/path/test2.hermione.js']);
        });

        it('should use matched files with masks specified in the set', () => {
            const set = TestSet.create({files: ['some/*/*.js']});

            set.useFiles(['some/path/file.js', 'another/path/file2.js']);

            assert.deepEqual(set.getFiles(), ['some/path/file.js']);
        });
    });

    describe('useBrowsers', () => {
        it('should use set browsers if browsers are not specified', () => {
            const set = TestSet.create({browsers: ['bro1']});

            set.useBrowsers();

            assert.deepEqual(set.getBrowsers(), ['bro1']);
        });

        it('should use intersection of set browsers and specified browsers', () => {
            const set = TestSet.create({browsers: ['bro1', 'bro2']});

            set.useBrowsers(['bro2', 'bro3']);

            assert.deepEqual(set.getBrowsers(), ['bro2']);
        });
    });

    describe('transformDirsToMasks', () => {
        beforeEach(() => sandbox.stub(fs, 'stat'));

        it('should transform set paths to masks if paths are directories', () => {
            fs.stat.yields(null, {isDirectory: () => true});
            const set = TestSet.create({files: ['some/path']});

            return set.transformDirsToMasks()
                .then(() => assert.deepEqual(set.getFiles(), ['some/path/**']));
        });

        it('should not transform set paths to masks if paths are already masks', () => {
            const set = TestSet.create({files: ['some/path/*.js']});

            return set.transformDirsToMasks()
                .then(() => assert.deepEqual(set.getFiles(), ['some/path/*.js']));
        });

        it('should not transform set paths to masks if paths are files', () => {
            fs.stat.yields(null, {isDirectory: () => false});
            const set = TestSet.create({files: ['some/path/file.js']});

            return set.transformDirsToMasks()
                .then(() => assert.deepEqual(set.getFiles(), ['some/path/file.js']));
        });

        it('should throw an error if passed path does not exist', () => {
            fs.stat.throws(new Error);

            const set = TestSet.create({files: ['some/error/file.js']});

            return assert.isRejected(set.transformDirsToMasks(), /Cannot read such file or directory: 'some\/error\/file.js'/)
                .then(() => assert.deepEqual(set.getFiles(), ['some/error/file.js']));
        });
    });
});
