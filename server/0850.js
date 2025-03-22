function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = PassThrough;
    var Transform = __webpack_require__(428);
    function PassThrough(options) {
        if (!(this instanceof PassThrough)) return new PassThrough(options);
        Transform.call(this, options);
    }
    __webpack_require__(6)(PassThrough, Transform), PassThrough.prototype._transform = function(chunk, encoding, cb) {
        cb(null, chunk);
    };
}
