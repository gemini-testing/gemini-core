const LinkedList = require('util/linkedList');

describe('LinkedList', () => {
    describe('Constructor', () => {
        const list = new LinkedList();

        it('Instance should have properties', () => {
            assert.deepEqual(Object.keys(list), ['head', 'tail', 'length']);
        });

        it('Instance head should be null', () => {
            assert.isNull(list.head);
        });

        it('Instance tail should be null', () => {
            assert.isNull(list.tail);
        });

        it('Instance length should be 0', () => {
            assert.equal(list.length, 0);
        });
    });

    describe('push', () => {
        let list;
        let data;

        describe('into empty list', () => {
            beforeEach(() => {
                data = 1;
                list = new LinkedList();
                list.push(data);
            });

            it('should set head', () => {
                assert.isNotNull(list.head);
                assert.isNull(list.head.next);
                assert.equal(list.head.value, 1);
            });

            it('should set tail', () => {
                assert.isNotNull(list.tail);
                assert.isNull(list.tail.next);
                assert.equal(list.tail.value, 1);
            });

            it('should update length', () => {
                assert.equal(list.length, 1);
            });
        });

        describe('into non empty list', () => {
            beforeEach(() => {
                const previousData = 1;
                list = new LinkedList();
                list.push(previousData);

                data = 2;
                list.push(data);
            });

            it('should set head next', () => {
                assert.isNotNull(list.head.next);
                assert.equal(list.head.value, 1);
            });

            it('should set tail', () => {
                assert.isNotNull(list.tail);
                assert.isNull(list.tail.next);
                assert.equal(list.tail.value, 2);
            });

            it('should update length', () => {
                assert.equal(list.length, 2);
            });
        });
    });

    describe('shift', () => {
        let list;
        let data;
        let elem;

        describe('on empty list', () => {
            beforeEach(() => {
                list = new LinkedList();
                elem = list.shift();
            });

            it('should return null', () => {
                assert.isNull(elem);
            });
        });

        describe('on list with single element', () => {
            beforeEach(() => {
                data = 1;
                list = new LinkedList();
                list.push(data);
                elem = list.shift();
            });

            it('should return head elem', () => {
                assert.equal(elem, data);
            });

            it('should null tail', () => {
                assert.isNull(list.tail);
            });

            it('should null head', () => {
                assert.isNull(list.head);
            });

            it('should decrement length', () => {
                assert.equal(list.length, 0);
            });
        });

        describe('on list with multiple elements', () => {
            let secondData;

            beforeEach(() => {
                data = 1;
                secondData = 2;
                list = new LinkedList();
                list.push(data);
                list.push(secondData);
                elem = list.shift();
            });

            it('should return head elem', () => {
                assert.equal(elem, data);
            });

            it('should not reassign tail', () => {
                assert.equal(list.tail.value, secondData);
                assert.isNull(list.tail.next);
            });

            it('should reassign head', () => {
                assert.equal(list.head.value, secondData);
                assert.isNull(list.head.next);
            });

            it('should decrement length', () => {
                assert.equal(list.length, 1);
            });
        });
    });
});
