function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = PassThrough;
    var Transform = __webpack_require__(396), util = Object.create(__webpack_require__(32));
    function PassThrough(options) {
        if (!(this instanceof PassThrough)) return new PassThrough(options);
        Transform.call(this, options);
    }
    util.inherits = __webpack_require__(6), util.inherits(PassThrough, Transform), PassThrough.prototype._transform = function(chunk, encoding, cb) {
        cb(null, chunk);
    };
}
