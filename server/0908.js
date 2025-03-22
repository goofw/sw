function(module, exports) {
    function HARError(errors) {
        this.name = "HARError", this.message = "validation failed", this.errors = errors, 
        "function" == typeof Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error("validation failed").stack;
    }
    HARError.prototype = Error.prototype, module.exports = HARError;
}
