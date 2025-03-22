function(module, exports, __webpack_require__) {
    "use strict";
    var WS = module.exports = __webpack_require__(262);
    WS.Server = __webpack_require__(610), WS.Sender = __webpack_require__(264), WS.Receiver = __webpack_require__(267), 
    WS.createServer = function(options, fn) {
        var server = new WS.Server(options);
        return "function" == typeof fn && server.on("connection", fn), server;
    }, WS.connect = WS.createConnection = function(address, fn) {
        var client = new WS(address);
        return "function" == typeof fn && client.on("open", fn), client;
    };
}
