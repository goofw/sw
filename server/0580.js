function(module, exports, __webpack_require__) {
    "use strict";
    var randomBytes = __webpack_require__(113), EventEmitter = __webpack_require__(5).EventEmitter, inherits = __webpack_require__(6);
    function arrayEquals(array1, array2) {
        if (array1 === array2) return !0;
        if (array1.length !== array2.length) return !1;
        for (var i = 0, length = array1.length; i < length; ++i) if (array1[i] !== array2[i]) return !1;
        return !0;
    }
    function KBucket(options) {
        if (EventEmitter.call(this), options = options || {}, this.localNodeId = options.localNodeId || randomBytes(20), 
        !(this.localNodeId instanceof Uint8Array)) throw new TypeError("localNodeId is not a Uint8Array");
        this.numberOfNodesPerKBucket = options.numberOfNodesPerKBucket || 20, this.numberOfNodesToPing = options.numberOfNodesToPing || 3, 
        this.distance = options.distance || KBucket.distance, this.arbiter = options.arbiter || KBucket.arbiter, 
        this.root = {
            contacts: [],
            dontSplit: !1,
            left: null,
            right: null
        }, this.metadata = Object.assign({}, options.metadata);
    }
    module.exports = KBucket, inherits(KBucket, EventEmitter), KBucket.arbiter = function(incumbent, candidate) {
        return incumbent.vectorClock > candidate.vectorClock ? incumbent : candidate;
    }, KBucket.distance = function(firstId, secondId) {
        for (var distance = 0, min = Math.min(firstId.length, secondId.length), max = Math.max(firstId.length, secondId.length), i = 0; i < min; ++i) distance = 256 * distance + (firstId[i] ^ secondId[i]);
        for (;i < max; ++i) distance = 256 * distance + 255;
        return distance;
    }, KBucket.prototype.add = function(contact) {
        if (!(contact && contact.id instanceof Uint8Array)) throw new TypeError("contact.id is not a Uint8Array");
        for (var bitIndex = 0, node = this.root; null === node.contacts; ) node = this._determineNode(node, contact.id, bitIndex++);
        var index = this._indexOf(node, contact.id);
        return index >= 0 ? (this._update(node, index, contact), this) : node.contacts.length < this.numberOfNodesPerKBucket ? (node.contacts.push(contact), 
        this.emit("added", contact), this) : node.dontSplit ? (this.emit("ping", node.contacts.slice(0, this.numberOfNodesToPing), contact), 
        this) : (this._split(node, bitIndex), this.add(contact));
    }, KBucket.prototype.closest = function(id, n) {
        if (!(id instanceof Uint8Array)) throw new TypeError("id is not a Uint8Array");
        if (void 0 === n && (n = 1 / 0), "number" != typeof n || isNaN(n) || n <= 0) throw new TypeError("n is not positive number");
        for (var contacts = [], nodes = [ this.root ], bitIndex = 0; nodes.length > 0 && contacts.length < n; ) {
            var node = nodes.pop();
            if (null === node.contacts) {
                var detNode = this._determineNode(node, id, bitIndex++);
                nodes.push(node.left === detNode ? node.right : node.left), nodes.push(detNode);
            } else contacts = contacts.concat(node.contacts);
        }
        var self = this;
        return contacts.map((function(a) {
            return [ self.distance(a.id, id), a ];
        })).sort((function(a, b) {
            return a[0] - b[0];
        })).slice(0, n).map((function(a) {
            return a[1];
        }));
    }, KBucket.prototype.count = function() {
        for (var count = 0, nodes = [ this.root ]; nodes.length > 0; ) {
            var node = nodes.pop();
            null === node.contacts ? nodes.push(node.right, node.left) : count += node.contacts.length;
        }
        return count;
    }, KBucket.prototype._determineNode = function(node, id, bitIndex) {
        var bytesDescribedByBitIndex = ~~(bitIndex / 8), bitIndexWithinByte = bitIndex % 8;
        return id.length <= bytesDescribedByBitIndex && 0 !== bitIndexWithinByte ? node.left : id[bytesDescribedByBitIndex] & Math.pow(2, 7 - bitIndexWithinByte) ? node.right : node.left;
    }, KBucket.prototype.get = function(id) {
        if (!(id instanceof Uint8Array)) throw new TypeError("id is not a Uint8Array");
        for (var bitIndex = 0, node = this.root; null === node.contacts; ) node = this._determineNode(node, id, bitIndex++);
        var index = this._indexOf(node, id);
        return index >= 0 ? node.contacts[index] : null;
    }, KBucket.prototype._indexOf = function(node, id) {
        for (var i = 0; i < node.contacts.length; ++i) if (arrayEquals(node.contacts[i].id, id)) return i;
        return -1;
    }, KBucket.prototype.remove = function(id) {
        if (!(id instanceof Uint8Array)) throw new TypeError("id is not a Uint8Array");
        for (var bitIndex = 0, node = this.root; null === node.contacts; ) node = this._determineNode(node, id, bitIndex++);
        var index = this._indexOf(node, id);
        if (index >= 0) {
            var contact = node.contacts.splice(index, 1)[0];
            this.emit("removed", contact);
        }
        return this;
    }, KBucket.prototype._split = function(node, bitIndex) {
        node.left = {
            contacts: [],
            dontSplit: !1,
            left: null,
            right: null
        }, node.right = {
            contacts: [],
            dontSplit: !1,
            left: null,
            right: null
        };
        for (var i = 0; i < node.contacts.length; ++i) {
            var contact = node.contacts[i];
            this._determineNode(node, contact.id, bitIndex).contacts.push(contact);
        }
        node.contacts = null;
        var detNode = this._determineNode(node, this.localNodeId, bitIndex);
        (node.left === detNode ? node.right : node.left).dontSplit = !0;
    }, KBucket.prototype.toArray = function() {
        for (var result = [], nodes = [ this.root ]; nodes.length > 0; ) {
            var node = nodes.pop();
            null === node.contacts ? nodes.push(node.right, node.left) : result = result.concat(node.contacts);
        }
        return result;
    }, KBucket.prototype._update = function(node, index, contact) {
        if (!arrayEquals(node.contacts[index].id, contact.id)) throw new Error("wrong index for _update");
        var incumbent = node.contacts[index], selection = this.arbiter(incumbent, contact);
        selection === incumbent && incumbent !== contact || (node.contacts.splice(index, 1), 
        node.contacts.push(selection), this.emit("updated", incumbent, selection));
    };
}
