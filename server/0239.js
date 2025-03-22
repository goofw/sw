function(module, exports, __webpack_require__) {
    "use strict";
    var resolve = __webpack_require__(237);
    function MissingRefError(baseId, ref, message) {
        this.message = message || MissingRefError.message(baseId, ref), this.missingRef = resolve.url(baseId, ref), 
        this.missingSchema = resolve.normalizeId(resolve.fullPath(this.missingRef));
    }
    function errorSubclass(Subclass) {
        return Subclass.prototype = Object.create(Error.prototype), Subclass.prototype.constructor = Subclass, 
        Subclass;
    }
    module.exports = {
        Validation: errorSubclass((function(errors) {
            this.message = "validation failed", this.errors = errors, this.ajv = this.validation = !0;
        })),
        MissingRef: errorSubclass(MissingRefError)
    }, MissingRefError.message = function(baseId, ref) {
        return "can't resolve reference " + ref + " from id " + baseId;
    };
}
