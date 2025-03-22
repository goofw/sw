function(module, exports, __webpack_require__) {
    var querystring = __webpack_require__(28);
    function toUInt32(n) {
        var buf = new Buffer(4);
        return buf.writeUInt32BE(n, 0), buf;
    }
    exports.IPV4_RE = /^[\d\.]+$/, exports.IPV6_RE = /^[\da-fA-F:]+$/, exports.CONNECTION_ID = Buffer.concat([ toUInt32(1047), toUInt32(655366528) ]), 
    exports.ACTIONS = {
        CONNECT: 0,
        ANNOUNCE: 1,
        SCRAPE: 2,
        ERROR: 3
    }, exports.EVENTS = {
        update: 0,
        completed: 1,
        started: 2,
        stopped: 3
    }, exports.EVENT_IDS = {
        0: "update",
        1: "completed",
        2: "started",
        3: "stopped"
    }, exports.EVENT_NAMES = {
        update: "update",
        completed: "complete",
        started: "start",
        stopped: "stop"
    }, exports.toUInt32 = toUInt32, exports.querystringParse = function(q) {
        var saved = querystring.unescape;
        querystring.unescape = unescape;
        var ret = querystring.parse(q);
        return querystring.unescape = saved, ret;
    }, exports.querystringStringify = function(obj) {
        var saved = querystring.escape;
        querystring.escape = escape;
        var ret = querystring.stringify(obj);
        return ret = ret.replace(/[\@\*\/\+]/g, (function(char) {
            return "%" + char.charCodeAt(0).toString(16).toUpperCase();
        })), querystring.escape = saved, ret;
    };
}
