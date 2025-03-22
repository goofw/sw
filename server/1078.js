function(module, exports, __webpack_require__) {
    "use strict";
    var utils = __webpack_require__(494), has = Object.prototype.hasOwnProperty, defaults = {
        allowDots: !1,
        allowPrototypes: !1,
        arrayLimit: 20,
        decoder: utils.decode,
        delimiter: "&",
        depth: 5,
        parameterLimit: 1e3,
        plainObjects: !1,
        strictNullHandling: !1
    }, parseKeys = function(givenKey, val, options) {
        if (givenKey) {
            var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, "[$1]") : givenKey, child = /(\[[^[\]]*])/g, segment = /(\[[^[\]]*])/.exec(key), parent = segment ? key.slice(0, segment.index) : key, keys = [];
            if (parent) {
                if (!options.plainObjects && has.call(Object.prototype, parent) && !options.allowPrototypes) return;
                keys.push(parent);
            }
            for (var i = 0; null !== (segment = child.exec(key)) && i < options.depth; ) {
                if (i += 1, !options.plainObjects && has.call(Object.prototype, segment[1].slice(1, -1)) && !options.allowPrototypes) return;
                keys.push(segment[1]);
            }
            return segment && keys.push("[" + key.slice(segment.index) + "]"), (function(chain, val, options) {
                for (var leaf = val, i = chain.length - 1; i >= 0; --i) {
                    var obj, root = chain[i];
                    if ("[]" === root) obj = (obj = []).concat(leaf); else {
                        obj = options.plainObjects ? Object.create(null) : {};
                        var cleanRoot = "[" === root.charAt(0) && "]" === root.charAt(root.length - 1) ? root.slice(1, -1) : root, index = parseInt(cleanRoot, 10);
                        !isNaN(index) && root !== cleanRoot && String(index) === cleanRoot && index >= 0 && options.parseArrays && index <= options.arrayLimit ? (obj = [])[index] = leaf : obj[cleanRoot] = leaf;
                    }
                    leaf = obj;
                }
                return leaf;
            })(keys, val, options);
        }
    };
    module.exports = function(str, opts) {
        var options = opts ? utils.assign({}, opts) : {};
        if (null !== options.decoder && void 0 !== options.decoder && "function" != typeof options.decoder) throw new TypeError("Decoder has to be a function.");
        if (options.ignoreQueryPrefix = !0 === options.ignoreQueryPrefix, options.delimiter = "string" == typeof options.delimiter || utils.isRegExp(options.delimiter) ? options.delimiter : defaults.delimiter, 
        options.depth = "number" == typeof options.depth ? options.depth : defaults.depth, 
        options.arrayLimit = "number" == typeof options.arrayLimit ? options.arrayLimit : defaults.arrayLimit, 
        options.parseArrays = !1 !== options.parseArrays, options.decoder = "function" == typeof options.decoder ? options.decoder : defaults.decoder, 
        options.allowDots = "boolean" == typeof options.allowDots ? options.allowDots : defaults.allowDots, 
        options.plainObjects = "boolean" == typeof options.plainObjects ? options.plainObjects : defaults.plainObjects, 
        options.allowPrototypes = "boolean" == typeof options.allowPrototypes ? options.allowPrototypes : defaults.allowPrototypes, 
        options.parameterLimit = "number" == typeof options.parameterLimit ? options.parameterLimit : defaults.parameterLimit, 
        options.strictNullHandling = "boolean" == typeof options.strictNullHandling ? options.strictNullHandling : defaults.strictNullHandling, 
        "" === str || null == str) return options.plainObjects ? Object.create(null) : {};
        for (var tempObj = "string" == typeof str ? (function(str, options) {
            for (var obj = {}, cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, "") : str, limit = options.parameterLimit === 1 / 0 ? void 0 : options.parameterLimit, parts = cleanStr.split(options.delimiter, limit), i = 0; i < parts.length; ++i) {
                var key, val, part = parts[i], bracketEqualsPos = part.indexOf("]="), pos = -1 === bracketEqualsPos ? part.indexOf("=") : bracketEqualsPos + 1;
                -1 === pos ? (key = options.decoder(part, defaults.decoder), val = options.strictNullHandling ? null : "") : (key = options.decoder(part.slice(0, pos), defaults.decoder), 
                val = options.decoder(part.slice(pos + 1), defaults.decoder)), has.call(obj, key) ? obj[key] = [].concat(obj[key]).concat(val) : obj[key] = val;
            }
            return obj;
        })(str, options) : str, obj = options.plainObjects ? Object.create(null) : {}, keys = Object.keys(tempObj), i = 0; i < keys.length; ++i) {
            var key = keys[i], newObj = parseKeys(key, tempObj[key], options);
            obj = utils.merge(obj, newObj, options);
        }
        return utils.compact(obj);
    };
}
