function(module, exports, __webpack_require__) {
    "use strict";
    var utils = __webpack_require__(494), formats = __webpack_require__(495), arrayPrefixGenerators = {
        brackets: function(prefix) {
            return prefix + "[]";
        },
        indices: function(prefix, key) {
            return prefix + "[" + key + "]";
        },
        repeat: function(prefix) {
            return prefix;
        }
    }, toISO = Date.prototype.toISOString, defaults = {
        delimiter: "&",
        encode: !0,
        encoder: utils.encode,
        encodeValuesOnly: !1,
        serializeDate: function(date) {
            return toISO.call(date);
        },
        skipNulls: !1,
        strictNullHandling: !1
    }, stringify = function stringify(object, prefix, generateArrayPrefix, strictNullHandling, skipNulls, encoder, filter, sort, allowDots, serializeDate, formatter, encodeValuesOnly) {
        var obj = object;
        if ("function" == typeof filter) obj = filter(prefix, obj); else if (obj instanceof Date) obj = serializeDate(obj); else if (null === obj) {
            if (strictNullHandling) return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder) : prefix;
            obj = "";
        }
        if ("string" == typeof obj || "number" == typeof obj || "boolean" == typeof obj || utils.isBuffer(obj)) return encoder ? [ formatter(encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder)) + "=" + formatter(encoder(obj, defaults.encoder)) ] : [ formatter(prefix) + "=" + formatter(String(obj)) ];
        var objKeys, values = [];
        if (void 0 === obj) return values;
        if (Array.isArray(filter)) objKeys = filter; else {
            var keys = Object.keys(obj);
            objKeys = sort ? keys.sort(sort) : keys;
        }
        for (var i = 0; i < objKeys.length; ++i) {
            var key = objKeys[i];
            skipNulls && null === obj[key] || (values = Array.isArray(obj) ? values.concat(stringify(obj[key], generateArrayPrefix(prefix, key), generateArrayPrefix, strictNullHandling, skipNulls, encoder, filter, sort, allowDots, serializeDate, formatter, encodeValuesOnly)) : values.concat(stringify(obj[key], prefix + (allowDots ? "." + key : "[" + key + "]"), generateArrayPrefix, strictNullHandling, skipNulls, encoder, filter, sort, allowDots, serializeDate, formatter, encodeValuesOnly)));
        }
        return values;
    };
    module.exports = function(object, opts) {
        var obj = object, options = opts ? utils.assign({}, opts) : {};
        if (null !== options.encoder && void 0 !== options.encoder && "function" != typeof options.encoder) throw new TypeError("Encoder has to be a function.");
        var delimiter = void 0 === options.delimiter ? defaults.delimiter : options.delimiter, strictNullHandling = "boolean" == typeof options.strictNullHandling ? options.strictNullHandling : defaults.strictNullHandling, skipNulls = "boolean" == typeof options.skipNulls ? options.skipNulls : defaults.skipNulls, encode = "boolean" == typeof options.encode ? options.encode : defaults.encode, encoder = "function" == typeof options.encoder ? options.encoder : defaults.encoder, sort = "function" == typeof options.sort ? options.sort : null, allowDots = void 0 !== options.allowDots && options.allowDots, serializeDate = "function" == typeof options.serializeDate ? options.serializeDate : defaults.serializeDate, encodeValuesOnly = "boolean" == typeof options.encodeValuesOnly ? options.encodeValuesOnly : defaults.encodeValuesOnly;
        if (void 0 === options.format) options.format = formats.default; else if (!Object.prototype.hasOwnProperty.call(formats.formatters, options.format)) throw new TypeError("Unknown format option provided.");
        var objKeys, filter, formatter = formats.formatters[options.format];
        "function" == typeof options.filter ? obj = (filter = options.filter)("", obj) : Array.isArray(options.filter) && (objKeys = filter = options.filter);
        var arrayFormat, keys = [];
        if ("object" != typeof obj || null === obj) return "";
        arrayFormat = options.arrayFormat in arrayPrefixGenerators ? options.arrayFormat : "indices" in options ? options.indices ? "indices" : "repeat" : "indices";
        var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];
        objKeys || (objKeys = Object.keys(obj)), sort && objKeys.sort(sort);
        for (var i = 0; i < objKeys.length; ++i) {
            var key = objKeys[i];
            skipNulls && null === obj[key] || (keys = keys.concat(stringify(obj[key], key, generateArrayPrefix, strictNullHandling, skipNulls, encode ? encoder : null, filter, sort, allowDots, serializeDate, formatter, encodeValuesOnly)));
        }
        var joined = keys.join(delimiter), prefix = !0 === options.addQueryPrefix ? "?" : "";
        return joined.length > 0 ? prefix + joined : "";
    };
}
