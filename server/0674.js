function(module, exports, __webpack_require__) {
    var nativeHttps = __webpack_require__(22), nativeHttp = __webpack_require__(11), url = __webpack_require__(7), _ = __webpack_require__(675), protocols = (module.exports.maxRedirects = 5, 
    {
        https: nativeHttps,
        http: nativeHttp
    });
    for (var protocol in protocols) {
        var h = function() {};
        h.prototype = protocols[protocol], h = new h, module.exports[protocol] = h, h.request = (function(h) {
            return function(options, callback, redirectOptions) {
                redirectOptions = redirectOptions || {};
                var reqUrl, max = "object" == typeof options && "maxRedirects" in options ? options.maxRedirects : exports.maxRedirects, redirect = _.extend({
                    count: 0,
                    max: max,
                    clientRequest: null,
                    userCallback: callback
                }, redirectOptions);
                if (redirect.count > redirect.max) {
                    var err = new Error("Max redirects exceeded. To allow more redirects, pass options.maxRedirects property.");
                    return redirect.clientRequest.emit("error", err), redirect.clientRequest;
                }
                redirect.count++, reqUrl = "string" == typeof options ? options : url.format(_.extend({
                    protocol: protocol
                }, options));
                var clientRequest = h.__proto__.request(options, (function redirectCallback(reqUrl, redirect) {
                    return function(res) {
                        if (res.statusCode < 300 || res.statusCode > 399) return redirect.userCallback(res);
                        if (!("location" in res.headers)) return redirect.userCallback(res);
                        var redirectUrl = url.resolve(reqUrl, res.headers.location), proto = url.parse(redirectUrl).protocol;
                        return proto = proto.substr(0, proto.length - 1), module.exports[proto].get(redirectUrl, redirectCallback(reqUrl, redirect), redirect);
                    };
                })(reqUrl, redirect));
                return redirect.clientRequest || (redirect.clientRequest = clientRequest), clientRequest;
            };
        })(h), h.get = (function(h) {
            return function(options, cb, redirectOptions) {
                var req = h.request(options, cb, redirectOptions);
                return req.end(), req;
            };
        })(h);
    }
}
