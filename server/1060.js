function(module, exports, __webpack_require__) {
    var mod_assert = __webpack_require__(15), mod_extsprintf = (__webpack_require__(0), 
    __webpack_require__(1061)), mod_verror = __webpack_require__(1062), mod_jsonschema = __webpack_require__(1065);
    function hasKey(obj, key) {
        return mod_assert.equal(typeof key, "string"), Object.prototype.hasOwnProperty.call(obj, key);
    }
    function pluckv(obj, key) {
        if (null !== obj && "object" == typeof obj) {
            if (obj.hasOwnProperty(key)) return obj[key];
            var i = key.indexOf(".");
            if (-1 != i) {
                var key1 = key.substr(0, i);
                if (obj.hasOwnProperty(key1)) return pluckv(obj[key1], key.substr(i + 1));
            }
        }
    }
    function doFlattenIter(data, depth, accum, callback) {
        var each, key;
        if (0 === depth) return (each = accum.slice(0)).push(data), void callback(each);
        for (key in mod_assert.ok(null !== data), mod_assert.equal(typeof data, "object"), 
        mod_assert.equal(typeof depth, "number"), mod_assert.ok(depth >= 0), data) (each = accum.slice(0)).push(key), 
        doFlattenIter(data[key], depth - 1, each, callback);
    }
    exports.deepCopy = function deepCopy(obj) {
        var ret, key, marker = "__deepCopy";
        if (obj && obj[marker]) throw new Error("attempted deep copy of cyclic object");
        if (obj && obj.constructor == Object) {
            for (key in ret = {}, obj[marker] = !0, obj) key != marker && (ret[key] = deepCopy(obj[key]));
            return delete obj[marker], ret;
        }
        if (obj && obj.constructor == Array) {
            for (ret = [], obj[marker] = !0, key = 0; key < obj.length; key++) ret.push(deepCopy(obj[key]));
            return delete obj[marker], ret;
        }
        return obj;
    }, exports.deepEqual = function deepEqual(obj1, obj2) {
        if (typeof obj1 != typeof obj2) return !1;
        if (null === obj1 || null === obj2 || "object" != typeof obj1) return obj1 === obj2;
        if (obj1.constructor != obj2.constructor) return !1;
        var k;
        for (k in obj1) {
            if (!obj2.hasOwnProperty(k)) return !1;
            if (!deepEqual(obj1[k], obj2[k])) return !1;
        }
        for (k in obj2) if (!obj1.hasOwnProperty(k)) return !1;
        return !0;
    }, exports.isEmpty = function(obj) {
        var key;
        for (key in obj) return !1;
        return !0;
    }, exports.hasKey = hasKey, exports.forEachKey = function(obj, callback) {
        for (var key in obj) hasKey(obj, key) && callback(key, obj[key]);
    }, exports.pluck = function(obj, key) {
        return mod_assert.equal(typeof key, "string"), pluckv(obj, key);
    }, exports.flattenObject = function flattenObject(data, depth) {
        if (0 === depth) return [ data ];
        mod_assert.ok(null !== data), mod_assert.equal(typeof data, "object"), mod_assert.equal(typeof depth, "number"), 
        mod_assert.ok(depth >= 0);
        var key, rv = [];
        for (key in data) flattenObject(data[key], depth - 1).forEach((function(p) {
            rv.push([ key ].concat(p));
        }));
        return rv;
    }, exports.flattenIter = function(data, depth, callback) {
        doFlattenIter(data, depth, [], callback);
    }, exports.validateJsonObject = validateJsonObjectJS, exports.validateJsonObjectJS = validateJsonObjectJS, 
    exports.randElt = function(arr) {
        return mod_assert.ok(Array.isArray(arr) && arr.length > 0, "randElt argument must be a non-empty array"), 
        arr[Math.floor(Math.random() * arr.length)];
    }, exports.extraProperties = function(obj, allowed) {
        mod_assert.ok("object" == typeof obj && null !== obj, "obj argument must be a non-null object"), 
        mod_assert.ok(Array.isArray(allowed), "allowed argument must be an array of strings");
        for (var i = 0; i < allowed.length; i++) mod_assert.ok("string" == typeof allowed[i], "allowed argument must be an array of strings");
        return Object.keys(obj).filter((function(key) {
            return -1 === allowed.indexOf(key);
        }));
    }, exports.mergeObjects = mergeObjects, exports.startsWith = function(str, prefix) {
        return str.substr(0, prefix.length) == prefix;
    }, exports.endsWith = function(str, suffix) {
        return str.substr(str.length - suffix.length, suffix.length) == suffix;
    }, exports.parseInteger = function(str, uopts) {
        mod_assert.string(str, "str"), mod_assert.optionalObject(uopts, "options");
        var c, baseOverride = !1, options = PI_DEFAULTS;
        uopts && (baseOverride = hasKey(uopts, "base"), options = mergeObjects(options, uopts), 
        mod_assert.number(options.base, "options.base"), mod_assert.ok(options.base >= 2, "options.base >= 2"), 
        mod_assert.ok(options.base <= 36, "options.base <= 36"), mod_assert.bool(options.allowSign, "options.allowSign"), 
        mod_assert.bool(options.allowPrefix, "options.allowPrefix"), mod_assert.bool(options.allowTrailing, "options.allowTrailing"), 
        mod_assert.bool(options.allowImprecise, "options.allowImprecise"), mod_assert.bool(options.trimWhitespace, "options.trimWhitespace"), 
        mod_assert.bool(options.leadingZeroIsOctal, "options.leadingZeroIsOctal"), options.leadingZeroIsOctal && mod_assert.ok(!baseOverride, '"base" and "leadingZeroIsOctal" are mutually exclusive'));
        var start, d, pbase = -1, base = options.base, mult = 1, value = 0, idx = 0, len = str.length;
        if (options.trimWhitespace) for (;idx < len && isSpace(str.charCodeAt(idx)); ) ++idx;
        for (options.allowSign && ("-" === str[idx] ? (idx += 1, mult = -1) : "+" === str[idx] && (idx += 1)), 
        "0" === str[idx] && (options.allowPrefix && (pbase = (function(c) {
            return 98 === c || 66 === c ? 2 : 111 === c || 79 === c ? 8 : 116 === c || 84 === c ? 10 : 120 === c || 88 === c ? 16 : -1;
        })(str.charCodeAt(idx + 1)), -1 === pbase || baseOverride && pbase !== base || (base = pbase, 
        idx += 2)), -1 === pbase && options.leadingZeroIsOctal && (base = 8)), start = idx; idx < len && -1 != (c = (d = str.charCodeAt(idx)) >= 48 && d <= 57 ? d - 48 : d >= 65 && d <= 90 ? d - 55 : d >= 97 && d <= 122 ? d - 87 : -1) && c < base; ++idx) value *= base, 
        value += c;
        if (start === idx) return new Error("invalid number: " + JSON.stringify(str));
        if (options.trimWhitespace) for (;idx < len && isSpace(str.charCodeAt(idx)); ) ++idx;
        if (idx < len && !options.allowTrailing) return new Error("trailing characters after number: " + JSON.stringify(str.slice(idx)));
        if (0 === value) return 0;
        var result = value * mult;
        return !options.allowImprecise && (value > MAX_SAFE_INTEGER || result < MIN_SAFE_INTEGER) ? new Error("number is outside of the supported range: " + JSON.stringify(str.slice(start, idx))) : result;
    }, exports.iso8601 = function(d) {
        return "number" == typeof d && (d = new Date(d)), mod_assert.ok(d.constructor === Date), 
        mod_extsprintf.sprintf("%4d-%02d-%02dT%02d:%02d:%02d.%03dZ", d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds());
    }, exports.rfc1123 = function(date) {
        return mod_extsprintf.sprintf("%s, %02d %s %04d %02d:%02d:%02d GMT", RFC1123_DAYS[date.getUTCDay()], date.getUTCDate(), RFC1123_MONTHS[date.getUTCMonth()], date.getUTCFullYear(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    }, exports.parseDateTime = function(str) {
        var numeric = +str;
        return isNaN(numeric) ? new Date(str) : new Date(numeric);
    }, exports.hrtimediff = hrtimeDiff, exports.hrtimeDiff = hrtimeDiff, exports.hrtimeAccum = hrtimeAccum, 
    exports.hrtimeAdd = function(a, b) {
        return assertHrtime(a), hrtimeAccum([ a[0], a[1] ], b);
    }, exports.hrtimeNanosec = function(a) {
        return assertHrtime(a), Math.floor(1e9 * a[0] + a[1]);
    }, exports.hrtimeMicrosec = function(a) {
        return assertHrtime(a), Math.floor(1e6 * a[0] + a[1] / 1e3);
    }, exports.hrtimeMillisec = function(a) {
        return assertHrtime(a), Math.floor(1e3 * a[0] + a[1] / 1e6);
    };
    var RFC1123_MONTHS = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ], RFC1123_DAYS = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ], MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991, MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER || -9007199254740991, PI_DEFAULTS = {
        base: 10,
        allowSign: !0,
        allowPrefix: !1,
        allowTrailing: !1,
        allowImprecise: !1,
        trimWhitespace: !1,
        leadingZeroIsOctal: !1
    };
    function isSpace(c) {
        return 32 === c || c >= 9 && c <= 13 || 160 === c || 5760 === c || 6158 === c || c >= 8192 && c <= 8202 || 8232 === c || 8233 === c || 8239 === c || 8287 === c || 12288 === c || 65279 === c;
    }
    function validateJsonObjectJS(schema, input) {
        var report = mod_jsonschema.validate(input, schema);
        if (0 === report.errors.length) return null;
        var i, j, error = report.errors[0], propname = error.property, reason = error.message.toLowerCase();
        -1 != (i = reason.indexOf("the property ")) && -1 != (j = reason.indexOf(" is not defined in the schema and the schema does not allow additional properties")) && (i += "the property ".length, 
        propname = "" === propname ? reason.substr(i, j - i) : propname + "." + reason.substr(i, j - i), 
        reason = "unsupported property");
        var rv = new mod_verror.VError('property "%s": %s', propname, reason);
        return rv.jsv_details = error, rv;
    }
    function assertHrtime(a) {
        mod_assert.ok(a[0] >= 0 && a[1] >= 0, "negative numbers not allowed in hrtimes"), 
        mod_assert.ok(a[1] < 1e9, "nanoseconds column overflow");
    }
    function hrtimeDiff(a, b) {
        assertHrtime(a), assertHrtime(b), mod_assert.ok(a[0] > b[0] || a[0] == b[0] && a[1] >= b[1], "negative differences not allowed");
        var rv = [ a[0] - b[0], 0 ];
        return a[1] >= b[1] ? rv[1] = a[1] - b[1] : (rv[0]--, rv[1] = 1e9 - (b[1] - a[1])), 
        rv;
    }
    function hrtimeAccum(a, b) {
        return assertHrtime(a), assertHrtime(b), a[1] += b[1], a[1] >= 1e9 && (a[0]++, a[1] -= 1e9), 
        a[0] += b[0], a;
    }
    function mergeObjects(provided, overrides, defaults) {
        var rv, k;
        if (rv = {}, defaults) for (k in defaults) rv[k] = defaults[k];
        if (provided) for (k in provided) rv[k] = provided[k];
        if (overrides) for (k in overrides) rv[k] = overrides[k];
        return rv;
    }
}
