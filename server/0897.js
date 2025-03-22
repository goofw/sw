function(module, exports, __webpack_require__) {
    "use strict";
    var bindexOf = __webpack_require__(898), equalSign = new Buffer("=");
    function decodeBlock(buf, offset) {
        var len = buf[offset], to = offset + 1 + len, b = buf.slice(offset + 1, to > buf.length ? buf.length : to);
        return decodeBlock.bytes = len + 1, b;
    }
    module.exports = function(opts) {
        var binary = !!opts && opts.binary, that = {
            encode: function(data, buf, offset) {
                data || (data = {}), offset || (offset = 0), buf || (buf = new Buffer(that.encodingLength(data) + offset));
                var oldOffset = offset, keys = Object.keys(data);
                return 0 === keys.length && (buf[offset] = 0, offset++), keys.forEach((function(key) {
                    var val = data[key], oldOffset = offset;
                    if (offset++, !0 === val) offset += buf.write(key, offset); else if (Buffer.isBuffer(val)) {
                        offset += buf.write(key + "=", offset);
                        var len = val.length;
                        val.copy(buf, offset, 0, len), offset += len;
                    } else offset += buf.write(key + "=" + val, offset);
                    buf[oldOffset] = offset - oldOffset - 1;
                })), that.encode.bytes = offset - oldOffset, buf;
            },
            decode: function(buf, offset, len) {
                offset || (offset = 0), Number.isFinite(len) || (len = buf.length);
                for (var data = {}, oldOffset = offset; offset < len; ) {
                    var b = decodeBlock(buf, offset), i = bindexOf(b, equalSign);
                    if (offset += decodeBlock.bytes, 0 !== b.length) if (-1 === i) data[b.toString().toLowerCase()] = !0; else {
                        if (0 === i) continue;
                        var key = b.slice(0, i).toString().toLowerCase();
                        if (key in data) continue;
                        data[key] = binary ? b.slice(i + 1) : b.slice(i + 1).toString();
                    }
                }
                return that.decode.bytes = offset - oldOffset, data;
            },
            encodingLength: function(data) {
                if (!data) return 1;
                var keys = Object.keys(data);
                return 0 === keys.length ? 1 : keys.reduce((function(total, key) {
                    var val = data[key];
                    return total += Buffer.byteLength(key) + 1, Buffer.isBuffer(val) ? total += val.length + 1 : !0 !== val && (total += Buffer.byteLength(String(val)) + 1), 
                    total;
                }), 0);
            }
        };
        return that;
    };
}
