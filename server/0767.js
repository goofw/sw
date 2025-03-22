function(module, exports) {
    var Node = function(list, val) {
        this.prev = this.next = this, this.value = val, this.list = list;
    };
    Node.prototype.link = function(next) {
        return this.next = next, next.prev = this, next;
    };
    var FIFO = function() {
        if (!(this instanceof FIFO)) return new FIFO;
        this.node = null, this.length = 0;
    };
    FIFO.prototype.set = function(node, value) {
        return node && node.list === this ? (node.value = value, node) : null;
    }, FIFO.prototype.get = function(node) {
        return node && node.list === this ? node.value : null;
    }, FIFO.prototype.remove = function(node) {
        return node && node.list === this ? (this.length--, node.list = null, node.prev.link(node.next), 
        node === this.node && (this.node = node.next === node ? null : node.next), node.value) : null;
    }, FIFO.prototype.unshift = function(value) {
        return this.node = this.push(value);
    }, FIFO.prototype.push = function(value) {
        var node = new Node(this, value);
        return this.length++, this.node ? (this.node.prev.link(node), node.link(this.node), 
        node) : this.node = node;
    }, FIFO.prototype.first = function() {
        return this.node && this.node.value;
    }, FIFO.prototype.last = function() {
        return this.node && this.node.prev.value;
    }, FIFO.prototype.shift = function() {
        return this.node && this.remove(this.node);
    }, FIFO.prototype.pop = function() {
        return this.node && this.remove(this.node.prev);
    }, module.exports = FIFO;
}
