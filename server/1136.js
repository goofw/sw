function(module, exports, __webpack_require__) {
    "use strict";
    var url = __webpack_require__(7), qs = __webpack_require__(493), caseless = __webpack_require__(236), uuid = __webpack_require__(148), oauth = __webpack_require__(1137), crypto = __webpack_require__(9), Buffer = __webpack_require__(23).Buffer;
    function OAuth(request) {
        this.request = request, this.params = null;
    }
    OAuth.prototype.buildParams = function(_oauth, uri, method, query, form, qsLib) {
        var oa = {};
        for (var i in _oauth) oa["oauth_" + i] = _oauth[i];
        oa.oauth_version || (oa.oauth_version = "1.0"), oa.oauth_timestamp || (oa.oauth_timestamp = Math.floor(Date.now() / 1e3).toString()), 
        oa.oauth_nonce || (oa.oauth_nonce = uuid().replace(/-/g, "")), oa.oauth_signature_method || (oa.oauth_signature_method = "HMAC-SHA1");
        var consumer_secret_or_private_key = oa.oauth_consumer_secret || oa.oauth_private_key;
        delete oa.oauth_consumer_secret, delete oa.oauth_private_key;
        var token_secret = oa.oauth_token_secret;
        delete oa.oauth_token_secret;
        var realm = oa.oauth_realm;
        delete oa.oauth_realm, delete oa.oauth_transport_method;
        var baseurl = uri.protocol + "//" + uri.host + uri.pathname, params = qsLib.parse([].concat(query, form, qsLib.stringify(oa)).join("&"));
        return oa.oauth_signature = oauth.sign(oa.oauth_signature_method, method, baseurl, params, consumer_secret_or_private_key, token_secret), 
        realm && (oa.realm = realm), oa;
    }, OAuth.prototype.buildBodyHash = function(_oauth, body) {
        [ "HMAC-SHA1", "RSA-SHA1" ].indexOf(_oauth.signature_method || "HMAC-SHA1") < 0 && this.request.emit("error", new Error("oauth: " + _oauth.signature_method + " signature_method not supported with body_hash signing."));
        var shasum = crypto.createHash("sha1");
        shasum.update(body || "");
        var sha1 = shasum.digest("hex");
        return Buffer.from(sha1, "hex").toString("base64");
    }, OAuth.prototype.concatParams = function(oa, sep, wrap) {
        wrap = wrap || "";
        var params = Object.keys(oa).filter((function(i) {
            return "realm" !== i && "oauth_signature" !== i;
        })).sort();
        return oa.realm && params.splice(0, 0, "realm"), params.push("oauth_signature"), 
        params.map((function(i) {
            return i + "=" + wrap + oauth.rfc3986(oa[i]) + wrap;
        })).join(sep);
    }, OAuth.prototype.onRequest = function(_oauth) {
        this.params = _oauth;
        var form, query, uri = this.request.uri || {}, method = this.request.method || "", headers = caseless(this.request.headers), body = this.request.body || "", qsLib = this.request.qsLib || qs, contentType = headers.get("content-type") || "", formContentType = "application/x-www-form-urlencoded", transport = _oauth.transport_method || "header";
        contentType.slice(0, formContentType.length) === formContentType && (contentType = formContentType, 
        form = body), uri.query && (query = uri.query), "body" !== transport || "POST" === method && contentType === formContentType || this.request.emit("error", new Error("oauth: transport_method of body requires POST and content-type " + formContentType)), 
        form || "boolean" != typeof _oauth.body_hash || (_oauth.body_hash = this.buildBodyHash(_oauth, this.request.body.toString()));
        var oa = this.buildParams(_oauth, uri, method, query, form, qsLib);
        switch (transport) {
          case "header":
            this.request.setHeader("Authorization", "OAuth " + this.concatParams(oa, ",", '"'));
            break;

          case "query":
            var href = this.request.uri.href += (query ? "&" : "?") + this.concatParams(oa, "&");
            this.request.uri = url.parse(href), this.request.path = this.request.uri.path;
            break;

          case "body":
            this.request.body = (form ? form + "&" : "") + this.concatParams(oa, "&");
            break;

          default:
            this.request.emit("error", new Error("oauth: transport_method invalid"));
        }
    }, exports.OAuth = OAuth;
}
