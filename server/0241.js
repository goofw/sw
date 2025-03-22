function(module, exports, __webpack_require__) {
    var Chainsaw = __webpack_require__(1152), EventEmitter = __webpack_require__(5).EventEmitter, Buffers = __webpack_require__(1154), Vars = __webpack_require__(1155), Stream = __webpack_require__(3).Stream;
    function decodeLEu(bytes) {
        for (var acc = 0, i = 0; i < bytes.length; i++) acc += Math.pow(256, i) * bytes[i];
        return acc;
    }
    function decodeBEu(bytes) {
        for (var acc = 0, i = 0; i < bytes.length; i++) acc += Math.pow(256, bytes.length - i - 1) * bytes[i];
        return acc;
    }
    function decodeBEs(bytes) {
        var val = decodeBEu(bytes);
        return 128 == (128 & bytes[0]) && (val -= Math.pow(256, bytes.length)), val;
    }
    function decodeLEs(bytes) {
        var val = decodeLEu(bytes);
        return 128 == (128 & bytes[bytes.length - 1]) && (val -= Math.pow(256, bytes.length)), 
        val;
    }
    function words(decode) {
        var self = {};
        return [ 1, 2, 4, 8 ].forEach((function(bytes) {
            var bits = 8 * bytes;
            self["word" + bits + "le"] = self["word" + bits + "lu"] = decode(bytes, decodeLEu), 
            self["word" + bits + "ls"] = decode(bytes, decodeLEs), self["word" + bits + "be"] = self["word" + bits + "bu"] = decode(bytes, decodeBEu), 
            self["word" + bits + "bs"] = decode(bytes, decodeBEs);
        })), self.word8 = self.word8u = self.word8be, self.word8s = self.word8bs, self;
    }
    (exports = module.exports = function(bufOrEm, eventName) {
        if (Buffer.isBuffer(bufOrEm)) return exports.parse(bufOrEm);
        var s = exports.stream();
        return bufOrEm && bufOrEm.pipe ? bufOrEm.pipe(s) : bufOrEm && (bufOrEm.on(eventName || "data", (function(buf) {
            s.write(buf);
        })), bufOrEm.on("end", (function() {
            s.end();
        }))), s;
    }).stream = function(input) {
        if (input) return exports.apply(null, arguments);
        var pending = null;
        function getBytes(bytes, cb, skip) {
            pending = {
                bytes: bytes,
                skip: skip,
                cb: function(buf) {
                    pending = null, cb(buf);
                }
            }, dispatch();
        }
        var offset = null;
        function dispatch() {
            if (pending) if ("function" == typeof pending) pending(); else {
                var buf, bytes = offset + pending.bytes;
                buffers.length >= bytes && (null == offset ? (buf = buffers.splice(0, bytes), pending.skip || (buf = buf.slice())) : (pending.skip || (buf = buffers.slice(offset, bytes)), 
                offset = bytes), pending.skip ? pending.cb() : pending.cb(buf));
            } else caughtEnd && (done = !0);
        }
        function builder(saw) {
            function next() {
                done || saw.next();
            }
            var self = words((function(bytes, cb) {
                return function(name) {
                    getBytes(bytes, (function(buf) {
                        vars.set(name, cb(buf)), next();
                    }));
                };
            }));
            return self.tap = function(cb) {
                saw.nest(cb, vars.store);
            }, self.into = function(key, cb) {
                vars.get(key) || vars.set(key, {});
                var parent = vars;
                vars = Vars(parent.get(key)), saw.nest((function() {
                    cb.apply(this, arguments), this.tap((function() {
                        vars = parent;
                    }));
                }), vars.store);
            }, self.flush = function() {
                vars.store = {}, next();
            }, self.loop = function(cb) {
                var end = !1;
                saw.nest(!1, (function loop() {
                    this.vars = vars.store, cb.call(this, (function() {
                        end = !0, next();
                    }), vars.store), this.tap(function() {
                        end ? saw.next() : loop.call(this);
                    }.bind(this));
                }), vars.store);
            }, self.buffer = function(name, bytes) {
                "string" == typeof bytes && (bytes = vars.get(bytes)), getBytes(bytes, (function(buf) {
                    vars.set(name, buf), next();
                }));
            }, self.skip = function(bytes) {
                "string" == typeof bytes && (bytes = vars.get(bytes)), getBytes(bytes, (function() {
                    next();
                }));
            }, self.scan = function(name, search) {
                if ("string" == typeof search) search = new Buffer(search); else if (!Buffer.isBuffer(search)) throw new Error("search must be a Buffer or a string");
                var taken = 0;
                pending = function() {
                    var pos = buffers.indexOf(search, offset + taken), i = pos - offset - taken;
                    -1 !== pos ? (pending = null, null != offset ? (vars.set(name, buffers.slice(offset, offset + taken + i)), 
                    offset += taken + i + search.length) : (vars.set(name, buffers.slice(0, taken + i)), 
                    buffers.splice(0, taken + i + search.length)), next(), dispatch()) : i = Math.max(buffers.length - search.length - offset - taken, 0), 
                    taken += i;
                }, dispatch();
            }, self.peek = function(cb) {
                offset = 0, saw.nest((function() {
                    cb.call(this, vars.store), this.tap((function() {
                        offset = null;
                    }));
                }));
            }, self;
        }
        var stream = Chainsaw.light(builder);
        stream.writable = !0;
        var buffers = Buffers();
        stream.write = function(buf) {
            buffers.push(buf), dispatch();
        };
        var vars = Vars(), done = !1, caughtEnd = !1;
        return stream.end = function() {
            caughtEnd = !0;
        }, stream.pipe = Stream.prototype.pipe, Object.getOwnPropertyNames(EventEmitter.prototype).forEach((function(name) {
            stream[name] = EventEmitter.prototype[name];
        })), stream;
    }, exports.parse = function(buffer) {
        var self = words((function(bytes, cb) {
            return function(name) {
                if (offset + bytes <= buffer.length) {
                    var buf = buffer.slice(offset, offset + bytes);
                    offset += bytes, vars.set(name, cb(buf));
                } else vars.set(name, null);
                return self;
            };
        })), offset = 0, vars = Vars();
        return self.vars = vars.store, self.tap = function(cb) {
            return cb.call(self, vars.store), self;
        }, self.into = function(key, cb) {
            vars.get(key) || vars.set(key, {});
            var parent = vars;
            return vars = Vars(parent.get(key)), cb.call(self, vars.store), vars = parent, self;
        }, self.loop = function(cb) {
            for (var end = !1, ender = function() {
                end = !0;
            }; !1 === end; ) cb.call(self, ender, vars.store);
            return self;
        }, self.buffer = function(name, size) {
            "string" == typeof size && (size = vars.get(size));
            var buf = buffer.slice(offset, Math.min(buffer.length, offset + size));
            return offset += size, vars.set(name, buf), self;
        }, self.skip = function(bytes) {
            return "string" == typeof bytes && (bytes = vars.get(bytes)), offset += bytes, self;
        }, self.scan = function(name, search) {
            if ("string" == typeof search) search = new Buffer(search); else if (!Buffer.isBuffer(search)) throw new Error("search must be a Buffer or a string");
            vars.set(name, null);
            for (var i = 0; i + offset <= buffer.length - search.length + 1; i++) {
                for (var j = 0; j < search.length && buffer[offset + i + j] === search[j]; j++) ;
                if (j === search.length) break;
            }
            return vars.set(name, buffer.slice(offset, offset + i)), offset += i + search.length, 
            self;
        }, self.peek = function(cb) {
            var was = offset;
            return cb.call(self, vars.store), offset = was, self;
        }, self.flush = function() {
            return vars.store = {}, self;
        }, self.eof = function() {
            return offset >= buffer.length;
        }, self;
    };
}
