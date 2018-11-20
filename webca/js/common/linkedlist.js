
function LinkedList() {
	this.firstNode = null;
	this.lastNode = null;
	this.insertAfter = linkedlist_insertAfter;
	this.insertBefore = linkedlist_insertBefore;
	this.insertBeginning = linkedlist_insertBeginning;
	this.insertEnd = linkedlist_insertEnd;
	this.remove = linkedlist_remove;
}

function linkedlist_insertAfter(node, newNode) {
	newNode.prev = node;
	newNode.next = node.next;

	if (node.next == null) {
		this.lastNode = newNode;
	}
	else {
		node.next.prev = newNode;
	}
	node.next = newNode;
}

function linkedlist_insertBefore(node, newNode) {
	newNode.prev = node.prev;
	newNode.next = node;

	if (node.prev == null) {
		this.firstNode = newNode;
	}
	else {
		node.prev.next = newNode;
	}
	node.prev = newNode;
}

function linkedlist_insertBeginning(newNode) {
	if (this.firstNode == null) {
		this.firstNode = newNode;
		this.lastNode  = newNode;
		newNode.prev = null;
		newNode.next = null;
	}
	else {
		this.insertBefore(this.firstNode, newNode);
	}
}

function linkedlist_insertEnd(newNode) {
	if (this.lastNode == null) {
		this.insertBeginning(newNode);
	}
	else {
		this.insertAfter(this.lastNode, newNode);
	}
}

function linkedlist_remove(node) {
	if (node.prev == null) {
		this.firstNode = node.next;
	}
	else {
		node.prev.next = node.next;
	}

	if (node.next == null) {
		this.lastNode = node.prev;
	}
	else {
		node.next.prev = node.prev;
	}

	delete node;
}