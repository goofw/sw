function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(msg, listener) {
        return !1 !== isFinished(msg) ? (defer(listener, null, msg), msg) : ((function(msg, listener) {
            var attached = msg.__onFinished;
            attached && attached.queue || (attached = msg.__onFinished = (function(msg) {
                function listener(err) {
                    if (msg.__onFinished === listener && (msg.__onFinished = null), listener.queue) {
                        var queue = listener.queue;
                        listener.queue = null;
                        for (var i = 0; i < queue.length; i++) queue[i](err, msg);
                    }
                }
                return listener.queue = [], listener;
            })(msg), (function(msg, callback) {
                var eeMsg, eeSocket, finished = !1;
                function onFinish(error) {
                    eeMsg.cancel(), eeSocket.cancel(), finished = !0, callback(error);
                }
                function onSocket(socket) {
                    msg.removeListener("socket", onSocket), finished || eeMsg === eeSocket && (eeSocket = first([ [ socket, "error", "close" ] ], onFinish));
                }
                eeMsg = eeSocket = first([ [ msg, "end", "finish" ] ], onFinish), msg.socket ? onSocket(msg.socket) : (msg.on("socket", onSocket), 
                void 0 === msg.socket && (function(res, callback) {
                    var assignSocket = res.assignSocket;
                    "function" == typeof assignSocket && (res.assignSocket = function(socket) {
                        assignSocket.call(this, socket), callback(socket);
                    });
                })(msg, onSocket));
            })(msg, attached)), attached.queue.push(listener);
        })(msg, listener), msg);
    }, module.exports.isFinished = isFinished;
    var first = __webpack_require__(545), defer = "function" == typeof setImmediate ? setImmediate : function(fn) {
        process.nextTick(fn.bind.apply(fn, arguments));
    };
    function isFinished(msg) {
        var socket = msg.socket;
        return "boolean" == typeof msg.finished ? Boolean(msg.finished || socket && !socket.writable) : "boolean" == typeof msg.complete ? Boolean(msg.upgrade || !socket || !socket.readable || msg.complete && !msg.readable) : void 0;
    }
}
