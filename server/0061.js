function(module, exports, __webpack_require__) {
    "use strict";
    var http = __webpack_require__(11);
    module.exports = http.METHODS && http.METHODS.map((function(method) {
        return method.toLowerCase();
    })) || [ "get", "post", "put", "head", "delete", "options", "trace", "copy", "lock", "mkcol", "move", "purge", "propfind", "proppatch", "unlock", "report", "mkactivity", "checkout", "merge", "m-search", "notify", "subscribe", "unsubscribe", "patch", "search", "connect" ];
}
