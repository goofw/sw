function(module, exports, __webpack_require__) {
    exports.encode = function Bencode(obj) {
        var n, buf, buffer = null;
        switch (typeof obj) {
          case "string":
            return (function(obj) {
                var blen = Buffer.byteLength(obj), len = blen.toString(10), buf = new Buffer(len.length + 1 + blen);
                return buf.write(len, 0, "ascii"), buf.write(":", len.length, "ascii"), buf.write(obj, len.length + 1, "utf8"), 
                buf;
            })(obj);

          case "number":
            return n = obj.toString(10), (buf = new Buffer(n.length + 2)).write("i", 0), buf.write(n, 1), 
            buf.write("e", n.length + 1), buf;

          case "object":
            return obj instanceof Array ? (function(obj) {
                var func = function(obj, pos) {
                    return obj.forEach((function(o) {
                        var elem = new Bencode(o);
                        ensure(elem.length, pos), elem.copy(buffer, pos, 0), pos += elem.length;
                    })), pos;
                };
                return assemble(obj, "l", func);
            })(obj) : Buffer.isBuffer(obj) ? (function(obj) {
                var len = obj.length.toString(10), buf = new Buffer(len.length + 1 + obj.length);
                return buf.write(len, 0, "ascii"), buf.write(":", len.length, "ascii"), obj.copy(buf, len.length + 1, 0), 
                buf;
            })(obj) : (function(obj) {
                var func = function(obj, pos) {
                    return Object.keys(obj).sort().forEach((function(key) {
                        var val = new Bencode(obj[key]);
                        ensure((key = new Bencode(key)).length + val.length, pos), key.copy(buffer, pos, 0), 
                        pos += key.length, val.copy(buffer, pos, 0), pos += val.length;
                    })), pos;
                };
                return assemble(obj, "d", func);
            })(obj);
        }
        function assemble(obj, prefix, func) {
            var pos = 0;
            return ensure(1024, 0), buffer.write(prefix, pos++), ensure(1, pos = func(obj, pos)), 
            buffer.write("e", pos++), buffer.slice(0, pos);
        }
        function ensure(num, pos) {
            if (buffer) {
                if (buffer.length > num + pos + 1) return;
                var buf2 = new Buffer(buffer.length + num);
                buffer.copy(buf2, 0, 0), buffer = buf2;
            } else buffer = new Buffer(num);
        }
    }, exports.decoder = Bdecode, exports.decode = function(buffer, encoding) {
        var decoder = new Bdecode;
        return decoder.decode(buffer, encoding), decoder.result()[0];
    }, exports.Stream = Stream;
    var inherits = __webpack_require__(0).inherits, Transform = __webpack_require__(3).Transform, I = "i".charCodeAt(0), L = "l".charCodeAt(0), E = "e".charCodeAt(0), D = "d".charCodeAt(0), COLON = ":".charCodeAt(0), DASH = "-".charCodeAt(0);
    function BdecodeSMachine(cb, cb_list, cb_dict, cb_end) {
        var depth = 0, state = 0;
        this.consistent = function() {
            return 0 === state && 0 === depth;
        };
        var strLen = 0, str = "", _int = 0, neg = !1;
        function integer(value) {
            return "number" == typeof value && (function(val, min, max) {
                return 48 <= val && val <= 57;
            })(value);
        }
        this.parse = function(buffer, encoding) {
            "string" == typeof buffer && (buffer = new Buffer(buffer, encoding || "utf8"));
            for (var pos = 0; pos !== buffer.length; ++pos) switch (state) {
              case 0:
                switch (buffer[pos]) {
                  case 48:
                  case 49:
                  case 50:
                  case 51:
                  case 52:
                  case 53:
                  case 54:
                  case 55:
                  case 56:
                  case 57:
                    state = 1, strLen = 0, strLen += buffer[pos] - 48;
                    break;

                  case I:
                    state = 4, _int = 0, neg = !1;
                    break;

                  case L:
                    state = 0, depth += 1, cb_list();
                    break;

                  case D:
                    state = 0, depth += 1, cb_dict();
                    break;

                  case E:
                    if (state = 0, (depth -= 1) < 0) throw new Error("end with no beginning: " + pos);
                    cb_end();
                }
                break;

              case 1:
                integer(buffer[pos]) ? (strLen *= 10, strLen += buffer[pos] - 48) : (str = new Buffer(strLen), 
                pos -= 1, state = 3);
                break;

              case 3:
                if (buffer[pos] !== COLON) throw new Error("not a colon at: " + pos.toString(16));
                state = 2, 0 === strLen && (cb(new Buffer(0)), state = 0);
                break;

              case 2:
                0 === strLen ? (cb(str), state = 0) : (str[str.length - strLen] = buffer[pos], 0 == (strLen -= 1) && (cb(str), 
                state = 0));
                break;

              case 4:
                if (state = 5, buffer[pos] === DASH) {
                    neg = !0;
                    break;
                }

              case 5:
                if (integer(buffer[pos])) _int *= 10, _int += buffer[pos] - 48; else {
                    if (buffer[pos] !== E) throw new Error("not part of int at:" + pos.toString(16));
                    cb(neg ? 0 - _int : _int), state = 0;
                }
            }
        };
    }
    function Bdecode() {
        var DICTIONARY_START = {}, LIST_START = {}, ctx = new (function() {
            var self = this, stack = [];
            this.cb = function(o) {
                stack.push(o);
            }, this.cb_list = function() {
                self.cb(LIST_START);
            }, this.cb_dict = function() {
                self.cb(DICTIONARY_START);
            }, this.cb_end = function() {
                for (var obj = null, tmp_stack = []; void 0 !== (obj = stack.pop()); ) {
                    if (LIST_START === obj) {
                        for (var obj2 = null, list = []; void 0 !== (obj2 = tmp_stack.pop()); ) list.push(obj2);
                        self.cb(list);
                        break;
                    }
                    if (DICTIONARY_START === obj) {
                        for (var key = null, val = null, dic = {}; void 0 !== (key = tmp_stack.pop()) && void 0 !== (val = tmp_stack.pop()); ) dic[key.toString()] = val;
                        if (void 0 !== key && void 0 === dic[key]) throw new Error("uneven number of keys and values A");
                        self.cb(dic);
                        break;
                    }
                    tmp_stack.push(obj);
                }
                if (tmp_stack.length > 0) throw new Error("uneven number of keys and values B");
            }, this.result = function() {
                return stack;
            };
        }), smachine = new BdecodeSMachine(ctx.cb, ctx.cb_list, ctx.cb_dict, ctx.cb_end);
        this.result = function() {
            if (!smachine.consistent()) throw new Error("not in consistent state. More bytes coming?");
            return ctx.result();
        }, this.decode = function(buf, encoding) {
            smachine.parse(buf, encoding);
        };
    }
    function Stream(options) {
        (options = options || {}).objectMode = !0, Transform.call(this, options), this._decoder = new Bdecode;
    }
    inherits(Stream, Transform), Stream.prototype._transform = function(chunk, encoding, callback) {
        try {
            this._decoder.decode(chunk, encoding), callback(null);
        } catch (err) {
            callback(err);
        }
    }, Stream.prototype._flush = function(callback) {
        this.push(this._decoder.result()[0]), callback(null);
    };
}
