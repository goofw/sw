function(module, exports, __webpack_require__) {
    "use strict";
    var Cache = module.exports = function() {
        this._cache = {};
    };
    Cache.prototype.put = function(key, value) {
        this._cache[key] = value;
    }, Cache.prototype.get = function(key) {
        return this._cache[key];
    }, Cache.prototype.del = function(key) {
        delete this._cache[key];
    }, Cache.prototype.clear = function() {
        this._cache = {};
    };
}
