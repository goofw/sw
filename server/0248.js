function(module, exports, __webpack_require__) {
    "use strict";
    var has = Object.prototype.hasOwnProperty, isArray = Array.isArray, hexTable = (function() {
        for (var array = [], i = 0; i < 256; ++i) array.push("%" + ((i < 16 ? "0" : "") + i.toString(16)).toUpperCase());
        return array;
    })(), arrayToObject = function(source, options) {
        for (var obj = options && options.plainObjects ? Object.create(null) : {}, i = 0; i < source.length; ++i) void 0 !== source[i] && (obj[i] = source[i]);
        return obj;
    };
    module.exports = {
        arrayToObject: arrayToObject,
        assign: function(target, source) {
            return Object.keys(source).reduce((function(acc, key) {
                return acc[key] = source[key], acc;
            }), target);
        },
        combine: function(a, b) {
            return [].concat(a, b);
        },
        compact: function(value) {
            for (var queue = [ {
                obj: {
                    o: value
                },
                prop: "o"
            } ], refs = [], i = 0; i < queue.length; ++i) for (var item = queue[i], obj = item.obj[item.prop], keys = Object.keys(obj), j = 0; j < keys.length; ++j) {
                var key = keys[j], val = obj[key];
                "object" == typeof val && null !== val && -1 === refs.indexOf(val) && (queue.push({
                    obj: obj,
                    prop: key
                }), refs.push(val));
            }
            return (function(queue) {
                for (;queue.length > 1; ) {
                    var item = queue.pop(), obj = item.obj[item.prop];
                    if (isArray(obj)) {
                        for (var compacted = [], j = 0; j < obj.length; ++j) void 0 !== obj[j] && compacted.push(obj[j]);
                        item.obj[item.prop] = compacted;
                    }
                }
            })(queue), value;
        },
        decode: function(str, decoder, charset) {
            var strWithoutPlus = str.replace(/\+/g, " ");
            if ("iso-8859-1" === charset) return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
            try {
                return decodeURIComponent(strWithoutPlus);
            } catch (e) {
                return strWithoutPlus;
            }
        },
        encode: function(str, defaultEncoder, charset) {
            if (0 === str.length) return str;
            var string = "string" == typeof str ? str : String(str);
            if ("iso-8859-1" === charset) return escape(string).replace(/%u[0-9a-f]{4}/gi, (function($0) {
                return "%26%23" + parseInt($0.slice(2), 16) + "%3B";
            }));
            for (var out = "", i = 0; i < string.length; ++i) {
                var c = string.charCodeAt(i);
                45 === c || 46 === c || 95 === c || 126 === c || c >= 48 && c <= 57 || c >= 65 && c <= 90 || c >= 97 && c <= 122 ? out += string.charAt(i) : c < 128 ? out += hexTable[c] : c < 2048 ? out += hexTable[192 | c >> 6] + hexTable[128 | 63 & c] : c < 55296 || c >= 57344 ? out += hexTable[224 | c >> 12] + hexTable[128 | c >> 6 & 63] + hexTable[128 | 63 & c] : (i += 1, 
                c = 65536 + ((1023 & c) << 10 | 1023 & string.charCodeAt(i)), out += hexTable[240 | c >> 18] + hexTable[128 | c >> 12 & 63] + hexTable[128 | c >> 6 & 63] + hexTable[128 | 63 & c]);
            }
            return out;
        },
        isBuffer: function(obj) {
            return !(!obj || "object" != typeof obj || !(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj)));
        },
        isRegExp: function(obj) {
            return "[object RegExp]" === Object.prototype.toString.call(obj);
        },
        merge: function merge(target, source, options) {
            if (!source) return target;
            if ("object" != typeof source) {
                if (isArray(target)) target.push(source); else {
                    if (!target || "object" != typeof target) return [ target, source ];
                    (options && (options.plainObjects || options.allowPrototypes) || !has.call(Object.prototype, source)) && (target[source] = !0);
                }
                return target;
            }
            if (!target || "object" != typeof target) return [ target ].concat(source);
            var mergeTarget = target;
            return isArray(target) && !isArray(source) && (mergeTarget = arrayToObject(target, options)), 
            isArray(target) && isArray(source) ? (source.forEach((function(item, i) {
                if (has.call(target, i)) {
                    var targetItem = target[i];
                    targetItem && "object" == typeof targetItem && item && "object" == typeof item ? target[i] = merge(targetItem, item, options) : target.push(item);
                } else target[i] = item;
            })), target) : Object.keys(source).reduce((function(acc, key) {
                var value = source[key];
                return has.call(acc, key) ? acc[key] = merge(acc[key], value, options) : acc[key] = value, 
                acc;
            }), mergeTarget);
        }
    };
}
