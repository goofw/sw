function(module, exports, __webpack_require__) {
    var ajv, Ajv = __webpack_require__(1081), HARError = __webpack_require__(1114), schemas = __webpack_require__(1115);
    function validate(name, data) {
        data = data || {};
        var validate = (ajv = ajv || (function() {
            var ajv = new Ajv({
                allErrors: !0
            });
            return ajv.addMetaSchema(__webpack_require__(1134)), ajv.addSchema(schemas), ajv;
        })()).getSchema(name + ".json");
        return new Promise((function(resolve, reject) {
            validate(data) ? resolve(data) : reject(new HARError(validate.errors));
        }));
    }
    exports.afterRequest = function(data) {
        return validate("afterRequest", data);
    }, exports.beforeRequest = function(data) {
        return validate("beforeRequest", data);
    }, exports.browser = function(data) {
        return validate("browser", data);
    }, exports.cache = function(data) {
        return validate("cache", data);
    }, exports.content = function(data) {
        return validate("content", data);
    }, exports.cookie = function(data) {
        return validate("cookie", data);
    }, exports.creator = function(data) {
        return validate("creator", data);
    }, exports.entry = function(data) {
        return validate("entry", data);
    }, exports.har = function(data) {
        return validate("har", data);
    }, exports.header = function(data) {
        return validate("header", data);
    }, exports.log = function(data) {
        return validate("log", data);
    }, exports.page = function(data) {
        return validate("page", data);
    }, exports.pageTimings = function(data) {
        return validate("pageTimings", data);
    }, exports.postData = function(data) {
        return validate("postData", data);
    }, exports.query = function(data) {
        return validate("query", data);
    }, exports.request = function(data) {
        return validate("request", data);
    }, exports.response = function(data) {
        return validate("response", data);
    }, exports.timings = function(data) {
        return validate("timings", data);
    };
}
