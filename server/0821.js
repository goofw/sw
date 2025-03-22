function(module, exports, __webpack_require__) {
    "use strict";
    __webpack_require__(2);
    var util = __webpack_require__(0), AbstractSource = (__webpack_require__(41)("matroska:streamFactorySource"), 
    __webpack_require__(206));
    function StreamFactorySource(streamFactory) {
        if (AbstractSource.call(this), "function" != typeof streamFactory.getStream) throw new Error("Invalid streamFactory object  (getStream function)");
        if (streamFactory.end && "function" != typeof streamFactory.end) throw new Error("Invalid streamFactory object (end function)");
        this.streamFactory = streamFactory;
    }
    util.inherits(StreamFactorySource, AbstractSource), module.exports = StreamFactorySource, 
    StreamFactorySource.prototype.getStream = function(session, options, callback) {
        switch (arguments.length) {
          case 1:
            callback = session, session = null;
            break;

          case 2:
            callback = options, options = null;
        }
        this.streamFactory.getStream(session, options, callback);
    }, StreamFactorySource.prototype._end = function(session, callback) {
        if (!this.streamFactory.end) return callback();
        this.streamFactory.end(session, callback);
    }, StreamFactorySource.prototype.toString = function() {
        return "[StreamFactorySource factory=" + this.streamFactory + "]";
    };
}
