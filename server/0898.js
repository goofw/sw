function(module, exports) {
    module.exports = function(buff, search, offset, encoding) {
        if (!Buffer.isBuffer(buff)) throw TypeError("buffer is not a buffer");
        if (void 0 === encoding && "string" == typeof offset && (encoding = offset, offset = void 0), 
        "string" == typeof search) search = new Buffer(search, encoding || "utf8"); else if ("number" != typeof search || isNaN(search)) {
            if (!Buffer.isBuffer(search)) throw TypeError("search is not a bufferable object");
        } else search = new Buffer([ search ]);
        if (0 === search.length) return -1;
        if (void 0 === offset || "number" == typeof offset && isNaN(offset)) offset = 0; else if ("number" != typeof offset) throw TypeError("offset is not a number");
        offset < 0 && (offset = buff.length + offset), offset < 0 && (offset = 0);
        for (var m = 0, s = -1, i = offset; i < buff.length && (buff[i] != search[m] && (s = -1, 
        i -= m - 1, m = 0), buff[i] != search[m] || (-1 == s && (s = i), ++m != search.length)); ++i) ;
        return s > -1 && buff.length - s < search.length ? -1 : s;
    };
}
