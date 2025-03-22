function(module, exports, __webpack_require__) {
    "use strict";
    var tough = __webpack_require__(1040), Cookie = tough.Cookie, CookieJar = tough.CookieJar;
    function RequestJar(store) {
        this._jar = new CookieJar(store, {
            looseMode: !0
        });
    }
    exports.parse = function(str) {
        if (str && str.uri && (str = str.uri), "string" != typeof str) throw new Error("The cookie function only accepts STRING as param");
        return Cookie.parse(str, {
            loose: !0
        });
    }, RequestJar.prototype.setCookie = function(cookieOrStr, uri, options) {
        return this._jar.setCookieSync(cookieOrStr, uri, options || {});
    }, RequestJar.prototype.getCookieString = function(uri) {
        return this._jar.getCookieStringSync(uri);
    }, RequestJar.prototype.getCookies = function(uri) {
        return this._jar.getCookiesSync(uri);
    }, exports.jar = function(store) {
        return new RequestJar(store);
    };
}
