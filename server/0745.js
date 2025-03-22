function(module, exports, __webpack_require__) {
    var http = __webpack_require__(11), https = __webpack_require__(22), url = __webpack_require__(7), Serializer = __webpack_require__(373), Deserializer = __webpack_require__(375);
    function Client(options, isSecure) {
        if (0 == this instanceof Client) return new Client(options, isSecure);
        "string" == typeof options && ((options = url.parse(options)).host = options.hostname, 
        options.path = options.pathname);
        var headers = {
            "User-Agent": "NodeJS XML-RPC Client",
            "Content-Type": "text/xml",
            Accept: "text/xml",
            "Accept-Charset": "UTF8",
            Connection: "Keep-Alive"
        };
        if (options.headers = options.headers || {}, null == options.headers.Authorization && null != options.basic_auth && null != options.basic_auth.user && null != options.basic_auth.pass) {
            var auth = options.basic_auth.user + ":" + options.basic_auth.pass;
            options.headers.Authorization = "Basic " + new Buffer(auth).toString("base64");
        }
        for (var attribute in headers) void 0 === options.headers[attribute] && (options.headers[attribute] = headers[attribute]);
        options.method = "POST", this.options = options, this.isSecure = isSecure;
    }
    Client.prototype.methodCall = function(method, params, callback) {
        var xml = Serializer.serializeMethodCall(method, params), transport = this.isSecure ? https : http, options = this.options;
        options.headers["Content-Length"] = Buffer.byteLength(xml, "utf8");
        var request = transport.request(options, (function(response) {
            404 == response.statusCode ? callback(new Error("Not Found")) : new Deserializer(options.responseEncoding).deserializeMethodResponse(response, callback);
        }));
        request.on("error", callback), request.write(xml, "utf8"), request.end();
    }, module.exports = Client;
}
