function(module, exports, __webpack_require__) {
    var events = __webpack_require__(5), inherits = __webpack_require__(6);
    function LRU(opts) {
        if (!(this instanceof LRU)) return new LRU(opts);
        "number" == typeof opts && (opts = {
            max: opts
        }), opts || (opts = {}), events.EventEmitter.call(this), this.cache = {}, this.head = this.tail = null, 
        this.length = 0, this.max = opts.max || 1e3, this.maxAge = opts.maxAge || 0;
    }
    module.exports = LRU, inherits(LRU, events.EventEmitter), Object.defineProperty(LRU.prototype, "keys", {
        get: function() {
            return Object.keys(this.cache);
        }
    }), LRU.prototype.clear = function() {
        this.cache = {}, this.head = this.tail = null, this.length = 0;
    }, LRU.prototype.remove = function(key) {
        if ("string" != typeof key && (key = "" + key), this.cache.hasOwnProperty(key)) {
            var element = this.cache[key];
            return delete this.cache[key], this._unlink(key, element.prev, element.next), element.value;
        }
    }, LRU.prototype._unlink = function(key, prev, next) {
        this.length--, 0 === this.length ? this.head = this.tail = null : this.head === key ? (this.head = prev, 
        this.cache[this.head].next = null) : this.tail === key ? (this.tail = next, this.cache[this.tail].prev = null) : (this.cache[prev].next = next, 
        this.cache[next].prev = prev);
    }, LRU.prototype.peek = function(key) {
        if (this.cache.hasOwnProperty(key)) {
            var element = this.cache[key];
            if (this._checkAge(key, element)) return element.value;
        }
    }, LRU.prototype.set = function(key, value) {
        var element;
        if ("string" != typeof key && (key = "" + key), this.cache.hasOwnProperty(key)) {
            if ((element = this.cache[key]).value = value, this.maxAge && (element.modified = Date.now()), 
            key === this.head) return value;
            this._unlink(key, element.prev, element.next);
        } else element = {
            value: value,
            modified: 0,
            next: null,
            prev: null
        }, this.maxAge && (element.modified = Date.now()), this.cache[key] = element, this.length === this.max && this.evict();
        return this.length++, element.next = null, element.prev = this.head, this.head && (this.cache[this.head].next = key), 
        this.head = key, this.tail || (this.tail = key), value;
    }, LRU.prototype._checkAge = function(key, element) {
        return !(this.maxAge && Date.now() - element.modified > this.maxAge && (this.remove(key), 
        this.emit("evict", {
            key: key,
            value: element.value
        }), 1));
    }, LRU.prototype.get = function(key) {
        if ("string" != typeof key && (key = "" + key), this.cache.hasOwnProperty(key)) {
            var element = this.cache[key];
            if (this._checkAge(key, element)) return this.head !== key && (key === this.tail ? (this.tail = element.next, 
            this.cache[this.tail].prev = null) : this.cache[element.prev].next = element.next, 
            this.cache[element.next].prev = element.prev, this.cache[this.head].next = key, 
            element.prev = this.head, element.next = null, this.head = key), element.value;
        }
    }, LRU.prototype.evict = function() {
        if (this.tail) {
            var key = this.tail, value = this.remove(this.tail);
            this.emit("evict", {
                key: key,
                value: value
            });
        }
    };
}
