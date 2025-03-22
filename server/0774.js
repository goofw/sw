function(module, exports) {
    var hasFullSupport = (function() {
        try {
            if (!Buffer.isEncoding("latin1")) return !1;
            var buf = Buffer.alloc ? Buffer.alloc(4) : new Buffer(4);
            return buf.fill("ab", "ucs2"), "61006200" === buf.toString("hex");
        } catch (_) {
            return !1;
        }
    })();
    function fillWithNumber(buffer, val, start, end) {
        if (start < 0 || end > buffer.length) throw new RangeError("Out of range index");
        return start >>>= 0, (end = void 0 === end ? buffer.length : end >>> 0) > start && buffer.fill(val, start, end), 
        buffer;
    }
    module.exports = function(buffer, val, start, end, encoding) {
        if (hasFullSupport) return buffer.fill(val, start, end, encoding);
        if ("number" == typeof val) return fillWithNumber(buffer, val, start, end);
        if ("string" == typeof val) {
            if ("string" == typeof start ? (encoding = start, start = 0, end = buffer.length) : "string" == typeof end && (encoding = end, 
            end = buffer.length), void 0 !== encoding && "string" != typeof encoding) throw new TypeError("encoding must be a string");
            if ("latin1" === encoding && (encoding = "binary"), "string" == typeof encoding && !Buffer.isEncoding(encoding)) throw new TypeError("Unknown encoding: " + encoding);
            if ("" === val) return fillWithNumber(buffer, 0, start, end);
            if ((function(val) {
                return 1 === val.length && val.charCodeAt(0) < 256;
            })(val)) return fillWithNumber(buffer, val.charCodeAt(0), start, end);
            val = new Buffer(val, encoding);
        }
        return Buffer.isBuffer(val) ? (function(buffer, val, start, end) {
            if (start < 0 || end > buffer.length) throw new RangeError("Out of range index");
            if (end <= start) return buffer;
            start >>>= 0, end = void 0 === end ? buffer.length : end >>> 0;
            for (var pos = start, len = val.length; pos <= end - len; ) val.copy(buffer, pos), 
            pos += len;
            return pos !== end && val.copy(buffer, pos, 0, end - pos), buffer;
        })(buffer, val, start, end) : fillWithNumber(buffer, 0, start, end);
    };
}
