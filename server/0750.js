function(module, exports, __webpack_require__) {
    var http = __webpack_require__(11), https = __webpack_require__(22), url = __webpack_require__(7), EventEmitter = __webpack_require__(5).EventEmitter, Serializer = __webpack_require__(373), Deserializer = __webpack_require__(375);
    function Server(options, isSecure) {
        if (0 == this instanceof Server) return new Server(options, isSecure);
        var that = this;
        function handleMethodCall(request, response) {
            (new Deserializer).deserializeMethodCall(request, (function(error, methodName, params) {
                that._events.hasOwnProperty(methodName) ? that.emit(methodName, null, params, (function(error, value) {
                    var xml;
                    xml = null !== error ? Serializer.serializeFault(error) : Serializer.serializeMethodResponse(value), 
                    response.writeHead(200, {
                        "Content-Type": "text/xml"
                    }), response.end(xml);
                })) : (that.emit("NotFound", methodName, params), response.writeHead(404), response.end());
            }));
        }
        "string" == typeof options && ((options = url.parse(options)).host = options.hostname, 
        options.path = options.pathname), (isSecure ? https.createServer(options, handleMethodCall) : http.createServer(handleMethodCall)).listen(options.port, options.host);
    }
    Server.prototype.__proto__ = EventEmitter.prototype, module.exports = Server;
}
