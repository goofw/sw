function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(entity, options) {
        if (null == entity) throw new TypeError("argument entity is required");
        var obj, isStats = (obj = entity, "function" == typeof Stats && obj instanceof Stats || obj && "object" == typeof obj && "ctime" in obj && "[object Date]" === toString.call(obj.ctime) && "mtime" in obj && "[object Date]" === toString.call(obj.mtime) && "ino" in obj && "number" == typeof obj.ino && "size" in obj && "number" == typeof obj.size), weak = options && "boolean" == typeof options.weak ? options.weak : isStats;
        if (!isStats && "string" != typeof entity && !Buffer.isBuffer(entity)) throw new TypeError("argument entity must be string, Buffer, or fs.Stats");
        var stat, mtime, tag = isStats ? (mtime = (stat = entity).mtime.getTime().toString(16), 
        '"' + stat.size.toString(16) + "-" + mtime + '"') : (function(entity) {
            if (0 === entity.length) return '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"';
            var hash = crypto.createHash("sha1").update(entity, "utf8").digest("base64").substring(0, 27);
            return '"' + ("string" == typeof entity ? Buffer.byteLength(entity, "utf8") : entity.length).toString(16) + "-" + hash + '"';
        })(entity);
        return weak ? "W/" + tag : tag;
    };
    var crypto = __webpack_require__(9), Stats = __webpack_require__(2).Stats, toString = Object.prototype.toString;
}
