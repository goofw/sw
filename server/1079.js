function(module, exports, __webpack_require__) {
    "use strict";
    var fs = __webpack_require__(2), qs = __webpack_require__(28), validate = __webpack_require__(1080), extend = __webpack_require__(147);
    function Har(request) {
        this.request = request;
    }
    Har.prototype.reducer = function(obj, pair) {
        if (void 0 === obj[pair.name]) return obj[pair.name] = pair.value, obj;
        var arr = [ obj[pair.name], pair.value ];
        return obj[pair.name] = arr, obj;
    }, Har.prototype.prep = function(data) {
        if (data.queryObj = {}, data.headersObj = {}, data.postData.jsonObj = !1, data.postData.paramsObj = !1, 
        data.queryString && data.queryString.length && (data.queryObj = data.queryString.reduce(this.reducer, {})), 
        data.headers && data.headers.length && (data.headersObj = data.headers.reduceRight((function(headers, header) {
            return headers[header.name] = header.value, headers;
        }), {})), data.cookies && data.cookies.length) {
            var cookies = data.cookies.map((function(cookie) {
                return cookie.name + "=" + cookie.value;
            }));
            cookies.length && (data.headersObj.cookie = cookies.join("; "));
        }
        function some(arr) {
            return arr.some((function(type) {
                return 0 === data.postData.mimeType.indexOf(type);
            }));
        }
        if (some([ "multipart/mixed", "multipart/related", "multipart/form-data", "multipart/alternative" ])) data.postData.mimeType = "multipart/form-data"; else if (some([ "application/x-www-form-urlencoded" ])) data.postData.params ? (data.postData.paramsObj = data.postData.params.reduce(this.reducer, {}), 
        data.postData.text = qs.stringify(data.postData.paramsObj)) : data.postData.text = ""; else if (some([ "text/json", "text/x-json", "application/json", "application/x-json" ]) && (data.postData.mimeType = "application/json", 
        data.postData.text)) try {
            data.postData.jsonObj = JSON.parse(data.postData.text);
        } catch (e) {
            this.request.debug(e), data.postData.mimeType = "text/plain";
        }
        return data;
    }, Har.prototype.options = function(options) {
        if (!options.har) return options;
        var har = {};
        if (extend(har, options.har), har.log && har.log.entries && (har = har.log.entries[0]), 
        har.url = har.url || options.url || options.uri || options.baseUrl || "/", har.httpVersion = har.httpVersion || "HTTP/1.1", 
        har.queryString = har.queryString || [], har.headers = har.headers || [], har.cookies = har.cookies || [], 
        har.postData = har.postData || {}, har.postData.mimeType = har.postData.mimeType || "application/octet-stream", 
        har.bodySize = 0, har.headersSize = 0, har.postData.size = 0, !validate.request(har)) return options;
        var req = this.prep(har);
        function test(type) {
            return 0 === req.postData.mimeType.indexOf(type);
        }
        return req.url && (options.url = req.url), req.method && (options.method = req.method), 
        Object.keys(req.queryObj).length && (options.qs = req.queryObj), Object.keys(req.headersObj).length && (options.headers = req.headersObj), 
        test("application/x-www-form-urlencoded") ? options.form = req.postData.paramsObj : test("application/json") ? req.postData.jsonObj && (options.body = req.postData.jsonObj, 
        options.json = !0) : test("multipart/form-data") ? (options.formData = {}, req.postData.params.forEach((function(param) {
            var attachment = {};
            param.fileName || param.fileName || param.contentType ? (param.fileName && !param.value ? attachment.value = fs.createReadStream(param.fileName) : param.value && (attachment.value = param.value), 
            param.fileName && (attachment.options = {
                filename: param.fileName,
                contentType: param.contentType ? param.contentType : null
            }), options.formData[param.name] = attachment) : options.formData[param.name] = param.value;
        }))) : req.postData.text && (options.body = req.postData.text), options;
    }, exports.Har = Har;
}
