function(module, exports, __webpack_require__) {
    var wrappy = __webpack_require__(252);
    function once(fn) {
        var f = function() {
            return f.called ? f.value : (f.called = !0, f.value = fn.apply(this, arguments));
        };
        return f.called = !1, f;
    }
    function onceStrict(fn) {
        var f = function() {
            if (f.called) throw new Error(f.onceError);
            return f.called = !0, f.value = fn.apply(this, arguments);
        }, name = fn.name || "Function wrapped with `once`";
        return f.onceError = name + " shouldn't be called more than once", f.called = !1, 
        f;
    }
    module.exports = wrappy(once), module.exports.strict = wrappy(onceStrict), once.proto = once((function() {
        Object.defineProperty(Function.prototype, "once", {
            value: function() {
                return once(this);
            },
            configurable: !0
        }), Object.defineProperty(Function.prototype, "onceStrict", {
            value: function() {
                return onceStrict(this);
            },
            configurable: !0
        });
    }));
}
