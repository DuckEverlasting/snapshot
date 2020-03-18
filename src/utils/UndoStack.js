class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
    this.prev = null;
  }
}

class LinkedPair {
  constructor(key, value, next=null) {
    this.key = key;
    this.value = value;
    this.next = next;
  }
}

export default class UndoStack {
  constructor(initNode=null) {
    this.current = initNode;
  }

  add(data) {
    const node = new Node(data)
    node.prev = this.current;
    this.current.next = node;
    this.current = node;
  }

  undo() {
    if (!this.current || !this.current.prev) {
      return
    }
    const data = this.current.data;
    this.current = this.current.prev;
    return data;
  }

  redo() {
    if (!this.current || !this.current.next) {
      return
    }
    const data = this.current.next.data;
    this.current = this.current.next;
    return data;
  }
}

class HashTable {
  constructor() {
    this.storage = new Array(8);
  }

  hash(key) {

  }

  get(key) {
    const hashedKey = this.hash(key);
    let current = this.storage[hashedKey % this.storage.length];
    while (current !== null) {
      if (current.key === key) {
        return current.value;
      }
      current = current.next;
    }
    throw new Error(`Key "${key}" not in hashtable`)
  }

  set(key, value) {
    const hashedKey = this.hash(key);
    let prev;
    let current = this.storage[hashedKey % this.storage.length];
    while (current !== null) {
      if (current.key === key) {
        current.value = value;
        return;
      }
      prev = current;
      current = current.next;
    };
    prev.next = new LinkedPair(key, value)
  }
}

class ListNode {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

// LIST A: 1 => 4 => 7 => 9
// LIST B: 3 => 5 => 8 => 11

/*

pointerA = smallest head

pointerB = largest head

let head = pointerA;

nextB = pointerB.next

if pointerB < pointerA.next:
  pointerB.next = pointerA.next
  pointerA.next = pointerB
  pointerB = nextB
  pointerA = pointerB
else pointerB > pointerA.next:
  pointerA = pointerA.next

*/