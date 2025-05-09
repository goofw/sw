function(module, exports, __webpack_require__) {
    "use strict";
    var fs = __webpack_require__(2), util = __webpack_require__(0), debug = __webpack_require__(40)("matroska:fileSource"), AbstractSource = __webpack_require__(171), fileSourceKey = 0;
    function FileSource(filename) {
        AbstractSource.call(this), this.filename = filename;
    }
    util.inherits(FileSource, AbstractSource), module.exports = FileSource, FileSource.prototype.getStream = function(session, options, callback) {
        switch (arguments.length) {
          case 1:
            callback = session, session = null;
            break;

          case 2:
            callback = options, options = null;
        }
        (session = session || {}).$fileSourceKey = fileSourceKey++;
        var fd = session._fd;
        if (fd) {
            var params = {
                flags: "r",
                fd: fd,
                autoClose: !1
            };
            "number" == typeof options.start && (params.start = options.start), "number" == typeof options.end && (params.end = options.end), 
            debug("GetStream", params, " fd=", session._fd);
            var stream = fs.createReadStream(this.filename, params);
            return stream.destroy = function() {}, callback(null, stream);
        }
        var self = this;
        fs.open(this.filename, "r", (function(error, fd) {
            if (error) return callback(error);
            session._fd = fd, self.getStream(session, options, callback);
        }));
    }, FileSource.prototype._end = function(session, callback) {
        if (debug("Close", session._fd), !session._fd) return callback();
        fs.close(session._fd, (function(error) {
            return delete session._fd, callback(error);
        }));
    }, FileSource.prototype.toString = function() {
        return "[FileSource file=" + this.filename + "]";
    };
}
