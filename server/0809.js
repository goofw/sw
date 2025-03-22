function(module, exports, __webpack_require__) {
    var Stream = __webpack_require__(3);
    function through(write, end, opts) {
        write = write || function(data) {
            this.queue(data);
        }, end = end || function() {
            this.queue(null);
        };
        var ended = !1, destroyed = !1, buffer = [], _ended = !1, stream = new Stream;
        function drain() {
            for (;buffer.length && !stream.paused; ) {
                var data = buffer.shift();
                if (null === data) return stream.emit("end");
                stream.emit("data", data);
            }
        }
        function _end() {
            stream.writable = !1, end.call(stream), !stream.readable && stream.autoDestroy && stream.destroy();
        }
        return stream.readable = stream.writable = !0, stream.paused = !1, stream.autoDestroy = !(opts && !1 === opts.autoDestroy), 
        stream.write = function(data) {
            return write.call(this, data), !stream.paused;
        }, stream.queue = stream.push = function(data) {
            return _ended || (null === data && (_ended = !0), buffer.push(data), drain()), stream;
        }, stream.on("end", (function() {
            stream.readable = !1, !stream.writable && stream.autoDestroy && process.nextTick((function() {
                stream.destroy();
            }));
        })), stream.end = function(data) {
            if (!ended) return ended = !0, arguments.length && stream.write(data), _end(), stream;
        }, stream.destroy = function() {
            if (!destroyed) return destroyed = !0, ended = !0, buffer.length = 0, stream.writable = stream.readable = !1, 
            stream.emit("close"), stream;
        }, stream.pause = function() {
            if (!stream.paused) return stream.paused = !0, stream;
        }, stream.resume = function() {
            return stream.paused && (stream.paused = !1, stream.emit("resume")), drain(), stream.paused || stream.emit("drain"), 
            stream;
        }, stream;
    }
    module.exports = through, through.through = through;
}
