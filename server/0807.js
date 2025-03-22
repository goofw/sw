function(module, exports, __webpack_require__) {
    "use strict";
    var Parser = __webpack_require__(808), through = __webpack_require__(809), bufferFrom = Buffer.from && Buffer.from !== Uint8Array.from;
    function check(x, y) {
        return "string" == typeof x ? y == x : x && "function" == typeof x.exec ? x.exec(y) : "boolean" == typeof x || "object" == typeof x ? x : "function" == typeof x && x(y);
    }
    exports.parse = function(path, map) {
        var header, footer, parser = new Parser, stream = through((function(chunk) {
            "string" == typeof chunk && (chunk = bufferFrom ? Buffer.from(chunk) : new Buffer(chunk)), 
            parser.write(chunk);
        }), (function(data) {
            data && stream.write(data), header && stream.emit("header", header), footer && stream.emit("footer", footer), 
            stream.queue(null);
        }));
        return "string" == typeof path && (path = path.split(".").map((function(e) {
            return "$*" === e ? {
                emitKey: !0
            } : "*" === e || ("" === e ? {
                recurse: !0
            } : e);
        }))), path && path.length || (path = null), parser.onValue = function(value) {
            if (this.root || (stream.root = value), path) {
                for (var i = 0, j = 0, emitKey = !1, emitPath = !1; i < path.length; ) {
                    var c, key = path[i];
                    if (j++, key && !key.recurse) {
                        if (!(c = j === this.stack.length ? this : this.stack[j])) return;
                        if (!check(key, c.key)) return void setHeaderFooter(c.key, value);
                        emitKey = !!key.emitKey, emitPath = !!key.emitPath, i++;
                    } else {
                        i++;
                        var nextKey = path[i];
                        if (!nextKey) return;
                        for (;;) {
                            if (!(c = j === this.stack.length ? this : this.stack[j])) return;
                            if (check(nextKey, c.key)) {
                                i++, Object.isFrozen(this.stack[j]) || (this.stack[j].value = null);
                                break;
                            }
                            setHeaderFooter(c.key, value), j++;
                        }
                    }
                }
                if (header && (stream.emit("header", header), header = !1), j === this.stack.length) {
                    var actualPath = this.stack.slice(1).map((function(element) {
                        return element.key;
                    })).concat([ this.key ]), data = value;
                    for (var k in null != data && null != (data = map ? map(data, actualPath) : data) && ((emitKey || emitPath) && (data = {
                        value: data
                    }, emitKey && (data.key = this.key), emitPath && (data.path = actualPath)), stream.queue(data)), 
                    this.value && delete this.value[this.key], this.stack) Object.isFrozen(this.stack[k]) || (this.stack[k].value = null);
                }
            }
        }, parser._onToken = parser.onToken, parser.onToken = function(token, value) {
            parser._onToken(token, value), 0 === this.stack.length && stream.root && (path || stream.queue(stream.root), 
            stream.root = null);
        }, parser.onError = function(err) {
            err.message.indexOf("at position") > -1 && (err.message = "Invalid JSON (" + err.message + ")"), 
            stream.emit("error", err);
        }, stream;
        function setHeaderFooter(key, value) {
            !1 !== header && ((header = header || {})[key] = value), !1 !== footer && !1 === header && ((footer = footer || {})[key] = value);
        }
    }, exports.stringify = function(op, sep, cl, indent) {
        indent = indent || 0, !1 === op ? (op = "", sep = "\n", cl = "") : null == op && (op = "[\n", 
        sep = "\n,\n", cl = "\n]\n");
        var stream, first = !0, anyData = !1;
        return stream = through((function(data) {
            anyData = !0;
            try {
                var json = JSON.stringify(data, null, indent);
            } catch (err) {
                return stream.emit("error", err);
            }
            first ? (first = !1, stream.queue(op + json)) : stream.queue(sep + json);
        }), (function(data) {
            anyData || stream.queue(op), stream.queue(cl), stream.queue(null);
        }));
    }, exports.stringifyObject = function(op, sep, cl, indent) {
        indent = indent || 0, !1 === op ? (op = "", sep = "\n", cl = "") : null == op && (op = "{\n", 
        sep = "\n,\n", cl = "\n}\n");
        var first = !0, anyData = !1;
        return through((function(data) {
            anyData = !0;
            var json = JSON.stringify(data[0]) + ":" + JSON.stringify(data[1], null, indent);
            first ? (first = !1, this.queue(op + json)) : this.queue(sep + json);
        }), (function(data) {
            anyData || this.queue(op), this.queue(cl), this.queue(null);
        }));
    };
}
