function(module, exports, __webpack_require__) {
    var Client = __webpack_require__(745), Server = __webpack_require__(750), xmlrpc = exports;
    xmlrpc.createClient = function(options) {
        return new Client(options, !1);
    }, xmlrpc.createSecureClient = function(options) {
        return new Client(options, !0);
    }, xmlrpc.createServer = function(options) {
        return new Server(options, !1);
    }, xmlrpc.createSecureServer = function(options) {
        return new Server(options, !0);
    };
}
