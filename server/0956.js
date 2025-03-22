function(module, exports, __webpack_require__) {
    "use strict";
    var schedule, div, opts, toggleScheduled, div2, util = __webpack_require__(17), NativePromise = util.getNativePromise();
    if (util.isNode && "undefined" == typeof MutationObserver) {
        var GlobalSetImmediate = global.setImmediate, ProcessNextTick = process.nextTick;
        schedule = util.isRecentNode ? function(fn) {
            GlobalSetImmediate.call(global, fn);
        } : function(fn) {
            ProcessNextTick.call(process, fn);
        };
    } else if ("function" == typeof NativePromise && "function" == typeof NativePromise.resolve) {
        var nativePromise = NativePromise.resolve();
        schedule = function(fn) {
            nativePromise.then(fn);
        };
    } else schedule = "undefined" == typeof MutationObserver || "undefined" != typeof window && window.navigator && (window.navigator.standalone || window.cordova) ? "undefined" != typeof setImmediate ? function(fn) {
        setImmediate(fn);
    } : "undefined" != typeof setTimeout ? function(fn) {
        setTimeout(fn, 0);
    } : function() {
        throw new Error("No async scheduler available\n\n    See http://goo.gl/MqrFmX\n");
    } : (div = document.createElement("div"), opts = {
        attributes: !0
    }, toggleScheduled = !1, div2 = document.createElement("div"), new MutationObserver((function() {
        div.classList.toggle("foo"), toggleScheduled = !1;
    })).observe(div2, opts), function(fn) {
        var o = new MutationObserver((function() {
            o.disconnect(), fn();
        }));
        o.observe(div, opts), toggleScheduled || (toggleScheduled = !0, div2.classList.toggle("foo"));
    });
    module.exports = schedule;
}
