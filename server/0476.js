function(module, exports, __webpack_require__) {
    "use strict";
    function Store() {}
    exports.Store = Store, Store.prototype.synchronous = !1, Store.prototype.findCookie = function(domain, path, key, cb) {
        throw new Error("findCookie is not implemented");
    }, Store.prototype.findCookies = function(domain, path, cb) {
        throw new Error("findCookies is not implemented");
    }, Store.prototype.putCookie = function(cookie, cb) {
        throw new Error("putCookie is not implemented");
    }, Store.prototype.updateCookie = function(oldCookie, newCookie, cb) {
        throw new Error("updateCookie is not implemented");
    }, Store.prototype.removeCookie = function(domain, path, key, cb) {
        throw new Error("removeCookie is not implemented");
    }, Store.prototype.removeCookies = function(domain, path, cb) {
        throw new Error("removeCookies is not implemented");
    }, Store.prototype.getAllCookies = function(cb) {
        throw new Error("getAllCookies is not implemented (therefore jar cannot be serialized)");
    };
}
