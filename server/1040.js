function(module, exports, __webpack_require__) {
    "use strict";
    var punycode, net = __webpack_require__(42), urlParse = __webpack_require__(7).parse, util = __webpack_require__(0), pubsuffix = __webpack_require__(474), Store = __webpack_require__(476).Store, MemoryCookieStore = __webpack_require__(1043).MemoryCookieStore, pathMatch = __webpack_require__(478).pathMatch, VERSION = __webpack_require__(1044).version;
    try {
        punycode = __webpack_require__(475);
    } catch (e) {
        console.warn("tough-cookie: can't load punycode; won't use punycode for domain normalization");
    }
    var COOKIE_OCTETS = /^[\x21\x23-\x2B\x2D-\x3A\x3C-\x5B\x5D-\x7E]+$/, CONTROL_CHARS = /[\x00-\x1F]/, TERMINATORS = [ "\n", "\r", "\0" ], PATH_VALUE = /[\x20-\x3A\x3C-\x7E]+/, DATE_DELIM = /[\x09\x20-\x2F\x3B-\x40\x5B-\x60\x7B-\x7E]/, MONTH_TO_NUM = {
        jan: 0,
        feb: 1,
        mar: 2,
        apr: 3,
        may: 4,
        jun: 5,
        jul: 6,
        aug: 7,
        sep: 8,
        oct: 9,
        nov: 10,
        dec: 11
    }, NUM_TO_MONTH = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ], NUM_TO_DAY = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];
    function parseDigits(token, minDigits, maxDigits, trailingOK) {
        for (var count = 0; count < token.length; ) {
            var c = token.charCodeAt(count);
            if (c <= 47 || c >= 58) break;
            count++;
        }
        return count < minDigits || count > maxDigits ? null : trailingOK || count == token.length ? parseInt(token.substr(0, count), 10) : null;
    }
    function parseTime(token) {
        var parts = token.split(":"), result = [ 0, 0, 0 ];
        if (3 !== parts.length) return null;
        for (var i = 0; i < 3; i++) {
            var trailingOK = 2 == i, num = parseDigits(parts[i], 1, 2, trailingOK);
            if (null === num) return null;
            result[i] = num;
        }
        return result;
    }
    function parseMonth(token) {
        token = String(token).substr(0, 3).toLowerCase();
        var num = MONTH_TO_NUM[token];
        return num >= 0 ? num : null;
    }
    function parseDate(str) {
        if (str) {
            var tokens = str.split(DATE_DELIM);
            if (tokens) {
                for (var hour = null, minute = null, second = null, dayOfMonth = null, month = null, year = null, i = 0; i < tokens.length; i++) {
                    var result, token = tokens[i].trim();
                    token.length && (null === second && (result = parseTime(token)) ? (hour = result[0], 
                    minute = result[1], second = result[2]) : null !== dayOfMonth || null === (result = parseDigits(token, 1, 2, !0)) ? null !== month || null === (result = parseMonth(token)) ? null === year && null !== (result = parseDigits(token, 2, 4, !0)) && ((year = result) >= 70 && year <= 99 ? year += 1900 : year >= 0 && year <= 69 && (year += 2e3)) : month = result : dayOfMonth = result);
                }
                if (!(null === dayOfMonth || null === month || null === year || null === second || dayOfMonth < 1 || dayOfMonth > 31 || year < 1601 || hour > 23 || minute > 59 || second > 59)) return new Date(Date.UTC(year, month, dayOfMonth, hour, minute, second));
            }
        }
    }
    function formatDate(date) {
        var d = date.getUTCDate();
        d = d >= 10 ? d : "0" + d;
        var h = date.getUTCHours();
        h = h >= 10 ? h : "0" + h;
        var m = date.getUTCMinutes();
        m = m >= 10 ? m : "0" + m;
        var s = date.getUTCSeconds();
        return s = s >= 10 ? s : "0" + s, NUM_TO_DAY[date.getUTCDay()] + ", " + d + " " + NUM_TO_MONTH[date.getUTCMonth()] + " " + date.getUTCFullYear() + " " + h + ":" + m + ":" + s + " GMT";
    }
    function canonicalDomain(str) {
        return null == str ? null : (str = str.trim().replace(/^\./, ""), punycode && /[^\u0001-\u007f]/.test(str) && (str = punycode.toASCII(str)), 
        str.toLowerCase());
    }
    function domainMatch(str, domStr, canonicalize) {
        if (null == str || null == domStr) return null;
        if (!1 !== canonicalize && (str = canonicalDomain(str), domStr = canonicalDomain(domStr)), 
        str == domStr) return !0;
        if (net.isIP(str)) return !1;
        var idx = str.indexOf(domStr);
        return !(idx <= 0) && str.length === domStr.length + idx && "." === str.substr(idx - 1, 1);
    }
    function defaultPath(path) {
        if (!path || "/" !== path.substr(0, 1)) return "/";
        if ("/" === path) return path;
        var rightSlash = path.lastIndexOf("/");
        return 0 === rightSlash ? "/" : path.slice(0, rightSlash);
    }
    function parse(str, options) {
        options && "object" == typeof options || (options = {});
        var firstSemi = (str = str.trim()).indexOf(";"), c = (function(cookiePair, looseMode) {
            var cookieName, cookieValue, firstEq = (cookiePair = (function(str) {
                for (var t = 0; t < TERMINATORS.length; t++) {
                    var terminatorIdx = str.indexOf(TERMINATORS[t]);
                    -1 !== terminatorIdx && (str = str.substr(0, terminatorIdx));
                }
                return str;
            })(cookiePair)).indexOf("=");
            if (looseMode) 0 === firstEq && (firstEq = (cookiePair = cookiePair.substr(1)).indexOf("=")); else if (firstEq <= 0) return;
            if (firstEq <= 0 ? (cookieName = "", cookieValue = cookiePair.trim()) : (cookieName = cookiePair.substr(0, firstEq).trim(), 
            cookieValue = cookiePair.substr(firstEq + 1).trim()), !CONTROL_CHARS.test(cookieName) && !CONTROL_CHARS.test(cookieValue)) {
                var c = new Cookie;
                return c.key = cookieName, c.value = cookieValue, c;
            }
        })(-1 === firstSemi ? str : str.substr(0, firstSemi), !!options.loose);
        if (c) {
            if (-1 === firstSemi) return c;
            var unparsed = str.slice(firstSemi + 1).trim();
            if (0 === unparsed.length) return c;
            for (var cookie_avs = unparsed.split(";"); cookie_avs.length; ) {
                var av = cookie_avs.shift().trim();
                if (0 !== av.length) {
                    var av_key, av_value, av_sep = av.indexOf("=");
                    switch (-1 === av_sep ? (av_key = av, av_value = null) : (av_key = av.substr(0, av_sep), 
                    av_value = av.substr(av_sep + 1)), av_key = av_key.trim().toLowerCase(), av_value && (av_value = av_value.trim()), 
                    av_key) {
                      case "expires":
                        if (av_value) {
                            var exp = parseDate(av_value);
                            exp && (c.expires = exp);
                        }
                        break;

                      case "max-age":
                        if (av_value && /^-?[0-9]+$/.test(av_value)) {
                            var delta = parseInt(av_value, 10);
                            c.setMaxAge(delta);
                        }
                        break;

                      case "domain":
                        if (av_value) {
                            var domain = av_value.trim().replace(/^\./, "");
                            domain && (c.domain = domain.toLowerCase());
                        }
                        break;

                      case "path":
                        c.path = av_value && "/" === av_value[0] ? av_value : null;
                        break;

                      case "secure":
                        c.secure = !0;
                        break;

                      case "httponly":
                        c.httpOnly = !0;
                        break;

                      default:
                        c.extensions = c.extensions || [], c.extensions.push(av);
                    }
                }
            }
            return c;
        }
    }
    function jsonParse(str) {
        var obj;
        try {
            obj = JSON.parse(str);
        } catch (e) {
            return e;
        }
        return obj;
    }
    function fromJSON(str) {
        if (!str) return null;
        var obj;
        if ("string" == typeof str) {
            if ((obj = jsonParse(str)) instanceof Error) return null;
        } else obj = str;
        for (var c = new Cookie, i = 0; i < Cookie.serializableProperties.length; i++) {
            var prop = Cookie.serializableProperties[i];
            void 0 !== obj[prop] && obj[prop] !== Cookie.prototype[prop] && ("expires" === prop || "creation" === prop || "lastAccessed" === prop ? null === obj[prop] ? c[prop] = null : c[prop] = "Infinity" == obj[prop] ? "Infinity" : new Date(obj[prop]) : c[prop] = obj[prop]);
        }
        return c;
    }
    function cookieCompare(a, b) {
        var cmp = 0, aPathLen = a.path ? a.path.length : 0;
        return 0 != (cmp = (b.path ? b.path.length : 0) - aPathLen) || 0 != (cmp = (a.creation ? a.creation.getTime() : 2147483647e3) - (b.creation ? b.creation.getTime() : 2147483647e3)) ? cmp : cmp = a.creationIndex - b.creationIndex;
    }
    function getCookieContext(url) {
        if (url instanceof Object) return url;
        try {
            url = decodeURI(url);
        } catch (err) {}
        return urlParse(url);
    }
    function Cookie(options) {
        options = options || {}, Object.keys(options).forEach((function(prop) {
            Cookie.prototype.hasOwnProperty(prop) && Cookie.prototype[prop] !== options[prop] && "_" !== prop.substr(0, 1) && (this[prop] = options[prop]);
        }), this), this.creation = this.creation || new Date, Object.defineProperty(this, "creationIndex", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: ++Cookie.cookiesCreated
        });
    }
    function CookieJar(store, options) {
        "boolean" == typeof options ? options = {
            rejectPublicSuffixes: options
        } : null == options && (options = {}), null != options.rejectPublicSuffixes && (this.rejectPublicSuffixes = options.rejectPublicSuffixes), 
        null != options.looseMode && (this.enableLooseMode = options.looseMode), store || (store = new MemoryCookieStore), 
        this.store = store;
    }
    Cookie.cookiesCreated = 0, Cookie.parse = parse, Cookie.fromJSON = fromJSON, Cookie.prototype.key = "", 
    Cookie.prototype.value = "", Cookie.prototype.expires = "Infinity", Cookie.prototype.maxAge = null, 
    Cookie.prototype.domain = null, Cookie.prototype.path = null, Cookie.prototype.secure = !1, 
    Cookie.prototype.httpOnly = !1, Cookie.prototype.extensions = null, Cookie.prototype.hostOnly = null, 
    Cookie.prototype.pathIsDefault = null, Cookie.prototype.creation = null, Cookie.prototype.lastAccessed = null, 
    Object.defineProperty(Cookie.prototype, "creationIndex", {
        configurable: !0,
        enumerable: !1,
        writable: !0,
        value: 0
    }), Cookie.serializableProperties = Object.keys(Cookie.prototype).filter((function(prop) {
        return !(Cookie.prototype[prop] instanceof Function || "creationIndex" === prop || "_" === prop.substr(0, 1));
    })), Cookie.prototype.inspect = function() {
        var now = Date.now();
        return 'Cookie="' + this.toString() + "; hostOnly=" + (null != this.hostOnly ? this.hostOnly : "?") + "; aAge=" + (this.lastAccessed ? now - this.lastAccessed.getTime() + "ms" : "?") + "; cAge=" + (this.creation ? now - this.creation.getTime() + "ms" : "?") + '"';
    }, util.inspect.custom && (Cookie.prototype[util.inspect.custom] = Cookie.prototype.inspect), 
    Cookie.prototype.toJSON = function() {
        for (var obj = {}, props = Cookie.serializableProperties, i = 0; i < props.length; i++) {
            var prop = props[i];
            this[prop] !== Cookie.prototype[prop] && ("expires" === prop || "creation" === prop || "lastAccessed" === prop ? null === this[prop] ? obj[prop] = null : obj[prop] = "Infinity" == this[prop] ? "Infinity" : this[prop].toISOString() : "maxAge" === prop ? null !== this[prop] && (obj[prop] = this[prop] == 1 / 0 || this[prop] == -1 / 0 ? this[prop].toString() : this[prop]) : this[prop] !== Cookie.prototype[prop] && (obj[prop] = this[prop]));
        }
        return obj;
    }, Cookie.prototype.clone = function() {
        return fromJSON(this.toJSON());
    }, Cookie.prototype.validate = function() {
        if (!COOKIE_OCTETS.test(this.value)) return !1;
        if (!(this.expires == 1 / 0 || this.expires instanceof Date || parseDate(this.expires))) return !1;
        if (null != this.maxAge && this.maxAge <= 0) return !1;
        if (null != this.path && !PATH_VALUE.test(this.path)) return !1;
        var cdomain = this.cdomain();
        if (cdomain) {
            if (cdomain.match(/\.$/)) return !1;
            if (null == pubsuffix.getPublicSuffix(cdomain)) return !1;
        }
        return !0;
    }, Cookie.prototype.setExpires = function(exp) {
        exp instanceof Date ? this.expires = exp : this.expires = parseDate(exp) || "Infinity";
    }, Cookie.prototype.setMaxAge = function(age) {
        this.maxAge = age === 1 / 0 || age === -1 / 0 ? age.toString() : age;
    }, Cookie.prototype.cookieString = function() {
        var val = this.value;
        return null == val && (val = ""), "" === this.key ? val : this.key + "=" + val;
    }, Cookie.prototype.toString = function() {
        var str = this.cookieString();
        return this.expires != 1 / 0 && (this.expires instanceof Date ? str += "; Expires=" + formatDate(this.expires) : str += "; Expires=" + this.expires), 
        null != this.maxAge && this.maxAge != 1 / 0 && (str += "; Max-Age=" + this.maxAge), 
        this.domain && !this.hostOnly && (str += "; Domain=" + this.domain), this.path && (str += "; Path=" + this.path), 
        this.secure && (str += "; Secure"), this.httpOnly && (str += "; HttpOnly"), this.extensions && this.extensions.forEach((function(ext) {
            str += "; " + ext;
        })), str;
    }, Cookie.prototype.TTL = function(now) {
        if (null != this.maxAge) return this.maxAge <= 0 ? 0 : 1e3 * this.maxAge;
        var expires = this.expires;
        return expires != 1 / 0 ? (expires instanceof Date || (expires = parseDate(expires) || 1 / 0), 
        expires == 1 / 0 ? 1 / 0 : expires.getTime() - (now || Date.now())) : 1 / 0;
    }, Cookie.prototype.expiryTime = function(now) {
        if (null != this.maxAge) {
            var relativeTo = now || this.creation || new Date, age = this.maxAge <= 0 ? -1 / 0 : 1e3 * this.maxAge;
            return relativeTo.getTime() + age;
        }
        return this.expires == 1 / 0 ? 1 / 0 : this.expires.getTime();
    }, Cookie.prototype.expiryDate = function(now) {
        var millisec = this.expiryTime(now);
        return millisec == 1 / 0 ? new Date(2147483647e3) : millisec == -1 / 0 ? new Date(0) : new Date(millisec);
    }, Cookie.prototype.isPersistent = function() {
        return null != this.maxAge || this.expires != 1 / 0;
    }, Cookie.prototype.cdomain = Cookie.prototype.canonicalizedDomain = function() {
        return null == this.domain ? null : canonicalDomain(this.domain);
    }, CookieJar.prototype.store = null, CookieJar.prototype.rejectPublicSuffixes = !0, 
    CookieJar.prototype.enableLooseMode = !1;
    var CAN_BE_SYNC = [];
    CAN_BE_SYNC.push("setCookie"), CookieJar.prototype.setCookie = function(cookie, url, options, cb) {
        var err, context = getCookieContext(url);
        options instanceof Function && (cb = options, options = {});
        var host = canonicalDomain(context.hostname), loose = this.enableLooseMode;
        if (null != options.loose && (loose = options.loose), cookie instanceof Cookie || (cookie = Cookie.parse(cookie, {
            loose: loose
        })), !cookie) return err = new Error("Cookie failed to parse"), cb(options.ignoreError ? null : err);
        var now = options.now || new Date;
        if (this.rejectPublicSuffixes && cookie.domain && null == pubsuffix.getPublicSuffix(cookie.cdomain())) return err = new Error("Cookie has domain set to a public suffix"), 
        cb(options.ignoreError ? null : err);
        if (cookie.domain) {
            if (!domainMatch(host, cookie.cdomain(), !1)) return err = new Error("Cookie not in this host's domain. Cookie:" + cookie.cdomain() + " Request:" + host), 
            cb(options.ignoreError ? null : err);
            null == cookie.hostOnly && (cookie.hostOnly = !1);
        } else cookie.hostOnly = !0, cookie.domain = host;
        if (cookie.path && "/" === cookie.path[0] || (cookie.path = defaultPath(context.pathname), 
        cookie.pathIsDefault = !0), !1 === options.http && cookie.httpOnly) return err = new Error("Cookie is HttpOnly and this isn't an HTTP API"), 
        cb(options.ignoreError ? null : err);
        var store = this.store;
        store.updateCookie || (store.updateCookie = function(oldCookie, newCookie, cb) {
            this.putCookie(newCookie, cb);
        }), store.findCookie(cookie.domain, cookie.path, cookie.key, (function(err, oldCookie) {
            if (err) return cb(err);
            var next = function(err) {
                if (err) return cb(err);
                cb(null, cookie);
            };
            if (oldCookie) {
                if (!1 === options.http && oldCookie.httpOnly) return err = new Error("old Cookie is HttpOnly and this isn't an HTTP API"), 
                cb(options.ignoreError ? null : err);
                cookie.creation = oldCookie.creation, cookie.creationIndex = oldCookie.creationIndex, 
                cookie.lastAccessed = now, store.updateCookie(oldCookie, cookie, next);
            } else cookie.creation = cookie.lastAccessed = now, store.putCookie(cookie, next);
        }));
    }, CAN_BE_SYNC.push("getCookies"), CookieJar.prototype.getCookies = function(url, options, cb) {
        var context = getCookieContext(url);
        options instanceof Function && (cb = options, options = {});
        var host = canonicalDomain(context.hostname), path = context.pathname || "/", secure = options.secure;
        null != secure || !context.protocol || "https:" != context.protocol && "wss:" != context.protocol || (secure = !0);
        var http = options.http;
        null == http && (http = !0);
        var now = options.now || Date.now(), expireCheck = !1 !== options.expire, allPaths = !!options.allPaths, store = this.store;
        function matchingCookie(c) {
            if (c.hostOnly) {
                if (c.domain != host) return !1;
            } else if (!domainMatch(host, c.domain, !1)) return !1;
            return !(!allPaths && !pathMatch(path, c.path) || c.secure && !secure || c.httpOnly && !http || expireCheck && c.expiryTime() <= now && (store.removeCookie(c.domain, c.path, c.key, (function() {})), 
            1));
        }
        store.findCookies(host, allPaths ? null : path, (function(err, cookies) {
            if (err) return cb(err);
            cookies = cookies.filter(matchingCookie), !1 !== options.sort && (cookies = cookies.sort(cookieCompare));
            var now = new Date;
            cookies.forEach((function(c) {
                c.lastAccessed = now;
            })), cb(null, cookies);
        }));
    }, CAN_BE_SYNC.push("getCookieString"), CookieJar.prototype.getCookieString = function() {
        var args = Array.prototype.slice.call(arguments, 0), cb = args.pop(), next = function(err, cookies) {
            err ? cb(err) : cb(null, cookies.sort(cookieCompare).map((function(c) {
                return c.cookieString();
            })).join("; "));
        };
        args.push(next), this.getCookies.apply(this, args);
    }, CAN_BE_SYNC.push("getSetCookieStrings"), CookieJar.prototype.getSetCookieStrings = function() {
        var args = Array.prototype.slice.call(arguments, 0), cb = args.pop(), next = function(err, cookies) {
            err ? cb(err) : cb(null, cookies.map((function(c) {
                return c.toString();
            })));
        };
        args.push(next), this.getCookies.apply(this, args);
    }, CAN_BE_SYNC.push("serialize"), CookieJar.prototype.serialize = function(cb) {
        var type = this.store.constructor.name;
        "Object" === type && (type = null);
        var serialized = {
            version: "tough-cookie@" + VERSION,
            storeType: type,
            rejectPublicSuffixes: !!this.rejectPublicSuffixes,
            cookies: []
        };
        if (!this.store.getAllCookies || "function" != typeof this.store.getAllCookies) return cb(new Error("store does not support getAllCookies and cannot be serialized"));
        this.store.getAllCookies((function(err, cookies) {
            return err ? cb(err) : (serialized.cookies = cookies.map((function(cookie) {
                return delete (cookie = cookie instanceof Cookie ? cookie.toJSON() : cookie).creationIndex, 
                cookie;
            })), cb(null, serialized));
        }));
    }, CookieJar.prototype.toJSON = function() {
        return this.serializeSync();
    }, CAN_BE_SYNC.push("_importCookies"), CookieJar.prototype._importCookies = function(serialized, cb) {
        var jar = this, cookies = serialized.cookies;
        if (!cookies || !Array.isArray(cookies)) return cb(new Error("serialized jar has no cookies array"));
        cookies = cookies.slice(), (function putNext(err) {
            if (err) return cb(err);
            if (!cookies.length) return cb(err, jar);
            var cookie;
            try {
                cookie = fromJSON(cookies.shift());
            } catch (e) {
                return cb(e);
            }
            if (null === cookie) return putNext(null);
            jar.store.putCookie(cookie, putNext);
        })();
    }, CookieJar.deserialize = function(strOrObj, store, cb) {
        var serialized;
        if (3 !== arguments.length && (cb = store, store = null), "string" == typeof strOrObj) {
            if ((serialized = jsonParse(strOrObj)) instanceof Error) return cb(serialized);
        } else serialized = strOrObj;
        var jar = new CookieJar(store, serialized.rejectPublicSuffixes);
        jar._importCookies(serialized, (function(err) {
            if (err) return cb(err);
            cb(null, jar);
        }));
    }, CookieJar.deserializeSync = function(strOrObj, store) {
        var serialized = "string" == typeof strOrObj ? JSON.parse(strOrObj) : strOrObj, jar = new CookieJar(store, serialized.rejectPublicSuffixes);
        if (!jar.store.synchronous) throw new Error("CookieJar store is not synchronous; use async API instead.");
        return jar._importCookiesSync(serialized), jar;
    }, CookieJar.fromJSON = CookieJar.deserializeSync, CAN_BE_SYNC.push("clone"), CookieJar.prototype.clone = function(newStore, cb) {
        1 === arguments.length && (cb = newStore, newStore = null), this.serialize((function(err, serialized) {
            if (err) return cb(err);
            CookieJar.deserialize(newStore, serialized, cb);
        }));
    }, CAN_BE_SYNC.forEach((function(method) {
        CookieJar.prototype[method + "Sync"] = (function(method) {
            return function() {
                if (!this.store.synchronous) throw new Error("CookieJar store is not synchronous; use async API instead.");
                var syncErr, syncResult, args = Array.prototype.slice.call(arguments);
                if (args.push((function(err, result) {
                    syncErr = err, syncResult = result;
                })), this[method].apply(this, args), syncErr) throw syncErr;
                return syncResult;
            };
        })(method);
    })), exports.CookieJar = CookieJar, exports.Cookie = Cookie, exports.Store = Store, 
    exports.MemoryCookieStore = MemoryCookieStore, exports.parseDate = parseDate, exports.formatDate = formatDate, 
    exports.parse = parse, exports.fromJSON = fromJSON, exports.domainMatch = domainMatch, 
    exports.defaultPath = defaultPath, exports.pathMatch = pathMatch, exports.getPublicSuffix = pubsuffix.getPublicSuffix, 
    exports.cookieCompare = cookieCompare, exports.permuteDomain = __webpack_require__(477).permuteDomain, 
    exports.permutePath = function(path) {
        if ("/" === path) return [ "/" ];
        path.lastIndexOf("/") === path.length - 1 && (path = path.substr(0, path.length - 1));
        for (var permutations = [ path ]; path.length > 1; ) {
            var lindex = path.lastIndexOf("/");
            if (0 === lindex) break;
            path = path.substr(0, lindex), permutations.push(path);
        }
        return permutations.push("/"), permutations;
    }, exports.canonicalDomain = canonicalDomain;
}
