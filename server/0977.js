function(module, exports) {
    function webpackEmptyContext(req) {
        var e = new Error("Cannot find module '" + req + "'");
        throw e.code = "MODULE_NOT_FOUND", e;
    }
    webpackEmptyContext.keys = function() {
        return [];
    }, webpackEmptyContext.resolve = webpackEmptyContext, module.exports = webpackEmptyContext, 
    webpackEmptyContext.id = 977;
}
