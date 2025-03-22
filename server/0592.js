function(module, exports) {
    var Dict = module.exports = function() {
        Object.defineProperty(this, "_keys", {
            enumerable: !1,
            value: []
        });
    };
    Dict.prototype.binaryKeys = function() {
        return this._keys.slice();
    }, Dict.prototype.binarySet = function(key, value) {
        this._keys.push(key), this[key] = value;
    };
}
