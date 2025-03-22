function(module, exports, __webpack_require__) {
    "use strict";
    var utils = __webpack_require__(248), has = Object.prototype.hasOwnProperty, defaults = {
        allowDots: !1,
        allowPrototypes: !1,
        arrayLimit: 20,
        charset: "utf-8",
        charsetSentinel: !1,
        comma: !1,
        decoder: utils.decode,
        delimiter: "&",
        depth: 5,
        ignoreQueryPrefix: !1,
        interpretNumericEntities: !1,
        parameterLimit: 1e3,
        parseArrays: !0,
        plainObjects: !1,
        strictNullHandling: !1
    }, interpretNumericEntities = function(str) {
        return str.replace(/&#(\d+);/g, (function($0, numberStr) {
            return String.fromCharCode(parseInt(numberStr, 10));
        }));
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
                    if ("[]" === root && options.parseArrays) obj = [].concat(leaf); else {
                        obj = options.plainObjects ? Object.create(null) : {};
                        var cleanRoot = "[" === root.charAt(0) && "]" === root.charAt(root.length - 1) ? root.slice(1, -1) : root, index = parseInt(cleanRoot, 10);
                        options.parseArrays || "" !== cleanRoot ? !isNaN(index) && root !== cleanRoot && String(index) === cleanRoot && index >= 0 && options.parseArrays && index <= options.arrayLimit ? (obj = [])[index] = leaf : obj[cleanRoot] = leaf : obj = {
                            0: leaf
                        };
                    }
                    leaf = obj;
                }
                return leaf;
            })(keys, val, options);
        }
    };
    module.exports = function(str, opts) {
        var options = (function(opts) {
            if (!opts) return defaults;
            if (null !== opts.decoder && void 0 !== opts.decoder && "function" != typeof opts.decoder) throw new TypeError("Decoder has to be a function.");
            if (void 0 !== opts.charset && "utf-8" !== opts.charset && "iso-8859-1" !== opts.charset) throw new Error("The charset option must be either utf-8, iso-8859-1, or undefined");
            var charset = void 0 === opts.charset ? defaults.charset : opts.charset;
            return {
                allowDots: void 0 === opts.allowDots ? defaults.allowDots : !!opts.allowDots,
                allowPrototypes: "boolean" == typeof opts.allowPrototypes ? opts.allowPrototypes : defaults.allowPrototypes,
                arrayLimit: "number" == typeof opts.arrayLimit ? opts.arrayLimit : defaults.arrayLimit,
                charset: charset,
                charsetSentinel: "boolean" == typeof opts.charsetSentinel ? opts.charsetSentinel : defaults.charsetSentinel,
                comma: "boolean" == typeof opts.comma ? opts.comma : defaults.comma,
                decoder: "function" == typeof opts.decoder ? opts.decoder : defaults.decoder,
                delimiter: "string" == typeof opts.delimiter || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
                depth: "number" == typeof opts.depth ? opts.depth : defaults.depth,
                ignoreQueryPrefix: !0 === opts.ignoreQueryPrefix,
                interpretNumericEntities: "boolean" == typeof opts.interpretNumericEntities ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
                parameterLimit: "number" == typeof opts.parameterLimit ? opts.parameterLimit : defaults.parameterLimit,
                parseArrays: !1 !== opts.parseArrays,
                plainObjects: "boolean" == typeof opts.plainObjects ? opts.plainObjects : defaults.plainObjects,
                strictNullHandling: "boolean" == typeof opts.strictNullHandling ? opts.strictNullHandling : defaults.strictNullHandling
            };
        })(opts);
        if ("" === str || null == str) return options.plainObjects ? Object.create(null) : {};
        for (var tempObj = "string" == typeof str ? (function(str, options) {
            var i, obj = {}, cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, "") : str, limit = options.parameterLimit === 1 / 0 ? void 0 : options.parameterLimit, parts = cleanStr.split(options.delimiter, limit), skipIndex = -1, charset = options.charset;
            if (options.charsetSentinel) for (i = 0; i < parts.length; ++i) 0 === parts[i].indexOf("utf8=") && ("utf8=%E2%9C%93" === parts[i] ? charset = "utf-8" : "utf8=%26%2310003%3B" === parts[i] && (charset = "iso-8859-1"), 
            skipIndex = i, i = parts.length);
            for (i = 0; i < parts.length; ++i) if (i !== skipIndex) {
                var key, val, part = parts[i], bracketEqualsPos = part.indexOf("]="), pos = -1 === bracketEqualsPos ? part.indexOf("=") : bracketEqualsPos + 1;
                -1 === pos ? (key = options.decoder(part, defaults.decoder, charset), val = options.strictNullHandling ? null : "") : (key = options.decoder(part.slice(0, pos), defaults.decoder, charset), 
                val = options.decoder(part.slice(pos + 1), defaults.decoder, charset)), val && options.interpretNumericEntities && "iso-8859-1" === charset && (val = interpretNumericEntities(val)), 
                val && options.comma && val.indexOf(",") > -1 && (val = val.split(",")), has.call(obj, key) ? obj[key] = utils.combine(obj[key], val) : obj[key] = val;
            }
            return obj;
        })(str, options) : str, obj = options.plainObjects ? Object.create(null) : {}, keys = Object.keys(tempObj), i = 0; i < keys.length; ++i) {
            var key = keys[i], newObj = parseKeys(key, tempObj[key], options);
            obj = utils.merge(obj, newObj, options);
        }
        return utils.compact(obj);
    };
}
