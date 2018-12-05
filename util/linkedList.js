class Node {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

class LinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    push(value) {
        const node = new Node(value);

        if (this.head === null) {
            this.head = this.tail = node;
            this.length++;
            return;
        }

        this.tail.next = node;
        this.tail = node;
        this.length++;
    }

    clear() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    forEach(cb) {
        let node = this.head;

        while (node) {
            cb(node.value);

            node = node.next;
        }
    }

    shift() {
        if (this.head) {
            const value = this.head.value;

            if (this.head.next) {
                this.head = this.head.next;
                this.length--;
            } else {
                this.clear();
            }

            return value;
        }

        return null;
    }
}

module.exports = LinkedList;
