function(module, exports, __webpack_require__) {
    var aws4 = exports, url = __webpack_require__(7), querystring = __webpack_require__(28), crypto = __webpack_require__(9), credentialsCache = __webpack_require__(1049)(1e3);
    function hmac(key, string, encoding) {
        return crypto.createHmac("sha256", key).update(string, "utf8").digest(encoding);
    }
    function hash(string, encoding) {
        return crypto.createHash("sha256").update(string, "utf8").digest(encoding);
    }
    function encodeRfc3986(urlEncodedString) {
        return urlEncodedString.replace(/[!'()*]/g, (function(c) {
            return "%" + c.charCodeAt(0).toString(16).toUpperCase();
        }));
    }
    function RequestSigner(request, credentials) {
        "string" == typeof request && (request = url.parse(request));
        var headers = request.headers = request.headers || {}, hostParts = this.matchHost(request.hostname || request.host || headers.Host || headers.host);
        this.request = request, this.credentials = credentials || this.defaultCredentials(), 
        this.service = request.service || hostParts[0] || "", this.region = request.region || hostParts[1] || "us-east-1", 
        "email" === this.service && (this.service = "ses"), !request.method && request.body && (request.method = "POST"), 
        headers.Host || headers.host || (headers.Host = request.hostname || request.host || this.createHost(), 
        request.port && (headers.Host += ":" + request.port)), request.hostname || request.host || (request.hostname = headers.Host || headers.host), 
        this.isCodeCommitGit = "codecommit" === this.service && "GIT" === request.method;
    }
    RequestSigner.prototype.matchHost = function(host) {
        var hostParts = ((host || "").match(/([^\.]+)\.(?:([^\.]*)\.)?amazonaws\.com(\.cn)?$/) || []).slice(1, 3);
        return "es" === hostParts[1] && (hostParts = hostParts.reverse()), hostParts;
    }, RequestSigner.prototype.isSingleRegion = function() {
        return [ "s3", "sdb" ].indexOf(this.service) >= 0 && "us-east-1" === this.region || [ "cloudfront", "ls", "route53", "iam", "importexport", "sts" ].indexOf(this.service) >= 0;
    }, RequestSigner.prototype.createHost = function() {
        var region = this.isSingleRegion() ? "" : ("s3" === this.service && "us-east-1" !== this.region ? "-" : ".") + this.region;
        return ("ses" === this.service ? "email" : this.service) + region + ".amazonaws.com";
    }, RequestSigner.prototype.prepareRequest = function() {
        this.parsePath();
        var query, request = this.request, headers = request.headers;
        request.signQuery ? (this.parsedPath.query = query = this.parsedPath.query || {}, 
        this.credentials.sessionToken && (query["X-Amz-Security-Token"] = this.credentials.sessionToken), 
        "s3" !== this.service || query["X-Amz-Expires"] || (query["X-Amz-Expires"] = 86400), 
        query["X-Amz-Date"] ? this.datetime = query["X-Amz-Date"] : query["X-Amz-Date"] = this.getDateTime(), 
        query["X-Amz-Algorithm"] = "AWS4-HMAC-SHA256", query["X-Amz-Credential"] = this.credentials.accessKeyId + "/" + this.credentialString(), 
        query["X-Amz-SignedHeaders"] = this.signedHeaders()) : (request.doNotModifyHeaders || this.isCodeCommitGit || (!request.body || headers["Content-Type"] || headers["content-type"] || (headers["Content-Type"] = "application/x-www-form-urlencoded; charset=utf-8"), 
        !request.body || headers["Content-Length"] || headers["content-length"] || (headers["Content-Length"] = Buffer.byteLength(request.body)), 
        !this.credentials.sessionToken || headers["X-Amz-Security-Token"] || headers["x-amz-security-token"] || (headers["X-Amz-Security-Token"] = this.credentials.sessionToken), 
        "s3" !== this.service || headers["X-Amz-Content-Sha256"] || headers["x-amz-content-sha256"] || (headers["X-Amz-Content-Sha256"] = hash(this.request.body || "", "hex")), 
        headers["X-Amz-Date"] || headers["x-amz-date"] ? this.datetime = headers["X-Amz-Date"] || headers["x-amz-date"] : headers["X-Amz-Date"] = this.getDateTime()), 
        delete headers.Authorization, delete headers.authorization);
    }, RequestSigner.prototype.sign = function() {
        return this.parsedPath || this.prepareRequest(), this.request.signQuery ? this.parsedPath.query["X-Amz-Signature"] = this.signature() : this.request.headers.Authorization = this.authHeader(), 
        this.request.path = this.formatPath(), this.request;
    }, RequestSigner.prototype.getDateTime = function() {
        if (!this.datetime) {
            var headers = this.request.headers, date = new Date(headers.Date || headers.date || new Date);
            this.datetime = date.toISOString().replace(/[:\-]|\.\d{3}/g, ""), this.isCodeCommitGit && (this.datetime = this.datetime.slice(0, -1));
        }
        return this.datetime;
    }, RequestSigner.prototype.getDate = function() {
        return this.getDateTime().substr(0, 8);
    }, RequestSigner.prototype.authHeader = function() {
        return [ "AWS4-HMAC-SHA256 Credential=" + this.credentials.accessKeyId + "/" + this.credentialString(), "SignedHeaders=" + this.signedHeaders(), "Signature=" + this.signature() ].join(", ");
    }, RequestSigner.prototype.signature = function() {
        var kDate, kRegion, kService, date = this.getDate(), cacheKey = [ this.credentials.secretAccessKey, date, this.region, this.service ].join(), kCredentials = credentialsCache.get(cacheKey);
        return kCredentials || (kDate = hmac("AWS4" + this.credentials.secretAccessKey, date), 
        kRegion = hmac(kDate, this.region), kService = hmac(kRegion, this.service), kCredentials = hmac(kService, "aws4_request"), 
        credentialsCache.set(cacheKey, kCredentials)), hmac(kCredentials, this.stringToSign(), "hex");
    }, RequestSigner.prototype.stringToSign = function() {
        return [ "AWS4-HMAC-SHA256", this.getDateTime(), this.credentialString(), hash(this.canonicalString(), "hex") ].join("\n");
    }, RequestSigner.prototype.canonicalString = function() {
        this.parsedPath || this.prepareRequest();
        var bodyHash, pathStr = this.parsedPath.path, query = this.parsedPath.query, headers = this.request.headers, queryStr = "", normalizePath = "s3" !== this.service, decodePath = "s3" === this.service || this.request.doNotEncodePath, decodeSlashesInPath = "s3" === this.service, firstValOnly = "s3" === this.service;
        return bodyHash = "s3" === this.service && this.request.signQuery ? "UNSIGNED-PAYLOAD" : this.isCodeCommitGit ? "" : headers["X-Amz-Content-Sha256"] || headers["x-amz-content-sha256"] || hash(this.request.body || "", "hex"), 
        query && (queryStr = encodeRfc3986(querystring.stringify(Object.keys(query).sort().reduce((function(obj, key) {
            return key ? (obj[key] = Array.isArray(query[key]) ? firstValOnly ? query[key][0] : query[key].slice().sort() : query[key], 
            obj) : obj;
        }), {})))), "/" !== pathStr && (normalizePath && (pathStr = pathStr.replace(/\/{2,}/g, "/")), 
        "/" !== (pathStr = pathStr.split("/").reduce((function(path, piece) {
            return normalizePath && ".." === piece ? path.pop() : normalizePath && "." === piece || (decodePath && (piece = decodeURIComponent(piece)), 
            path.push(encodeRfc3986(encodeURIComponent(piece)))), path;
        }), []).join("/"))[0] && (pathStr = "/" + pathStr), decodeSlashesInPath && (pathStr = pathStr.replace(/%2F/g, "/"))), 
        [ this.request.method || "GET", pathStr, queryStr, this.canonicalHeaders() + "\n", this.signedHeaders(), bodyHash ].join("\n");
    }, RequestSigner.prototype.canonicalHeaders = function() {
        var headers = this.request.headers;
        return Object.keys(headers).sort((function(a, b) {
            return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
        })).map((function(key) {
            return key.toLowerCase() + ":" + headers[key].toString().trim().replace(/\s+/g, " ");
        })).join("\n");
    }, RequestSigner.prototype.signedHeaders = function() {
        return Object.keys(this.request.headers).map((function(key) {
            return key.toLowerCase();
        })).sort().join(";");
    }, RequestSigner.prototype.credentialString = function() {
        return [ this.getDate(), this.region, this.service, "aws4_request" ].join("/");
    }, RequestSigner.prototype.defaultCredentials = function() {
        var env = process.env;
        return {
            accessKeyId: env.AWS_ACCESS_KEY_ID || env.AWS_ACCESS_KEY,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY || env.AWS_SECRET_KEY,
            sessionToken: env.AWS_SESSION_TOKEN
        };
    }, RequestSigner.prototype.parsePath = function() {
        var path = this.request.path || "/", queryIx = path.indexOf("?"), query = null;
        queryIx >= 0 && (query = querystring.parse(path.slice(queryIx + 1)), path = path.slice(0, queryIx)), 
        /[^0-9A-Za-z!'()*\-._~%/]/.test(path) && (path = path.split("/").map((function(piece) {
            return encodeURIComponent(decodeURIComponent(piece));
        })).join("/")), this.parsedPath = {
            path: path,
            query: query
        };
    }, RequestSigner.prototype.formatPath = function() {
        var path = this.parsedPath.path, query = this.parsedPath.query;
        return query ? (null != query[""] && delete query[""], path + "?" + encodeRfc3986(querystring.stringify(query))) : path;
    }, aws4.RequestSigner = RequestSigner, aws4.sign = function(request, credentials) {
        return new RequestSigner(request, credentials).sign();
    };
}
