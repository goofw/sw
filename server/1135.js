function(module, exports, __webpack_require__) {
    "use strict";
    var caseless = __webpack_require__(236), uuid = __webpack_require__(148), helpers = __webpack_require__(229), md5 = helpers.md5, toBase64 = helpers.toBase64;
    function Auth(request) {
        this.request = request, this.hasAuth = !1, this.sentAuth = !1, this.bearerToken = null, 
        this.user = null, this.pass = null;
    }
    Auth.prototype.basic = function(user, pass, sendImmediately) {
        if (("string" != typeof user || void 0 !== pass && "string" != typeof pass) && this.request.emit("error", new Error("auth() received invalid user or password")), 
        this.user = user, this.pass = pass, this.hasAuth = !0, sendImmediately || void 0 === sendImmediately) {
            var authHeader = "Basic " + toBase64(user + ":" + (pass || ""));
            return this.sentAuth = !0, authHeader;
        }
    }, Auth.prototype.bearer = function(bearer, sendImmediately) {
        if (this.bearerToken = bearer, this.hasAuth = !0, sendImmediately || void 0 === sendImmediately) {
            "function" == typeof bearer && (bearer = bearer());
            var authHeader = "Bearer " + (bearer || "");
            return this.sentAuth = !0, authHeader;
        }
    }, Auth.prototype.digest = function(method, path, authHeader) {
        for (var challenge = {}, re = /([a-z0-9_-]+)=(?:"([^"]+)"|([a-z0-9_-]+))/gi; ;) {
            var match = re.exec(authHeader);
            if (!match) break;
            challenge[match[1]] = match[2] || match[3];
        }
        var qop = /(^|,)\s*auth\s*($|,)/.test(challenge.qop) && "auth", nc = qop && "00000001", cnonce = qop && uuid().replace(/-/g, ""), ha1 = (function(algorithm, user, realm, pass, nonce, cnonce) {
            var ha1 = md5(user + ":" + realm + ":" + pass);
            return algorithm && "md5-sess" === algorithm.toLowerCase() ? md5(ha1 + ":" + nonce + ":" + cnonce) : ha1;
        })(challenge.algorithm, this.user, challenge.realm, this.pass, challenge.nonce, cnonce), ha2 = md5(method + ":" + path), digestResponse = md5(qop ? ha1 + ":" + challenge.nonce + ":" + nc + ":" + cnonce + ":" + qop + ":" + ha2 : ha1 + ":" + challenge.nonce + ":" + ha2), authValues = {
            username: this.user,
            realm: challenge.realm,
            nonce: challenge.nonce,
            uri: path,
            qop: qop,
            response: digestResponse,
            nc: nc,
            cnonce: cnonce,
            algorithm: challenge.algorithm,
            opaque: challenge.opaque
        };
        for (var k in authHeader = [], authValues) authValues[k] && ("qop" === k || "nc" === k || "algorithm" === k ? authHeader.push(k + "=" + authValues[k]) : authHeader.push(k + '="' + authValues[k] + '"'));
        return authHeader = "Digest " + authHeader.join(", "), this.sentAuth = !0, authHeader;
    }, Auth.prototype.onRequest = function(user, pass, sendImmediately, bearer) {
        var authHeader, request = this.request;
        void 0 === bearer && void 0 === user ? this.request.emit("error", new Error("no auth mechanism defined")) : authHeader = void 0 !== bearer ? this.bearer(bearer, sendImmediately) : this.basic(user, pass, sendImmediately), 
        authHeader && request.setHeader("authorization", authHeader);
    }, Auth.prototype.onResponse = function(response) {
        var request = this.request;
        if (!this.hasAuth || this.sentAuth) return null;
        var authHeader = caseless(response.headers).get("www-authenticate"), authVerb = authHeader && authHeader.split(" ")[0].toLowerCase();
        switch (request.debug("reauth", authVerb), authVerb) {
          case "basic":
            return this.basic(this.user, this.pass, !0);

          case "bearer":
            return this.bearer(this.bearerToken, !0);

          case "digest":
            return this.digest(request.method, request.path, authHeader);
        }
    }, exports.Auth = Auth;
}
