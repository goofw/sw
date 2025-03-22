function(module, exports, __webpack_require__) {
    var CombinedStream = __webpack_require__(485), util = __webpack_require__(0), path = __webpack_require__(4), http = __webpack_require__(11), https = __webpack_require__(22), parseUrl = __webpack_require__(7).parse, fs = __webpack_require__(2), mime = __webpack_require__(89), asynckit = __webpack_require__(1070), populate = __webpack_require__(1074);
    function FormData(options) {
        if (!(this instanceof FormData)) return new FormData;
        for (var option in this._overheadLength = 0, this._valueLength = 0, this._valuesToMeasure = [], 
        CombinedStream.call(this), options = options || {}) this[option] = options[option];
    }
    module.exports = FormData, util.inherits(FormData, CombinedStream), FormData.LINE_BREAK = "\r\n", 
    FormData.DEFAULT_CONTENT_TYPE = "application/octet-stream", FormData.prototype.append = function(field, value, options) {
        "string" == typeof (options = options || {}) && (options = {
            filename: options
        });
        var append = CombinedStream.prototype.append.bind(this);
        if ("number" == typeof value && (value = "" + value), util.isArray(value)) this._error(new Error("Arrays are not supported.")); else {
            var header = this._multiPartHeader(field, value, options), footer = this._multiPartFooter();
            append(header), append(value), append(footer), this._trackLength(header, value, options);
        }
    }, FormData.prototype._trackLength = function(header, value, options) {
        var valueLength = 0;
        null != options.knownLength ? valueLength += +options.knownLength : Buffer.isBuffer(value) ? valueLength = value.length : "string" == typeof value && (valueLength = Buffer.byteLength(value)), 
        this._valueLength += valueLength, this._overheadLength += Buffer.byteLength(header) + FormData.LINE_BREAK.length, 
        value && (value.path || value.readable && value.hasOwnProperty("httpVersion")) && (options.knownLength || this._valuesToMeasure.push(value));
    }, FormData.prototype._lengthRetriever = function(value, callback) {
        value.hasOwnProperty("fd") ? null != value.end && value.end != 1 / 0 && null != value.start ? callback(null, value.end + 1 - (value.start ? value.start : 0)) : fs.stat(value.path, (function(err, stat) {
            var fileSize;
            err ? callback(err) : (fileSize = stat.size - (value.start ? value.start : 0), callback(null, fileSize));
        })) : value.hasOwnProperty("httpVersion") ? callback(null, +value.headers["content-length"]) : value.hasOwnProperty("httpModule") ? (value.on("response", (function(response) {
            value.pause(), callback(null, +response.headers["content-length"]);
        })), value.resume()) : callback("Unknown stream");
    }, FormData.prototype._multiPartHeader = function(field, value, options) {
        if ("string" == typeof options.header) return options.header;
        var header, contentDisposition = this._getContentDisposition(value, options), contentType = this._getContentType(value, options), contents = "", headers = {
            "Content-Disposition": [ "form-data", 'name="' + field + '"' ].concat(contentDisposition || []),
            "Content-Type": [].concat(contentType || [])
        };
        for (var prop in "object" == typeof options.header && populate(headers, options.header), 
        headers) headers.hasOwnProperty(prop) && null != (header = headers[prop]) && (Array.isArray(header) || (header = [ header ]), 
        header.length && (contents += prop + ": " + header.join("; ") + FormData.LINE_BREAK));
        return "--" + this.getBoundary() + FormData.LINE_BREAK + contents + FormData.LINE_BREAK;
    }, FormData.prototype._getContentDisposition = function(value, options) {
        var filename, contentDisposition;
        return "string" == typeof options.filepath ? filename = path.normalize(options.filepath).replace(/\\/g, "/") : options.filename || value.name || value.path ? filename = path.basename(options.filename || value.name || value.path) : value.readable && value.hasOwnProperty("httpVersion") && (filename = path.basename(value.client._httpMessage.path)), 
        filename && (contentDisposition = 'filename="' + filename + '"'), contentDisposition;
    }, FormData.prototype._getContentType = function(value, options) {
        var contentType = options.contentType;
        return !contentType && value.name && (contentType = mime.lookup(value.name)), !contentType && value.path && (contentType = mime.lookup(value.path)), 
        !contentType && value.readable && value.hasOwnProperty("httpVersion") && (contentType = value.headers["content-type"]), 
        contentType || !options.filepath && !options.filename || (contentType = mime.lookup(options.filepath || options.filename)), 
        contentType || "object" != typeof value || (contentType = FormData.DEFAULT_CONTENT_TYPE), 
        contentType;
    }, FormData.prototype._multiPartFooter = function() {
        return function(next) {
            var footer = FormData.LINE_BREAK;
            0 === this._streams.length && (footer += this._lastBoundary()), next(footer);
        }.bind(this);
    }, FormData.prototype._lastBoundary = function() {
        return "--" + this.getBoundary() + "--" + FormData.LINE_BREAK;
    }, FormData.prototype.getHeaders = function(userHeaders) {
        var header, formHeaders = {
            "content-type": "multipart/form-data; boundary=" + this.getBoundary()
        };
        for (header in userHeaders) userHeaders.hasOwnProperty(header) && (formHeaders[header.toLowerCase()] = userHeaders[header]);
        return formHeaders;
    }, FormData.prototype.getBoundary = function() {
        return this._boundary || this._generateBoundary(), this._boundary;
    }, FormData.prototype._generateBoundary = function() {
        for (var boundary = "--------------------------", i = 0; i < 24; i++) boundary += Math.floor(10 * Math.random()).toString(16);
        this._boundary = boundary;
    }, FormData.prototype.getLengthSync = function() {
        var knownLength = this._overheadLength + this._valueLength;
        return this._streams.length && (knownLength += this._lastBoundary().length), this.hasKnownLength() || this._error(new Error("Cannot calculate proper length in synchronous way.")), 
        knownLength;
    }, FormData.prototype.hasKnownLength = function() {
        var hasKnownLength = !0;
        return this._valuesToMeasure.length && (hasKnownLength = !1), hasKnownLength;
    }, FormData.prototype.getLength = function(cb) {
        var knownLength = this._overheadLength + this._valueLength;
        this._streams.length && (knownLength += this._lastBoundary().length), this._valuesToMeasure.length ? asynckit.parallel(this._valuesToMeasure, this._lengthRetriever, (function(err, values) {
            err ? cb(err) : (values.forEach((function(length) {
                knownLength += length;
            })), cb(null, knownLength));
        })) : process.nextTick(cb.bind(this, null, knownLength));
    }, FormData.prototype.submit = function(params, cb) {
        var request, options, defaults = {
            method: "post"
        };
        return "string" == typeof params ? (params = parseUrl(params), options = populate({
            port: params.port,
            path: params.pathname,
            host: params.hostname,
            protocol: params.protocol
        }, defaults)) : (options = populate(params, defaults)).port || (options.port = "https:" == options.protocol ? 443 : 80), 
        options.headers = this.getHeaders(params.headers), request = "https:" == options.protocol ? https.request(options) : http.request(options), 
        this.getLength(function(err, length) {
            err ? this._error(err) : (request.setHeader("Content-Length", length), this.pipe(request), 
            cb && (request.on("error", cb), request.on("response", cb.bind(this, null))));
        }.bind(this)), request;
    }, FormData.prototype._error = function(err) {
        this.error || (this.error = err, this.pause(), this.emit("error", err));
    }, FormData.prototype.toString = function() {
        return "[object FormData]";
    };
}
