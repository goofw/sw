function(module, exports, __webpack_require__) {
    module.exports = Readable;
    var isArray = __webpack_require__(770), Buffer = __webpack_require__(10).Buffer;
    Readable.ReadableState = ReadableState;
    var EE = __webpack_require__(5).EventEmitter;
    EE.listenerCount || (EE.listenerCount = function(emitter, type) {
        return emitter.listeners(type).length;
    });
    var StringDecoder, Stream = __webpack_require__(3), util = __webpack_require__(32);
    util.inherits = __webpack_require__(6);
    var debug = __webpack_require__(0);
    function ReadableState(options, stream) {
        var Duplex = __webpack_require__(73), hwm = (options = options || {}).highWaterMark, defaultHwm = options.objectMode ? 16 : 16384;
        this.highWaterMark = hwm || 0 === hwm ? hwm : defaultHwm, this.highWaterMark = ~~this.highWaterMark, 
        this.buffer = [], this.length = 0, this.pipes = null, this.pipesCount = 0, this.flowing = null, 
        this.ended = !1, this.endEmitted = !1, this.reading = !1, this.sync = !0, this.needReadable = !1, 
        this.emittedReadable = !1, this.readableListening = !1, this.objectMode = !!options.objectMode, 
        stream instanceof Duplex && (this.objectMode = this.objectMode || !!options.readableObjectMode), 
        this.defaultEncoding = options.defaultEncoding || "utf8", this.ranOut = !1, this.awaitDrain = 0, 
        this.readingMore = !1, this.decoder = null, this.encoding = null, options.encoding && (StringDecoder || (StringDecoder = __webpack_require__(385).StringDecoder), 
        this.decoder = new StringDecoder(options.encoding), this.encoding = options.encoding);
    }
    function Readable(options) {
        if (__webpack_require__(73), !(this instanceof Readable)) return new Readable(options);
        this._readableState = new ReadableState(options, this), this.readable = !0, Stream.call(this);
    }
    function readableAddChunk(stream, state, chunk, encoding, addToFront) {
        var er = (function(state, chunk) {
            var er = null;
            return util.isBuffer(chunk) || util.isString(chunk) || util.isNullOrUndefined(chunk) || state.objectMode || (er = new TypeError("Invalid non-string/buffer chunk")), 
            er;
        })(state, chunk);
        if (er) stream.emit("error", er); else if (util.isNullOrUndefined(chunk)) state.reading = !1, 
        state.ended || (function(stream, state) {
            if (state.decoder && !state.ended) {
                var chunk = state.decoder.end();
                chunk && chunk.length && (state.buffer.push(chunk), state.length += state.objectMode ? 1 : chunk.length);
            }
            state.ended = !0, emitReadable(stream);
        })(stream, state); else if (state.objectMode || chunk && chunk.length > 0) if (state.ended && !addToFront) {
            var e = new Error("stream.push() after EOF");
            stream.emit("error", e);
        } else state.endEmitted && addToFront ? (e = new Error("stream.unshift() after end event"), 
        stream.emit("error", e)) : (!state.decoder || addToFront || encoding || (chunk = state.decoder.write(chunk)), 
        addToFront || (state.reading = !1), state.flowing && 0 === state.length && !state.sync ? (stream.emit("data", chunk), 
        stream.read(0)) : (state.length += state.objectMode ? 1 : chunk.length, addToFront ? state.buffer.unshift(chunk) : state.buffer.push(chunk), 
        state.needReadable && emitReadable(stream)), (function(stream, state) {
            state.readingMore || (state.readingMore = !0, process.nextTick((function() {
                !(function(stream, state) {
                    for (var len = state.length; !state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark && (debug("maybeReadMore read 0"), 
                    stream.read(0), len !== state.length); ) len = state.length;
                    state.readingMore = !1;
                })(stream, state);
            })));
        })(stream, state)); else addToFront || (state.reading = !1);
        return (function(state) {
            return !state.ended && (state.needReadable || state.length < state.highWaterMark || 0 === state.length);
        })(state);
    }
    function howMuchToRead(n, state) {
        return 0 === state.length && state.ended ? 0 : state.objectMode ? 0 === n ? 0 : 1 : isNaN(n) || util.isNull(n) ? state.flowing && state.buffer.length ? state.buffer[0].length : state.length : n <= 0 ? 0 : (n > state.highWaterMark && (state.highWaterMark = (function(n) {
            if (n >= 8388608) n = 8388608; else {
                n--;
                for (var p = 1; p < 32; p <<= 1) n |= n >> p;
                n++;
            }
            return n;
        })(n)), n > state.length ? state.ended ? state.length : (state.needReadable = !0, 
        0) : n);
    }
    function emitReadable(stream) {
        var state = stream._readableState;
        state.needReadable = !1, state.emittedReadable || (debug("emitReadable", state.flowing), 
        state.emittedReadable = !0, state.sync ? process.nextTick((function() {
            emitReadable_(stream);
        })) : emitReadable_(stream));
    }
    function emitReadable_(stream) {
        debug("emit readable"), stream.emit("readable"), flow(stream);
    }
    function flow(stream) {
        var state = stream._readableState;
        if (debug("flow", state.flowing), state.flowing) do {
            var chunk = stream.read();
        } while (null !== chunk && state.flowing);
    }
    function fromList(n, state) {
        var ret, list = state.buffer, length = state.length, stringMode = !!state.decoder, objectMode = !!state.objectMode;
        if (0 === list.length) return null;
        if (0 === length) ret = null; else if (objectMode) ret = list.shift(); else if (!n || n >= length) ret = stringMode ? list.join("") : Buffer.concat(list, length), 
        list.length = 0; else if (n < list[0].length) ret = (buf = list[0]).slice(0, n), 
        list[0] = buf.slice(n); else if (n === list[0].length) ret = list.shift(); else {
            ret = stringMode ? "" : new Buffer(n);
            for (var c = 0, i = 0, l = list.length; i < l && c < n; i++) {
                var buf = list[0], cpy = Math.min(n - c, buf.length);
                stringMode ? ret += buf.slice(0, cpy) : buf.copy(ret, c, 0, cpy), cpy < buf.length ? list[0] = buf.slice(cpy) : list.shift(), 
                c += cpy;
            }
        }
        return ret;
    }
    function endReadable(stream) {
        var state = stream._readableState;
        if (state.length > 0) throw new Error("endReadable called on non-empty stream");
        state.endEmitted || (state.ended = !0, process.nextTick((function() {
            state.endEmitted || 0 !== state.length || (state.endEmitted = !0, stream.readable = !1, 
            stream.emit("end"));
        })));
    }
    debug = debug && debug.debuglog ? debug.debuglog("stream") : function() {}, util.inherits(Readable, Stream), 
    Readable.prototype.push = function(chunk, encoding) {
        var state = this._readableState;
        return util.isString(chunk) && !state.objectMode && (encoding = encoding || state.defaultEncoding) !== state.encoding && (chunk = new Buffer(chunk, encoding), 
        encoding = ""), readableAddChunk(this, state, chunk, encoding, !1);
    }, Readable.prototype.unshift = function(chunk) {
        return readableAddChunk(this, this._readableState, chunk, "", !0);
    }, Readable.prototype.setEncoding = function(enc) {
        return StringDecoder || (StringDecoder = __webpack_require__(385).StringDecoder), 
        this._readableState.decoder = new StringDecoder(enc), this._readableState.encoding = enc, 
        this;
    }, Readable.prototype.read = function(n) {
        debug("read", n);
        var state = this._readableState, nOrig = n;
        if ((!util.isNumber(n) || n > 0) && (state.emittedReadable = !1), 0 === n && state.needReadable && (state.length >= state.highWaterMark || state.ended)) return debug("read: emitReadable", state.length, state.ended), 
        0 === state.length && state.ended ? endReadable(this) : emitReadable(this), null;
        if (0 === (n = howMuchToRead(n, state)) && state.ended) return 0 === state.length && endReadable(this), 
        null;
        var ret, doRead = state.needReadable;
        return debug("need readable", doRead), (0 === state.length || state.length - n < state.highWaterMark) && debug("length less than watermark", doRead = !0), 
        (state.ended || state.reading) && debug("reading or ended", doRead = !1), doRead && (debug("do read"), 
        state.reading = !0, state.sync = !0, 0 === state.length && (state.needReadable = !0), 
        this._read(state.highWaterMark), state.sync = !1), doRead && !state.reading && (n = howMuchToRead(nOrig, state)), 
        ret = n > 0 ? fromList(n, state) : null, util.isNull(ret) && (state.needReadable = !0, 
        n = 0), state.length -= n, 0 !== state.length || state.ended || (state.needReadable = !0), 
        nOrig !== n && state.ended && 0 === state.length && endReadable(this), util.isNull(ret) || this.emit("data", ret), 
        ret;
    }, Readable.prototype._read = function(n) {
        this.emit("error", new Error("not implemented"));
    }, Readable.prototype.pipe = function(dest, pipeOpts) {
        var src = this, state = this._readableState;
        switch (state.pipesCount) {
          case 0:
            state.pipes = dest;
            break;

          case 1:
            state.pipes = [ state.pipes, dest ];
            break;

          default:
            state.pipes.push(dest);
        }
        state.pipesCount += 1, debug("pipe count=%d opts=%j", state.pipesCount, pipeOpts);
        var endFn = pipeOpts && !1 === pipeOpts.end || dest === process.stdout || dest === process.stderr ? cleanup : onend;
        function onunpipe(readable) {
            debug("onunpipe"), readable === src && cleanup();
        }
        function onend() {
            debug("onend"), dest.end();
        }
        state.endEmitted ? process.nextTick(endFn) : src.once("end", endFn), dest.on("unpipe", onunpipe);
        var ondrain = (function(src) {
            return function() {
                var state = src._readableState;
                debug("pipeOnDrain", state.awaitDrain), state.awaitDrain && state.awaitDrain--, 
                0 === state.awaitDrain && EE.listenerCount(src, "data") && (state.flowing = !0, 
                flow(src));
            };
        })(src);
        function cleanup() {
            debug("cleanup"), dest.removeListener("close", onclose), dest.removeListener("finish", onfinish), 
            dest.removeListener("drain", ondrain), dest.removeListener("error", onerror), dest.removeListener("unpipe", onunpipe), 
            src.removeListener("end", onend), src.removeListener("end", cleanup), src.removeListener("data", ondata), 
            !state.awaitDrain || dest._writableState && !dest._writableState.needDrain || ondrain();
        }
        function ondata(chunk) {
            debug("ondata"), !1 === dest.write(chunk) && (debug("false write response, pause", src._readableState.awaitDrain), 
            src._readableState.awaitDrain++, src.pause());
        }
        function onerror(er) {
            debug("onerror", er), unpipe(), dest.removeListener("error", onerror), 0 === EE.listenerCount(dest, "error") && dest.emit("error", er);
        }
        function onclose() {
            dest.removeListener("finish", onfinish), unpipe();
        }
        function onfinish() {
            debug("onfinish"), dest.removeListener("close", onclose), unpipe();
        }
        function unpipe() {
            debug("unpipe"), src.unpipe(dest);
        }
        return dest.on("drain", ondrain), src.on("data", ondata), dest._events && dest._events.error ? isArray(dest._events.error) ? dest._events.error.unshift(onerror) : dest._events.error = [ onerror, dest._events.error ] : dest.on("error", onerror), 
        dest.once("close", onclose), dest.once("finish", onfinish), dest.emit("pipe", src), 
        state.flowing || (debug("pipe resume"), src.resume()), dest;
    }, Readable.prototype.unpipe = function(dest) {
        var state = this._readableState;
        if (0 === state.pipesCount) return this;
        if (1 === state.pipesCount) return dest && dest !== state.pipes || (dest || (dest = state.pipes), 
        state.pipes = null, state.pipesCount = 0, state.flowing = !1, dest && dest.emit("unpipe", this)), 
        this;
        if (!dest) {
            var dests = state.pipes, len = state.pipesCount;
            state.pipes = null, state.pipesCount = 0, state.flowing = !1;
            for (var i = 0; i < len; i++) dests[i].emit("unpipe", this);
            return this;
        }
        return -1 === (i = (function(xs, x) {
            for (var i = 0, l = xs.length; i < l; i++) if (xs[i] === x) return i;
            return -1;
        })(state.pipes, dest)) || (state.pipes.splice(i, 1), state.pipesCount -= 1, 1 === state.pipesCount && (state.pipes = state.pipes[0]), 
        dest.emit("unpipe", this)), this;
    }, Readable.prototype.on = function(ev, fn) {
        var res = Stream.prototype.on.call(this, ev, fn);
        if ("data" === ev && !1 !== this._readableState.flowing && this.resume(), "readable" === ev && this.readable) {
            var state = this._readableState;
            if (!state.readableListening) if (state.readableListening = !0, state.emittedReadable = !1, 
            state.needReadable = !0, state.reading) state.length && emitReadable(this); else {
                var self = this;
                process.nextTick((function() {
                    debug("readable nexttick read 0"), self.read(0);
                }));
            }
        }
        return res;
    }, Readable.prototype.addListener = Readable.prototype.on, Readable.prototype.resume = function() {
        var state = this._readableState;
        return state.flowing || (debug("resume"), state.flowing = !0, state.reading || (debug("resume read 0"), 
        this.read(0)), (function(stream, state) {
            state.resumeScheduled || (state.resumeScheduled = !0, process.nextTick((function() {
                !(function(stream, state) {
                    state.resumeScheduled = !1, stream.emit("resume"), flow(stream), state.flowing && !state.reading && stream.read(0);
                })(stream, state);
            })));
        })(this, state)), this;
    }, Readable.prototype.pause = function() {
        return debug("call pause flowing=%j", this._readableState.flowing), !1 !== this._readableState.flowing && (debug("pause"), 
        this._readableState.flowing = !1, this.emit("pause")), this;
    }, Readable.prototype.wrap = function(stream) {
        var state = this._readableState, paused = !1, self = this;
        for (var i in stream.on("end", (function() {
            if (debug("wrapped end"), state.decoder && !state.ended) {
                var chunk = state.decoder.end();
                chunk && chunk.length && self.push(chunk);
            }
            self.push(null);
        })), stream.on("data", (function(chunk) {
            debug("wrapped data"), state.decoder && (chunk = state.decoder.write(chunk)), chunk && (state.objectMode || chunk.length) && (self.push(chunk) || (paused = !0, 
            stream.pause()));
        })), stream) util.isFunction(stream[i]) && util.isUndefined(this[i]) && (this[i] = (function(method) {
            return function() {
                return stream[method].apply(stream, arguments);
            };
        })(i));
        return (function(xs, f) {
            for (var i = 0, l = xs.length; i < l; i++) ev = xs[i], stream.on(ev, self.emit.bind(self, ev));
            var ev;
        })([ "error", "close", "destroy", "pause", "resume" ]), self._read = function(n) {
            debug("wrapped _read", n), paused && (paused = !1, stream.resume());
        }, self;
    }, Readable._fromList = fromList;
}
