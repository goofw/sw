function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(stream) {
        if (!stream) throw new TypeError("argument stream is required");
        if ("function" != typeof stream.unpipe) {
            if ((function(stream) {
                for (var listeners = stream.listeners("data"), i = 0; i < listeners.length; i++) if ("ondata" === listeners[i].name) return !0;
                return !1;
            })(stream)) for (var listener, listeners = stream.listeners("close"), i = 0; i < listeners.length; i++) "cleanup" !== (listener = listeners[i]).name && "onclose" !== listener.name || listener.call(stream);
        } else stream.unpipe();
    };
}
