function(module, exports) {
    function LruCache(size) {
        this.capacity = 0 | size, this.map = Object.create(null), this.list = new DoublyLinkedList;
    }
    function DoublyLinkedList() {
        this.firstNode = null, this.lastNode = null;
    }
    function DoublyLinkedNode(key, val) {
        this.key = key, this.val = val, this.prev = null, this.next = null;
    }
    module.exports = function(size) {
        return new LruCache(size);
    }, LruCache.prototype.get = function(key) {
        var node = this.map[key];
        if (null != node) return this.used(node), node.val;
    }, LruCache.prototype.set = function(key, val) {
        var node = this.map[key];
        if (null != node) node.val = val; else {
            if (this.capacity || this.prune(), !this.capacity) return !1;
            node = new DoublyLinkedNode(key, val), this.map[key] = node, this.capacity--;
        }
        return this.used(node), !0;
    }, LruCache.prototype.used = function(node) {
        this.list.moveToFront(node);
    }, LruCache.prototype.prune = function() {
        var node = this.list.pop();
        null != node && (delete this.map[node.key], this.capacity++);
    }, DoublyLinkedList.prototype.moveToFront = function(node) {
        this.firstNode != node && (this.remove(node), null == this.firstNode ? (this.firstNode = node, 
        this.lastNode = node, node.prev = null, node.next = null) : (node.prev = null, node.next = this.firstNode, 
        node.next.prev = node, this.firstNode = node));
    }, DoublyLinkedList.prototype.pop = function() {
        var lastNode = this.lastNode;
        return null != lastNode && this.remove(lastNode), lastNode;
    }, DoublyLinkedList.prototype.remove = function(node) {
        this.firstNode == node ? this.firstNode = node.next : null != node.prev && (node.prev.next = node.next), 
        this.lastNode == node ? this.lastNode = node.prev : null != node.next && (node.next.prev = node.prev);
    };
}
