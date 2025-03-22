function(module, exports, __webpack_require__) {
    "use strict";
    function ownKeys(object, enumerableOnly) {
        var keys = Object.keys(object);
        if (Object.getOwnPropertySymbols) {
            var symbols = Object.getOwnPropertySymbols(object);
            enumerableOnly && (symbols = symbols.filter((function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            }))), keys.push.apply(keys, symbols);
        }
        return keys;
    }
    function _defineProperty(obj, key, value) {
        return key in obj ? Object.defineProperty(obj, key, {
            value: value,
            enumerable: !0,
            configurable: !0,
            writable: !0
        }) : obj[key] = value, obj;
    }
    function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
            "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    var Buffer = __webpack_require__(10).Buffer, inspect = __webpack_require__(0).inspect, custom = inspect && inspect.custom || "inspect";
    module.exports = (function() {
        function BufferList() {
            !(function(instance, Constructor) {
                if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
            })(this, BufferList), this.head = null, this.tail = null, this.length = 0;
        }
        var Constructor, protoProps;
        return Constructor = BufferList, protoProps = [ {
            key: "push",
            value: function(v) {
                var entry = {
                    data: v,
                    next: null
                };
                this.length > 0 ? this.tail.next = entry : this.head = entry, this.tail = entry, 
                ++this.length;
            }
        }, {
            key: "unshift",
            value: function(v) {
                var entry = {
                    data: v,
                    next: this.head
                };
                0 === this.length && (this.tail = entry), this.head = entry, ++this.length;
            }
        }, {
            key: "shift",
            value: function() {
                if (0 !== this.length) {
                    var ret = this.head.data;
                    return 1 === this.length ? this.head = this.tail = null : this.head = this.head.next, 
                    --this.length, ret;
                }
            }
        }, {
            key: "clear",
            value: function() {
                this.head = this.tail = null, this.length = 0;
            }
        }, {
            key: "join",
            value: function(s) {
                if (0 === this.length) return "";
                for (var p = this.head, ret = "" + p.data; p = p.next; ) ret += s + p.data;
                return ret;
            }
        }, {
            key: "concat",
            value: function(n) {
                if (0 === this.length) return Buffer.alloc(0);
                for (var src, target, offset, ret = Buffer.allocUnsafe(n >>> 0), p = this.head, i = 0; p; ) src = p.data, 
                target = ret, offset = i, Buffer.prototype.copy.call(src, target, offset), i += p.data.length, 
                p = p.next;
                return ret;
            }
        }, {
            key: "consume",
            value: function(n, hasStrings) {
                var ret;
                return n < this.head.data.length ? (ret = this.head.data.slice(0, n), this.head.data = this.head.data.slice(n)) : ret = n === this.head.data.length ? this.shift() : hasStrings ? this._getString(n) : this._getBuffer(n), 
                ret;
            }
        }, {
            key: "first",
            value: function() {
                return this.head.data;
            }
        }, {
            key: "_getString",
            value: function(n) {
                var p = this.head, c = 1, ret = p.data;
                for (n -= ret.length; p = p.next; ) {
                    var str = p.data, nb = n > str.length ? str.length : n;
                    if (nb === str.length ? ret += str : ret += str.slice(0, n), 0 == (n -= nb)) {
                        nb === str.length ? (++c, p.next ? this.head = p.next : this.head = this.tail = null) : (this.head = p, 
                        p.data = str.slice(nb));
                        break;
                    }
                    ++c;
                }
                return this.length -= c, ret;
            }
        }, {
            key: "_getBuffer",
            value: function(n) {
                var ret = Buffer.allocUnsafe(n), p = this.head, c = 1;
                for (p.data.copy(ret), n -= p.data.length; p = p.next; ) {
                    var buf = p.data, nb = n > buf.length ? buf.length : n;
                    if (buf.copy(ret, ret.length - n, 0, nb), 0 == (n -= nb)) {
                        nb === buf.length ? (++c, p.next ? this.head = p.next : this.head = this.tail = null) : (this.head = p, 
                        p.data = buf.slice(nb));
                        break;
                    }
                    ++c;
                }
                return this.length -= c, ret;
            }
        }, {
            key: custom,
            value: function(_, options) {
                return inspect(this, (function(target) {
                    for (var i = 1; i < arguments.length; i++) {
                        var source = null != arguments[i] ? arguments[i] : {};
                        i % 2 ? ownKeys(Object(source), !0).forEach((function(key) {
                            _defineProperty(target, key, source[key]);
                        })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach((function(key) {
                            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
                        }));
                    }
                    return target;
                })({}, options, {
                    depth: 0,
                    customInspect: !1
                }));
            }
        } ], protoProps && _defineProperties(Constructor.prototype, protoProps), BufferList;
    })();
}
