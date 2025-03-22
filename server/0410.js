function(module, exports, __webpack_require__) {
    "use strict";
    __webpack_require__(2);
    var util = __webpack_require__(0), debug = __webpack_require__(41)("matroska:httpSource"), http = __webpack_require__(411).http, https = __webpack_require__(411).https, Url = __webpack_require__(7), AbstractSource = __webpack_require__(206), httpSourceKey = 0;
    function HttpSource(url, configuration) {
        AbstractSource.call(this), this.configuration = configuration || {}, this.url = url;
    }
    util.inherits(HttpSource, AbstractSource), module.exports = HttpSource, HttpSource.prototype.getStream = function(session, params, callback) {
        switch (arguments.length) {
          case 1:
            callback = session, session = null;
            break;

          case 2:
            callback = options, options = null;
        }
        (session = session || {}).$httpSourceKey = httpSourceKey++;
        var options = Url.parse(this.url);
        options.headers = options.headers || {}, this.configuration.userAgent && (options.headers["User-Agent"] = this.configuration.userAgent), 
        params.start && (options.headers.Range = "bytes=" + params.start + "-" + (params.end ? params.end : "")), 
        debug.enabled && debug("Http request ", options, params);
        var get = "https:" === options.protocol ? https.get : http.get, request = get(options, (function(response) {
            if (debug("Response=", response.statusCode, response.statusMessage), 2 !== Math.floor(response.statusCode / 100)) return callback(new Error("Invalid status '" + response.statusCode + "' message='" + response.statusMessage + "' for url=" + this.url));
            if (params.start) {
                var pr, crange = response.headers["content-range"];
                if (crange) {
                    var rr = /bytes (\d+)-(\d+)\/(\d+)/g.exec(crange);
                    pr = rr && parseInt(rr[1], 10);
                }
                if (pr !== params.start) return callback(new Error("Invalid start range"));
            }
            debug("Response stream ..."), callback(null, response);
        }));
        request.on("error", (function(error) {
            debug("Error:", error), callback(error + " for url=" + this.url);
        }));
    }, HttpSource.prototype._end = function(session, callback) {
        debug("Close"), callback();
    }, HttpSource.prototype.toString = function() {
        return "[HttpSource url=" + this.url + "]";
    };
}
