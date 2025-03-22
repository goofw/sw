function(module, exports, __webpack_require__) {
    var directory = __webpack_require__(1151), Stream = __webpack_require__(3);
    Stream.Writable && Stream.Writable.prototype.destroy || (Stream = __webpack_require__(77)), 
    module.exports = {
        url: function(request, params, options) {
            if ("string" == typeof params && (params = {
                url: params
            }), !params.url) throw "URL missing";
            params.headers = params.headers || {};
            var source = {
                stream: function(offset, length) {
                    var options = Object.create(params);
                    return options.headers = Object.create(params.headers), options.headers.range = "bytes=" + offset + "-" + (length || ""), 
                    request(options);
                },
                size: function() {
                    return new Promise((function(resolve, reject) {
                        var req = request(params);
                        req.on("response", (function(d) {
                            req.abort(), d.headers["content-length"] ? resolve(d.headers["content-length"]) : reject(new Error("Missing content length header"));
                        })).on("error", reject);
                    }));
                }
            };
            return directory(source, options);
        }
    };
}
