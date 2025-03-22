function(module, exports, __webpack_require__) {
    "use strict";
    var Store = __webpack_require__(476).Store, permuteDomain = __webpack_require__(477).permuteDomain, pathMatch = __webpack_require__(478).pathMatch, util = __webpack_require__(0);
    function MemoryCookieStore() {
        Store.call(this), this.idx = {};
    }
    util.inherits(MemoryCookieStore, Store), exports.MemoryCookieStore = MemoryCookieStore, 
    MemoryCookieStore.prototype.idx = null, MemoryCookieStore.prototype.synchronous = !0, 
    MemoryCookieStore.prototype.inspect = function() {
        return "{ idx: " + util.inspect(this.idx, !1, 2) + " }";
    }, util.inspect.custom && (MemoryCookieStore.prototype[util.inspect.custom] = MemoryCookieStore.prototype.inspect), 
    MemoryCookieStore.prototype.findCookie = function(domain, path, key, cb) {
        return this.idx[domain] && this.idx[domain][path] ? cb(null, this.idx[domain][path][key] || null) : cb(null, void 0);
    }, MemoryCookieStore.prototype.findCookies = function(domain, path, cb) {
        var pathMatcher, results = [];
        if (!domain) return cb(null, []);
        pathMatcher = path ? function(domainIndex) {
            Object.keys(domainIndex).forEach((function(cookiePath) {
                if (pathMatch(path, cookiePath)) {
                    var pathIndex = domainIndex[cookiePath];
                    for (var key in pathIndex) results.push(pathIndex[key]);
                }
            }));
        } : function(domainIndex) {
            for (var curPath in domainIndex) {
                var pathIndex = domainIndex[curPath];
                for (var key in pathIndex) results.push(pathIndex[key]);
            }
        };
        var domains = permuteDomain(domain) || [ domain ], idx = this.idx;
        domains.forEach((function(curDomain) {
            var domainIndex = idx[curDomain];
            domainIndex && pathMatcher(domainIndex);
        })), cb(null, results);
    }, MemoryCookieStore.prototype.putCookie = function(cookie, cb) {
        this.idx[cookie.domain] || (this.idx[cookie.domain] = {}), this.idx[cookie.domain][cookie.path] || (this.idx[cookie.domain][cookie.path] = {}), 
        this.idx[cookie.domain][cookie.path][cookie.key] = cookie, cb(null);
    }, MemoryCookieStore.prototype.updateCookie = function(oldCookie, newCookie, cb) {
        this.putCookie(newCookie, cb);
    }, MemoryCookieStore.prototype.removeCookie = function(domain, path, key, cb) {
        this.idx[domain] && this.idx[domain][path] && this.idx[domain][path][key] && delete this.idx[domain][path][key], 
        cb(null);
    }, MemoryCookieStore.prototype.removeCookies = function(domain, path, cb) {
        return this.idx[domain] && (path ? delete this.idx[domain][path] : delete this.idx[domain]), 
        cb(null);
    }, MemoryCookieStore.prototype.getAllCookies = function(cb) {
        var cookies = [], idx = this.idx;
        Object.keys(idx).forEach((function(domain) {
            Object.keys(idx[domain]).forEach((function(path) {
                Object.keys(idx[domain][path]).forEach((function(key) {
                    null !== key && cookies.push(idx[domain][path][key]);
                }));
            }));
        })), cookies.sort((function(a, b) {
            return (a.creationIndex || 0) - (b.creationIndex || 0);
        })), cb(null, cookies);
    };
}
