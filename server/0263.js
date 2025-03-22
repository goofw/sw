function(module, exports, __webpack_require__) {
    var fs = __webpack_require__(2);
    module.exports = function(defaults) {
        var internalValues = {}, values = this.value = {};
        Object.keys(defaults).forEach((function(key) {
            internalValues[key] = defaults[key], Object.defineProperty(values, key, {
                get: function() {
                    return internalValues[key];
                },
                configurable: !1,
                enumerable: !0
            });
        })), this.reset = function() {
            return Object.keys(defaults).forEach((function(key) {
                internalValues[key] = defaults[key];
            })), this;
        }, this.merge = function(options, required) {
            if (options = options || {}, "[object Array]" === Object.prototype.toString.call(required)) {
                for (var missing = [], i = 0, l = required.length; i < l; ++i) {
                    var key = required[i];
                    key in options || missing.push(key);
                }
                if (missing.length > 0) throw missing.length > 1 ? new Error("options " + missing.slice(0, missing.length - 1).join(", ") + " and " + missing[missing.length - 1] + " must be defined") : new Error("option " + missing[0] + " must be defined");
            }
            return Object.keys(options).forEach((function(key) {
                key in internalValues && (internalValues[key] = options[key]);
            })), this;
        }, this.copy = function(keys) {
            var obj = {};
            return Object.keys(defaults).forEach((function(key) {
                -1 !== keys.indexOf(key) && (obj[key] = values[key]);
            })), obj;
        }, this.read = function(filename, cb) {
            if ("function" == typeof cb) {
                var self = this;
                fs.readFile(filename, (function(error, data) {
                    if (error) return cb(error);
                    var conf = JSON.parse(data);
                    self.merge(conf), cb();
                }));
            } else {
                var conf = JSON.parse(fs.readFileSync(filename));
                this.merge(conf);
            }
            return this;
        }, this.isDefined = function(key) {
            return void 0 !== values[key];
        }, this.isDefinedAndNonNull = function(key) {
            return null != values[key];
        }, Object.freeze(values), Object.freeze(this);
    };
}
