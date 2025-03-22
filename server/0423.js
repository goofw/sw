function(module, exports, __webpack_require__) {
    "use strict";
    var Duplex;
    module.exports = Readable, Readable.ReadableState = ReadableState, __webpack_require__(5).EventEmitter;
    var debug, EElistenerCount = function(emitter, type) {
        return emitter.listeners(type).length;
    }, Stream = __webpack_require__(424), Buffer = __webpack_require__(10).Buffer, OurUint8Array = global.Uint8Array || function() {}, debugUtil = __webpack_require__(0);
    debug = debugUtil && debugUtil.debuglog ? debugUtil.debuglog("stream") : function() {};
    var StringDecoder, createReadableStreamAsyncIterator, from, BufferList = __webpack_require__(847), destroyImpl = __webpack_require__(425), getHighWaterMark = __webpack_require__(426).getHighWaterMark, _require$codes = __webpack_require__(65).codes, ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE, ERR_STREAM_PUSH_AFTER_EOF = _require$codes.ERR_STREAM_PUSH_AFTER_EOF, ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED, ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require$codes.ERR_STREAM_UNSHIFT_AFTER_END_EVENT;
    __webpack_require__(6)(Readable, Stream);
    var errorOrDestroy = destroyImpl.errorOrDestroy, kProxyEvents = [ "error", "close", "destroy", "pause", "resume" ];
    function ReadableState(options, stream, isDuplex) {
        Duplex = Duplex || __webpack_require__(76), options = options || {}, "boolean" != typeof isDuplex && (isDuplex = stream instanceof Duplex), 
        this.objectMode = !!options.objectMode, isDuplex && (this.objectMode = this.objectMode || !!options.readableObjectMode), 
        this.highWaterMark = getHighWaterMark(this, options, "readableHighWaterMark", isDuplex), 
        this.buffer = new BufferList, this.length = 0, this.pipes = null, this.pipesCount = 0, 
        this.flowing = null, this.ended = !1, this.endEmitted = !1, this.reading = !1, this.sync = !0, 
        this.needReadable = !1, this.emittedReadable = !1, this.readableListening = !1, 
        this.resumeScheduled = !1, this.paused = !0, this.emitClose = !1 !== options.emitClose, 
        this.autoDestroy = !!options.autoDestroy, this.destroyed = !1, this.defaultEncoding = options.defaultEncoding || "utf8", 
        this.awaitDrain = 0, this.readingMore = !1, this.decoder = null, this.encoding = null, 
        options.encoding && (StringDecoder || (StringDecoder = __webpack_require__(133).StringDecoder), 
        this.decoder = new StringDecoder(options.encoding), this.encoding = options.encoding);
    }
    function Readable(options) {
        if (Duplex = Duplex || __webpack_require__(76), !(this instanceof Readable)) return new Readable(options);
        var isDuplex = this instanceof Duplex;
        this._readableState = new ReadableState(options, this, isDuplex), this.readable = !0, 
        options && ("function" == typeof options.read && (this._read = options.read), "function" == typeof options.destroy && (this._destroy = options.destroy)), 
        Stream.call(this);
    }
    function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
        debug("readableAddChunk", chunk);
        var er, state = stream._readableState;
        if (null === chunk) state.reading = !1, (function(stream, state) {
            if (debug("onEofChunk"), !state.ended) {
                if (state.decoder) {
                    var chunk = state.decoder.end();
                    chunk && chunk.length && (state.buffer.push(chunk), state.length += state.objectMode ? 1 : chunk.length);
                }
                state.ended = !0, state.sync ? emitReadable(stream) : (state.needReadable = !1, 
                state.emittedReadable || (state.emittedReadable = !0, emitReadable_(stream)));
            }
        })(stream, state); else if (skipChunkCheck || (er = (function(state, chunk) {
            var er, obj;
            return obj = chunk, Buffer.isBuffer(obj) || obj instanceof OurUint8Array || "string" == typeof chunk || void 0 === chunk || state.objectMode || (er = new ERR_INVALID_ARG_TYPE("chunk", [ "string", "Buffer", "Uint8Array" ], chunk)), 
            er;
        })(state, chunk)), er) errorOrDestroy(stream, er); else if (state.objectMode || chunk && chunk.length > 0) if ("string" == typeof chunk || state.objectMode || Object.getPrototypeOf(chunk) === Buffer.prototype || (chunk = (function(chunk) {
            return Buffer.from(chunk);
        })(chunk)), addToFront) state.endEmitted ? errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT) : addChunk(stream, state, chunk, !0); else if (state.ended) errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF); else {
            if (state.destroyed) return !1;
            state.reading = !1, state.decoder && !encoding ? (chunk = state.decoder.write(chunk), 
            state.objectMode || 0 !== chunk.length ? addChunk(stream, state, chunk, !1) : maybeReadMore(stream, state)) : addChunk(stream, state, chunk, !1);
        } else addToFront || (state.reading = !1, maybeReadMore(stream, state));
        return !state.ended && (state.length < state.highWaterMark || 0 === state.length);
    }
    function addChunk(stream, state, chunk, addToFront) {
        state.flowing && 0 === state.length && !state.sync ? (state.awaitDrain = 0, stream.emit("data", chunk)) : (state.length += state.objectMode ? 1 : chunk.length, 
        addToFront ? state.buffer.unshift(chunk) : state.buffer.push(chunk), state.needReadable && emitReadable(stream)), 
        maybeReadMore(stream, state);
    }
    function howMuchToRead(n, state) {
        return n <= 0 || 0 === state.length && state.ended ? 0 : state.objectMode ? 1 : n != n ? state.flowing && state.length ? state.buffer.head.data.length : state.length : (n > state.highWaterMark && (state.highWaterMark = (function(n) {
            return n >= 1073741824 ? n = 1073741824 : (n--, n |= n >>> 1, n |= n >>> 2, n |= n >>> 4, 
            n |= n >>> 8, n |= n >>> 16, n++), n;
        })(n)), n <= state.length ? n : state.ended ? state.length : (state.needReadable = !0, 
        0));
    }
    function emitReadable(stream) {
        var state = stream._readableState;
        debug("emitReadable", state.needReadable, state.emittedReadable), state.needReadable = !1, 
        state.emittedReadable || (debug("emitReadable", state.flowing), state.emittedReadable = !0, 
        process.nextTick(emitReadable_, stream));
    }
    function emitReadable_(stream) {
        var state = stream._readableState;
        debug("emitReadable_", state.destroyed, state.length, state.ended), state.destroyed || !state.length && !state.ended || (stream.emit("readable"), 
        state.emittedReadable = !1), state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark, 
        flow(stream);
    }
    function maybeReadMore(stream, state) {
        state.readingMore || (state.readingMore = !0, process.nextTick(maybeReadMore_, stream, state));
    }
    function maybeReadMore_(stream, state) {
        for (;!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && 0 === state.length); ) {
            var len = state.length;
            if (debug("maybeReadMore read 0"), stream.read(0), len === state.length) break;
        }
        state.readingMore = !1;
    }
    function updateReadableListening(self) {
        var state = self._readableState;
        state.readableListening = self.listenerCount("readable") > 0, state.resumeScheduled && !state.paused ? state.flowing = !0 : self.listenerCount("data") > 0 && self.resume();
    }
    function nReadingNextTick(self) {
        debug("readable nexttick read 0"), self.read(0);
    }
    function resume_(stream, state) {
        debug("resume", state.reading), state.reading || stream.read(0), state.resumeScheduled = !1, 
        stream.emit("resume"), flow(stream), state.flowing && !state.reading && stream.read(0);
    }
    function flow(stream) {
        var state = stream._readableState;
        for (debug("flow", state.flowing); state.flowing && null !== stream.read(); ) ;
    }
    function fromList(n, state) {
        return 0 === state.length ? null : (state.objectMode ? ret = state.buffer.shift() : !n || n >= state.length ? (ret = state.decoder ? state.buffer.join("") : 1 === state.buffer.length ? state.buffer.first() : state.buffer.concat(state.length), 
        state.buffer.clear()) : ret = state.buffer.consume(n, state.decoder), ret);
        var ret;
    }
    function endReadable(stream) {
        var state = stream._readableState;
        debug("endReadable", state.endEmitted), state.endEmitted || (state.ended = !0, process.nextTick(endReadableNT, state, stream));
    }
    function endReadableNT(state, stream) {
        if (debug("endReadableNT", state.endEmitted, state.length), !state.endEmitted && 0 === state.length && (state.endEmitted = !0, 
        stream.readable = !1, stream.emit("end"), state.autoDestroy)) {
            var wState = stream._writableState;
            (!wState || wState.autoDestroy && wState.finished) && stream.destroy();
        }
    }
    function indexOf(xs, x) {
        for (var i = 0, l = xs.length; i < l; i++) if (xs[i] === x) return i;
        return -1;
    }
    Object.defineProperty(Readable.prototype, "destroyed", {
        enumerable: !1,
        get: function() {
            return void 0 !== this._readableState && this._readableState.destroyed;
        },
        set: function(value) {
            this._readableState && (this._readableState.destroyed = value);
        }
    }), Readable.prototype.destroy = destroyImpl.destroy, Readable.prototype._undestroy = destroyImpl.undestroy, 
    Readable.prototype._destroy = function(err, cb) {
        cb(err);
    }, Readable.prototype.push = function(chunk, encoding) {
        var skipChunkCheck, state = this._readableState;
        return state.objectMode ? skipChunkCheck = !0 : "string" == typeof chunk && ((encoding = encoding || state.defaultEncoding) !== state.encoding && (chunk = Buffer.from(chunk, encoding), 
        encoding = ""), skipChunkCheck = !0), readableAddChunk(this, chunk, encoding, !1, skipChunkCheck);
    }, Readable.prototype.unshift = function(chunk) {
        return readableAddChunk(this, chunk, null, !0, !1);
    }, Readable.prototype.isPaused = function() {
        return !1 === this._readableState.flowing;
    }, Readable.prototype.setEncoding = function(enc) {
        StringDecoder || (StringDecoder = __webpack_require__(133).StringDecoder);
        var decoder = new StringDecoder(enc);
        this._readableState.decoder = decoder, this._readableState.encoding = this._readableState.decoder.encoding;
        for (var p = this._readableState.buffer.head, content = ""; null !== p; ) content += decoder.write(p.data), 
        p = p.next;
        return this._readableState.buffer.clear(), "" !== content && this._readableState.buffer.push(content), 
        this._readableState.length = content.length, this;
    }, Readable.prototype.read = function(n) {
        debug("read", n), n = parseInt(n, 10);
        var state = this._readableState, nOrig = n;
        if (0 !== n && (state.emittedReadable = !1), 0 === n && state.needReadable && ((0 !== state.highWaterMark ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) return debug("read: emitReadable", state.length, state.ended), 
        0 === state.length && state.ended ? endReadable(this) : emitReadable(this), null;
        if (0 === (n = howMuchToRead(n, state)) && state.ended) return 0 === state.length && endReadable(this), 
        null;
        var ret, doRead = state.needReadable;
        return debug("need readable", doRead), (0 === state.length || state.length - n < state.highWaterMark) && debug("length less than watermark", doRead = !0), 
        state.ended || state.reading ? debug("reading or ended", doRead = !1) : doRead && (debug("do read"), 
        state.reading = !0, state.sync = !0, 0 === state.length && (state.needReadable = !0), 
        this._read(state.highWaterMark), state.sync = !1, state.reading || (n = howMuchToRead(nOrig, state))), 
        null === (ret = n > 0 ? fromList(n, state) : null) ? (state.needReadable = state.length <= state.highWaterMark, 
        n = 0) : (state.length -= n, state.awaitDrain = 0), 0 === state.length && (state.ended || (state.needReadable = !0), 
        nOrig !== n && state.ended && endReadable(this)), null !== ret && this.emit("data", ret), 
        ret;
    }, Readable.prototype._read = function(n) {
        errorOrDestroy(this, new ERR_METHOD_NOT_IMPLEMENTED("_read()"));
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
        var endFn = pipeOpts && !1 === pipeOpts.end || dest === process.stdout || dest === process.stderr ? unpipe : onend;
        function onend() {
            debug("onend"), dest.end();
        }
        state.endEmitted ? process.nextTick(endFn) : src.once("end", endFn), dest.on("unpipe", (function onunpipe(readable, unpipeInfo) {
            debug("onunpipe"), readable === src && unpipeInfo && !1 === unpipeInfo.hasUnpiped && (unpipeInfo.hasUnpiped = !0, 
            debug("cleanup"), dest.removeListener("close", onclose), dest.removeListener("finish", onfinish), 
            dest.removeListener("drain", ondrain), dest.removeListener("error", onerror), dest.removeListener("unpipe", onunpipe), 
            src.removeListener("end", onend), src.removeListener("end", unpipe), src.removeListener("data", ondata), 
            cleanedUp = !0, !state.awaitDrain || dest._writableState && !dest._writableState.needDrain || ondrain());
        }));
        var ondrain = (function(src) {
            return function() {
                var state = src._readableState;
                debug("pipeOnDrain", state.awaitDrain), state.awaitDrain && state.awaitDrain--, 
                0 === state.awaitDrain && EElistenerCount(src, "data") && (state.flowing = !0, flow(src));
            };
        })(src);
        dest.on("drain", ondrain);
        var cleanedUp = !1;
        function ondata(chunk) {
            debug("ondata");
            var ret = dest.write(chunk);
            debug("dest.write", ret), !1 === ret && ((1 === state.pipesCount && state.pipes === dest || state.pipesCount > 1 && -1 !== indexOf(state.pipes, dest)) && !cleanedUp && (debug("false write response, pause", state.awaitDrain), 
            state.awaitDrain++), src.pause());
        }
        function onerror(er) {
            debug("onerror", er), unpipe(), dest.removeListener("error", onerror), 0 === EElistenerCount(dest, "error") && errorOrDestroy(dest, er);
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
        return src.on("data", ondata), (function(emitter, event, fn) {
            if ("function" == typeof emitter.prependListener) return emitter.prependListener("error", fn);
            emitter._events && emitter._events.error ? Array.isArray(emitter._events.error) ? emitter._events.error.unshift(fn) : emitter._events.error = [ fn, emitter._events.error ] : emitter.on("error", fn);
        })(dest, 0, onerror), dest.once("close", onclose), dest.once("finish", onfinish), 
        dest.emit("pipe", src), state.flowing || (debug("pipe resume"), src.resume()), dest;
    }, Readable.prototype.unpipe = function(dest) {
        var state = this._readableState, unpipeInfo = {
            hasUnpiped: !1
        };
        if (0 === state.pipesCount) return this;
        if (1 === state.pipesCount) return dest && dest !== state.pipes || (dest || (dest = state.pipes), 
        state.pipes = null, state.pipesCount = 0, state.flowing = !1, dest && dest.emit("unpipe", this, unpipeInfo)), 
        this;
        if (!dest) {
            var dests = state.pipes, len = state.pipesCount;
            state.pipes = null, state.pipesCount = 0, state.flowing = !1;
            for (var i = 0; i < len; i++) dests[i].emit("unpipe", this, {
                hasUnpiped: !1
            });
            return this;
        }
        var index = indexOf(state.pipes, dest);
        return -1 === index || (state.pipes.splice(index, 1), state.pipesCount -= 1, 1 === state.pipesCount && (state.pipes = state.pipes[0]), 
        dest.emit("unpipe", this, unpipeInfo)), this;
    }, Readable.prototype.on = function(ev, fn) {
        var res = Stream.prototype.on.call(this, ev, fn), state = this._readableState;
        return "data" === ev ? (state.readableListening = this.listenerCount("readable") > 0, 
        !1 !== state.flowing && this.resume()) : "readable" === ev && (state.endEmitted || state.readableListening || (state.readableListening = state.needReadable = !0, 
        state.flowing = !1, state.emittedReadable = !1, debug("on readable", state.length, state.reading), 
        state.length ? emitReadable(this) : state.reading || process.nextTick(nReadingNextTick, this))), 
        res;
    }, Readable.prototype.addListener = Readable.prototype.on, Readable.prototype.removeListener = function(ev, fn) {
        var res = Stream.prototype.removeListener.call(this, ev, fn);
        return "readable" === ev && process.nextTick(updateReadableListening, this), res;
    }, Readable.prototype.removeAllListeners = function(ev) {
        var res = Stream.prototype.removeAllListeners.apply(this, arguments);
        return "readable" !== ev && void 0 !== ev || process.nextTick(updateReadableListening, this), 
        res;
    }, Readable.prototype.resume = function() {
        var state = this._readableState;
        return state.flowing || (debug("resume"), state.flowing = !state.readableListening, 
        (function(stream, state) {
            state.resumeScheduled || (state.resumeScheduled = !0, process.nextTick(resume_, stream, state));
        })(this, state)), state.paused = !1, this;
    }, Readable.prototype.pause = function() {
        return debug("call pause flowing=%j", this._readableState.flowing), !1 !== this._readableState.flowing && (debug("pause"), 
        this._readableState.flowing = !1, this.emit("pause")), this._readableState.paused = !0, 
        this;
    }, Readable.prototype.wrap = function(stream) {
        var _this = this, state = this._readableState, paused = !1;
        for (var i in stream.on("end", (function() {
            if (debug("wrapped end"), state.decoder && !state.ended) {
                var chunk = state.decoder.end();
                chunk && chunk.length && _this.push(chunk);
            }
            _this.push(null);
        })), stream.on("data", (function(chunk) {
            debug("wrapped data"), state.decoder && (chunk = state.decoder.write(chunk)), state.objectMode && null == chunk || (state.objectMode || chunk && chunk.length) && (_this.push(chunk) || (paused = !0, 
            stream.pause()));
        })), stream) void 0 === this[i] && "function" == typeof stream[i] && (this[i] = (function(method) {
            return function() {
                return stream[method].apply(stream, arguments);
            };
        })(i));
        for (var n = 0; n < kProxyEvents.length; n++) stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
        return this._read = function(n) {
            debug("wrapped _read", n), paused && (paused = !1, stream.resume());
        }, this;
    }, "function" == typeof Symbol && (Readable.prototype[Symbol.asyncIterator] = function() {
        return void 0 === createReadableStreamAsyncIterator && (createReadableStreamAsyncIterator = __webpack_require__(848)), 
        createReadableStreamAsyncIterator(this);
    }), Object.defineProperty(Readable.prototype, "readableHighWaterMark", {
        enumerable: !1,
        get: function() {
            return this._readableState.highWaterMark;
        }
    }), Object.defineProperty(Readable.prototype, "readableBuffer", {
        enumerable: !1,
        get: function() {
            return this._readableState && this._readableState.buffer;
        }
    }), Object.defineProperty(Readable.prototype, "readableFlowing", {
        enumerable: !1,
        get: function() {
            return this._readableState.flowing;
        },
        set: function(state) {
            this._readableState && (this._readableState.flowing = state);
        }
    }), Readable._fromList = fromList, Object.defineProperty(Readable.prototype, "readableLength", {
        enumerable: !1,
        get: function() {
            return this._readableState.length;
        }
    }), "function" == typeof Symbol && (Readable.from = function(iterable, opts) {
        return void 0 === from && (from = __webpack_require__(849)), from(Readable, iterable, opts);
    });
}
