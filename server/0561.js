function(module, exports, __webpack_require__) {
    "use strict";
    var utils = __webpack_require__(248), formats = __webpack_require__(249), has = Object.prototype.hasOwnProperty, arrayPrefixGenerators = {
        brackets: function(prefix) {
            return prefix + "[]";
        },
        comma: "comma",
        indices: function(prefix, key) {
            return prefix + "[" + key + "]";
        },
        repeat: function(prefix) {
            return prefix;
        }
    }, isArray = Array.isArray, push = Array.prototype.push, pushToArray = function(arr, valueOrArray) {
        push.apply(arr, isArray(valueOrArray) ? valueOrArray : [ valueOrArray ]);
    }, toISO = Date.prototype.toISOString, defaults = {
        addQueryPrefix: !1,
        allowDots: !1,
        charset: "utf-8",
        charsetSentinel: !1,
        delimiter: "&",
        encode: !0,
        encoder: utils.encode,
        encodeValuesOnly: !1,
        formatter: formats.formatters[formats.default],
        indices: !1,
        serializeDate: function(date) {
            return toISO.call(date);
        },
        skipNulls: !1,
        strictNullHandling: !1
    }, stringify = function stringify(object, prefix, generateArrayPrefix, strictNullHandling, skipNulls, encoder, filter, sort, allowDots, serializeDate, formatter, encodeValuesOnly, charset) {
        var obj = object;
        if ("function" == typeof filter ? obj = filter(prefix, obj) : obj instanceof Date ? obj = serializeDate(obj) : "comma" === generateArrayPrefix && isArray(obj) && (obj = obj.join(",")), 
        null === obj) {
            if (strictNullHandling) return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder, charset) : prefix;
            obj = "";
        }
        if ("string" == typeof obj || "number" == typeof obj || "boolean" == typeof obj || utils.isBuffer(obj)) return encoder ? [ formatter(encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset)) + "=" + formatter(encoder(obj, defaults.encoder, charset)) ] : [ formatter(prefix) + "=" + formatter(String(obj)) ];
        var objKeys, values = [];
        if (void 0 === obj) return values;
        if (isArray(filter)) objKeys = filter; else {
            var keys = Object.keys(obj);
            objKeys = sort ? keys.sort(sort) : keys;
        }
        for (var i = 0; i < objKeys.length; ++i) {
            var key = objKeys[i];
            skipNulls && null === obj[key] || (isArray(obj) ? pushToArray(values, stringify(obj[key], "function" == typeof generateArrayPrefix ? generateArrayPrefix(prefix, key) : prefix, generateArrayPrefix, strictNullHandling, skipNulls, encoder, filter, sort, allowDots, serializeDate, formatter, encodeValuesOnly, charset)) : pushToArray(values, stringify(obj[key], prefix + (allowDots ? "." + key : "[" + key + "]"), generateArrayPrefix, strictNullHandling, skipNulls, encoder, filter, sort, allowDots, serializeDate, formatter, encodeValuesOnly, charset)));
        }
        return values;
    };
    module.exports = function(object, opts) {
        var objKeys, obj = object, options = (function(opts) {
            if (!opts) return defaults;
            if (null !== opts.encoder && void 0 !== opts.encoder && "function" != typeof opts.encoder) throw new TypeError("Encoder has to be a function.");
            var charset = opts.charset || defaults.charset;
            if (void 0 !== opts.charset && "utf-8" !== opts.charset && "iso-8859-1" !== opts.charset) throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
            var format = formats.default;
            if (void 0 !== opts.format) {
                if (!has.call(formats.formatters, opts.format)) throw new TypeError("Unknown format option provided.");
                format = opts.format;
            }
            var formatter = formats.formatters[format], filter = defaults.filter;
            return ("function" == typeof opts.filter || isArray(opts.filter)) && (filter = opts.filter), 
            {
                addQueryPrefix: "boolean" == typeof opts.addQueryPrefix ? opts.addQueryPrefix : defaults.addQueryPrefix,
                allowDots: void 0 === opts.allowDots ? defaults.allowDots : !!opts.allowDots,
                charset: charset,
                charsetSentinel: "boolean" == typeof opts.charsetSentinel ? opts.charsetSentinel : defaults.charsetSentinel,
                delimiter: void 0 === opts.delimiter ? defaults.delimiter : opts.delimiter,
                encode: "boolean" == typeof opts.encode ? opts.encode : defaults.encode,
                encoder: "function" == typeof opts.encoder ? opts.encoder : defaults.encoder,
                encodeValuesOnly: "boolean" == typeof opts.encodeValuesOnly ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
                filter: filter,
                formatter: formatter,
                serializeDate: "function" == typeof opts.serializeDate ? opts.serializeDate : defaults.serializeDate,
                skipNulls: "boolean" == typeof opts.skipNulls ? opts.skipNulls : defaults.skipNulls,
                sort: "function" == typeof opts.sort ? opts.sort : null,
                strictNullHandling: "boolean" == typeof opts.strictNullHandling ? opts.strictNullHandling : defaults.strictNullHandling
            };
        })(opts);
        "function" == typeof options.filter ? obj = (0, options.filter)("", obj) : isArray(options.filter) && (objKeys = options.filter);
        var arrayFormat, keys = [];
        if ("object" != typeof obj || null === obj) return "";
        arrayFormat = opts && opts.arrayFormat in arrayPrefixGenerators ? opts.arrayFormat : opts && "indices" in opts ? opts.indices ? "indices" : "repeat" : "indices";
        var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];
        objKeys || (objKeys = Object.keys(obj)), options.sort && objKeys.sort(options.sort);
        for (var i = 0; i < objKeys.length; ++i) {
            var key = objKeys[i];
            options.skipNulls && null === obj[key] || pushToArray(keys, stringify(obj[key], key, generateArrayPrefix, options.strictNullHandling, options.skipNulls, options.encode ? options.encoder : null, options.filter, options.sort, options.allowDots, options.serializeDate, options.formatter, options.encodeValuesOnly, options.charset));
        }
        var joined = keys.join(options.delimiter), prefix = !0 === options.addQueryPrefix ? "?" : "";
        return options.charsetSentinel && ("iso-8859-1" === options.charset ? prefix += "utf8=%26%2310003%3B&" : prefix += "utf8=%E2%9C%93&"), 
        joined.length > 0 ? prefix + joined : "";
    };
}
