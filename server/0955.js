function(module, exports, __webpack_require__) {
    var util = __webpack_require__(0), sprintf = __webpack_require__(224).sprintf;
    function SyntaxError(token, msg) {
        msg = msg || sprintf("Syntax Error at token %s", token.toString()), this.token = token, 
        this.message = msg, Error.call(this, msg);
    }
    util.inherits(SyntaxError, Error), exports.SyntaxError = SyntaxError;
}
