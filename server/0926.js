function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(Promise, PromiseArray, tryConvertToPromise, apiRejection) {
        var Es6Map, util = __webpack_require__(16), isObject = util.isObject, es5 = __webpack_require__(66);
        "function" == typeof Map && (Es6Map = Map);
        var mapToEntries = (function() {
            var index = 0, size = 0;
            function extractEntry(value, key) {
                this[index] = value, this[index + size] = key, index++;
            }
            return function(map) {
                size = map.size, index = 0;
                var ret = new Array(2 * map.size);
                return map.forEach(extractEntry, ret), ret;
            };
        })();
        function PropertiesPromiseArray(obj) {
            var entries, isMap = !1;
            if (void 0 !== Es6Map && obj instanceof Es6Map) entries = mapToEntries(obj), isMap = !0; else {
                var keys = es5.keys(obj), len = keys.length;
                entries = new Array(2 * len);
                for (var i = 0; i < len; ++i) {
                    var key = keys[i];
                    entries[i] = obj[key], entries[i + len] = key;
                }
            }
            this.constructor$(entries), this._isMap = isMap, this._init$(void 0, isMap ? -6 : -3);
        }
        function props(promises) {
            var ret, castValue = tryConvertToPromise(promises);
            return isObject(castValue) ? (ret = castValue instanceof Promise ? castValue._then(Promise.props, void 0, void 0, void 0, void 0) : new PropertiesPromiseArray(castValue).promise(), 
            castValue instanceof Promise && ret._propagateFrom(castValue, 2), ret) : apiRejection("cannot await properties of a non-object\n\n    See http://goo.gl/MqrFmX\n");
        }
        util.inherits(PropertiesPromiseArray, PromiseArray), PropertiesPromiseArray.prototype._init = function() {}, 
        PropertiesPromiseArray.prototype._promiseFulfilled = function(value, index) {
            if (this._values[index] = value, ++this._totalResolved >= this._length) {
                var val;
                if (this._isMap) val = (function(entries) {
                    for (var ret = new Es6Map, length = entries.length / 2 | 0, i = 0; i < length; ++i) {
                        var key = entries[length + i], value = entries[i];
                        ret.set(key, value);
                    }
                    return ret;
                })(this._values); else {
                    val = {};
                    for (var keyOffset = this.length(), i = 0, len = this.length(); i < len; ++i) val[this._values[i + keyOffset]] = this._values[i];
                }
                return this._resolve(val), !0;
            }
            return !1;
        }, PropertiesPromiseArray.prototype.shouldCopyValues = function() {
            return !1;
        }, PropertiesPromiseArray.prototype.getActualLength = function(len) {
            return len >> 1;
        }, Promise.prototype.props = function() {
            return props(this);
        }, Promise.props = function(promises) {
            return props(promises);
        };
    };
}
