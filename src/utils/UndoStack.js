class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
    this.prev = null;
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