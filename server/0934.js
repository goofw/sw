function(module, exports, __webpack_require__) {
    "use strict";
    var url = __webpack_require__(7), isUrl = /^https?:/;
    function Redirect(request) {
        this.request = request, this.followRedirect = !0, this.followRedirects = !0, this.followAllRedirects = !1, 
        this.followOriginalHttpMethod = !1, this.allowRedirect = function() {
            return !0;
        }, this.maxRedirects = 10, this.redirects = [], this.redirectsFollowed = 0, this.removeRefererHeader = !1;
    }
    Redirect.prototype.onRequest = function(options) {
        void 0 !== options.maxRedirects && (this.maxRedirects = options.maxRedirects), "function" == typeof options.followRedirect && (this.allowRedirect = options.followRedirect), 
        void 0 !== options.followRedirect && (this.followRedirects = !!options.followRedirect), 
        void 0 !== options.followAllRedirects && (this.followAllRedirects = options.followAllRedirects), 
        (this.followRedirects || this.followAllRedirects) && (this.redirects = this.redirects || []), 
        void 0 !== options.removeRefererHeader && (this.removeRefererHeader = options.removeRefererHeader), 
        void 0 !== options.followOriginalHttpMethod && (this.followOriginalHttpMethod = options.followOriginalHttpMethod);
    }, Redirect.prototype.redirectTo = function(response) {
        var request = this.request, redirectTo = null;
        if (response.statusCode >= 300 && response.statusCode < 400 && response.caseless.has("location")) {
            var location = response.caseless.get("location");
            if (request.debug("redirect", location), this.followAllRedirects) redirectTo = location; else if (this.followRedirects) switch (request.method) {
              case "PATCH":
              case "PUT":
              case "POST":
              case "DELETE":
                break;

              default:
                redirectTo = location;
            }
        } else if (401 === response.statusCode) {
            var authHeader = request._auth.onResponse(response);
            authHeader && (request.setHeader("authorization", authHeader), redirectTo = request.uri);
        }
        return redirectTo;
    }, Redirect.prototype.onResponse = function(response) {
        var request = this.request, redirectTo = this.redirectTo(response);
        if (!redirectTo || !this.allowRedirect.call(request, response)) return !1;
        if (request.debug("redirect to", redirectTo), response.resume && response.resume(), 
        this.redirectsFollowed >= this.maxRedirects) return request.emit("error", new Error("Exceeded maxRedirects. Probably stuck in a redirect loop " + request.uri.href)), 
        !1;
        this.redirectsFollowed += 1, isUrl.test(redirectTo) || (redirectTo = url.resolve(request.uri.href, redirectTo));
        var uriPrev = request.uri;
        return request.uri = url.parse(redirectTo), request.uri.protocol !== uriPrev.protocol && delete request.agent, 
        this.redirects.push({
            statusCode: response.statusCode,
            redirectUri: redirectTo
        }), this.followAllRedirects && "HEAD" !== request.method && 401 !== response.statusCode && 307 !== response.statusCode && (request.method = this.followOriginalHttpMethod ? request.method : "GET"), 
        delete request.src, delete request.req, delete request._started, 401 !== response.statusCode && 307 !== response.statusCode && (delete request.body, 
        delete request._form, request.headers && (request.removeHeader("host"), request.removeHeader("content-type"), 
        request.removeHeader("content-length"), request.uri.hostname !== request.originalHost.split(":")[0] && request.removeHeader("authorization"))), 
        this.removeRefererHeader || request.setHeader("referer", uriPrev.href), request.emit("redirect"), 
        request.init(), !0;
    }, exports.Redirect = Redirect;
}
