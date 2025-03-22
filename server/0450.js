function(module, exports, __webpack_require__) {
    "use strict";
    var pna = __webpack_require__(53);
    module.exports = Readable;
    var Duplex, isArray = __webpack_require__(392);
    Readable.ReadableState = ReadableState, __webpack_require__(5).EventEmitter;
    var EElistenerCount = function(emitter, type) {
        return emitter.listeners(type).length;
    }, Stream = __webpack_require__(451), Buffer = __webpack_require__(23).Buffer, OurUint8Array = global.Uint8Array || function() {}, util = __webpack_require__(32);
    util.inherits = __webpack_require__(96);
    var debugUtil = __webpack_require__(0), debug = void 0;
    debug = debugUtil && debugUtil.debuglog ? debugUtil.debuglog("stream") : function() {};
    var StringDecoder, BufferList = __webpack_require__(963), destroyImpl = __webpack_require__(452);
    util.inherits(Readable, Stream);
    var kProxyEvents = [ "error", "close", "destroy", "pause", "resume" ];
    function ReadableState(options, stream) {
        options = options || {};
        var isDuplex = stream instanceof (Duplex = Duplex || __webpack_require__(78));
        this.objectMode = !!options.objectMode, isDuplex && (this.objectMode = this.objectMode || !!options.readableObjectMode);
        var hwm = options.highWaterMark, readableHwm = options.readableHighWaterMark, defaultHwm = this.objectMode ? 16 : 16384;
        this.highWaterMark = hwm || 0 === hwm ? hwm : isDuplex && (readableHwm || 0 === readableHwm) ? readableHwm : defaultHwm, 
        this.highWaterMark = Math.floor(this.highWaterMark), this.buffer = new BufferList, 
        this.length = 0, this.pipes = null, this.pipesCount = 0, this.flowing = null, this.ended = !1, 
        this.endEmitted = !1, this.reading = !1, this.sync = !0, this.needReadable = !1, 
        this.emittedReadable = !1, this.readableListening = !1, this.resumeScheduled = !1, 
        this.destroyed = !1, this.defaultEncoding = options.defaultEncoding || "utf8", this.awaitDrain = 0, 
        this.readingMore = !1, this.decoder = null, this.encoding = null, options.encoding && (StringDecoder || (StringDecoder = __webpack_require__(454).StringDecoder), 
        this.decoder = new StringDecoder(options.encoding), this.encoding = options.encoding);
    }
    function Readable(options) {
        if (Duplex = Duplex || __webpack_require__(78), !(this instanceof Readable)) return new Readable(options);
        this._readableState = new ReadableState(options, this), this.readable = !0, options && ("function" == typeof options.read && (this._read = options.read), 
        "function" == typeof options.destroy && (this._destroy = options.destroy)), Stream.call(this);
    }
    function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
        var er, state = stream._readableState;
        return null === chunk ? (state.reading = !1, (function(stream, state) {
            if (!state.ended) {
                if (state.decoder) {
                    var chunk = state.decoder.end();
                    chunk && chunk.length && (state.buffer.push(chunk), state.length += state.objectMode ? 1 : chunk.length);
                }
                state.ended = !0, emitReadable(stream);
            }
        })(stream, state)) : (skipChunkCheck || (er = (function(state, chunk) {
            var er, obj;
            return obj = chunk, Buffer.isBuffer(obj) || obj instanceof OurUint8Array || "string" == typeof chunk || void 0 === chunk || state.objectMode || (er = new TypeError("Invalid non-string/buffer chunk")), 
            er;
        })(state, chunk)), er ? stream.emit("error", er) : state.objectMode || chunk && chunk.length > 0 ? ("string" == typeof chunk || state.objectMode || Object.getPrototypeOf(chunk) === Buffer.prototype || (chunk = (function(chunk) {
            return Buffer.from(chunk);
        })(chunk)), addToFront ? state.endEmitted ? stream.emit("error", new Error("stream.unshift() after end event")) : addChunk(stream, state, chunk, !0) : state.ended ? stream.emit("error", new Error("stream.push() after EOF")) : (state.reading = !1, 
        state.decoder && !encoding ? (chunk = state.decoder.write(chunk), state.objectMode || 0 !== chunk.length ? addChunk(stream, state, chunk, !1) : maybeReadMore(stream, state)) : addChunk(stream, state, chunk, !1))) : addToFront || (state.reading = !1)), 
        (function(state) {
            return !state.ended && (state.needReadable || state.length < state.highWaterMark || 0 === state.length);
        })(state);
    }
    function addChunk(stream, state, chunk, addToFront) {
        state.flowing && 0 === state.length && !state.sync ? (stream.emit("data", chunk), 
        stream.read(0)) : (state.length += state.objectMode ? 1 : chunk.length, addToFront ? state.buffer.unshift(chunk) : state.buffer.push(chunk), 
        state.needReadable && emitReadable(stream)), maybeReadMore(stream, state);
    }
    function howMuchToRead(n, state) {
        return n <= 0 || 0 === state.length && state.ended ? 0 : state.objectMode ? 1 : n != n ? state.flowing && state.length ? state.buffer.head.data.length : state.length : (n > state.highWaterMark && (state.highWaterMark = (function(n) {
            return n >= 8388608 ? n = 8388608 : (n--, n |= n >>> 1, n |= n >>> 2, n |= n >>> 4, 
            n |= n >>> 8, n |= n >>> 16, n++), n;
        })(n)), n <= state.length ? n : state.ended ? state.length : (state.needReadable = !0, 
        0));
    }
    function emitReadable(stream) {
        var state = stream._readableState;
        state.needReadable = !1, state.emittedReadable || (debug("emitReadable", state.flowing), 
        state.emittedReadable = !0, state.sync ? pna.nextTick(emitReadable_, stream) : emitReadable_(stream));
    }
    function emitReadable_(stream) {
        debug("emit readable"), stream.emit("readable"), flow(stream);
    }
    function maybeReadMore(stream, state) {
        state.readingMore || (state.readingMore = !0, pna.nextTick(maybeReadMore_, stream, state));
    }
    function maybeReadMore_(stream, state) {
        for (var len = state.length; !state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark && (debug("maybeReadMore read 0"), 
        stream.read(0), len !== state.length); ) len = state.length;
        state.readingMore = !1;
    }
    function nReadingNextTick(self) {
        debug("readable nexttick read 0"), self.read(0);
    }
    function resume_(stream, state) {
        state.reading || (debug("resume read 0"), stream.read(0)), state.resumeScheduled = !1, 
        state.awaitDrain = 0, stream.emit("resume"), flow(stream), state.flowing && !state.reading && stream.read(0);
    }
    function flow(stream) {
        var state = stream._readableState;
        for (debug("flow", state.flowing); state.flowing && null !== stream.read(); ) ;
    }
    function fromList(n, state) {
        return 0 === state.length ? null : (state.objectMode ? ret = state.buffer.shift() : !n || n >= state.length ? (ret = state.decoder ? state.buffer.join("") : 1 === state.buffer.length ? state.buffer.head.data : state.buffer.concat(state.length), 
        state.buffer.clear()) : ret = (function(n, list, hasStrings) {
            var ret;
            return n < list.head.data.length ? (ret = list.head.data.slice(0, n), list.head.data = list.head.data.slice(n)) : ret = n === list.head.data.length ? list.shift() : hasStrings ? (function(n, list) {
                var p = list.head, c = 1, ret = p.data;
                for (n -= ret.length; p = p.next; ) {
                    var str = p.data, nb = n > str.length ? str.length : n;
                    if (nb === str.length ? ret += str : ret += str.slice(0, n), 0 == (n -= nb)) {
                        nb === str.length ? (++c, p.next ? list.head = p.next : list.head = list.tail = null) : (list.head = p, 
                        p.data = str.slice(nb));
                        break;
                    }
                    ++c;
                }
                return list.length -= c, ret;
            })(n, list) : (function(n, list) {
                var ret = Buffer.allocUnsafe(n), p = list.head, c = 1;
                for (p.data.copy(ret), n -= p.data.length; p = p.next; ) {
                    var buf = p.data, nb = n > buf.length ? buf.length : n;
                    if (buf.copy(ret, ret.length - n, 0, nb), 0 == (n -= nb)) {
                        nb === buf.length ? (++c, p.next ? list.head = p.next : list.head = list.tail = null) : (list.head = p, 
                        p.data = buf.slice(nb));
                        break;
                    }
                    ++c;
                }
                return list.length -= c, ret;
            })(n, list), ret;
        })(n, state.buffer, state.decoder), ret);
        var ret;
    }
    function endReadable(stream) {
        var state = stream._readableState;
        if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');
        state.endEmitted || (state.ended = !0, pna.nextTick(endReadableNT, state, stream));
    }
    function endReadableNT(state, stream) {
        state.endEmitted || 0 !== state.length || (state.endEmitted = !0, stream.readable = !1, 
        stream.emit("end"));
    }
    function indexOf(xs, x) {
        for (var i = 0, l = xs.length; i < l; i++) if (xs[i] === x) return i;
        return -1;
    }
    Object.defineProperty(Readable.prototype, "destroyed", {
        get: function() {
            return void 0 !== this._readableState && this._readableState.destroyed;
        },
        set: function(value) {
            this._readableState && (this._readableState.destroyed = value);
        }
    }), Readable.prototype.destroy = destroyImpl.destroy, Readable.prototype._undestroy = destroyImpl.undestroy, 
    Readable.prototype._destroy = function(err, cb) {
        this.push(null), cb(err);
    }, Readable.prototype.push = function(chunk, encoding) {
        var skipChunkCheck, state = this._readableState;
        return state.objectMode ? skipChunkCheck = !0 : "string" == typeof chunk && ((encoding = encoding || state.defaultEncoding) !== state.encoding && (chunk = Buffer.from(chunk, encoding), 
        encoding = ""), skipChunkCheck = !0), readableAddChunk(this, chunk, encoding, !1, skipChunkCheck);
    }, Readable.prototype.unshift = function(chunk) {
        return readableAddChunk(this, chunk, null, !0, !1);
    }, Readable.prototype.isPaused = function() {
        return !1 === this._readableState.flowing;
    }, Readable.prototype.setEncoding = function(enc) {
        return StringDecoder || (StringDecoder = __webpack_require__(454).StringDecoder), 
        this._readableState.decoder = new StringDecoder(enc), this._readableState.encoding = enc, 
        this;
    }, Readable.prototype.read = function(n) {
        debug("read", n), n = parseInt(n, 10);
        var state = this._readableState, nOrig = n;
        if (0 !== n && (state.emittedReadable = !1), 0 === n && state.needReadable && (state.length >= state.highWaterMark || state.ended)) return debug("read: emitReadable", state.length, state.ended), 
        0 === state.length && state.ended ? endReadable(this) : emitReadable(this), null;
        if (0 === (n = howMuchToRead(n, state)) && state.ended) return 0 === state.length && endReadable(this), 
        null;
        var ret, doRead = state.needReadable;
        return debug("need readable", doRead), (0 === state.length || state.length - n < state.highWaterMark) && debug("length less than watermark", doRead = !0), 
        state.ended || state.reading ? debug("reading or ended", doRead = !1) : doRead && (debug("do read"), 
        state.reading = !0, state.sync = !0, 0 === state.length && (state.needReadable = !0), 
        this._read(state.highWaterMark), state.sync = !1, state.reading || (n = howMuchToRead(nOrig, state))), 
        null === (ret = n > 0 ? fromList(n, state) : null) ? (state.needReadable = !0, n = 0) : state.length -= n, 
        0 === state.length && (state.ended || (state.needReadable = !0), nOrig !== n && state.ended && endReadable(this)), 
        null !== ret && this.emit("data", ret), ret;
    }, Readable.prototype._read = function(n) {
        this.emit("error", new Error("_read() is not implemented"));
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
        state.endEmitted ? pna.nextTick(endFn) : src.once("end", endFn), dest.on("unpipe", (function onunpipe(readable, unpipeInfo) {
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
        var cleanedUp = !1, increasedAwaitDrain = !1;
        function ondata(chunk) {
            debug("ondata"), increasedAwaitDrain = !1, !1 !== dest.write(chunk) || increasedAwaitDrain || ((1 === state.pipesCount && state.pipes === dest || state.pipesCount > 1 && -1 !== indexOf(state.pipes, dest)) && !cleanedUp && (debug("false write response, pause", src._readableState.awaitDrain), 
            src._readableState.awaitDrain++, increasedAwaitDrain = !0), src.pause());
        }
        function onerror(er) {
            debug("onerror", er), unpipe(), dest.removeListener("error", onerror), 0 === EElistenerCount(dest, "error") && dest.emit("error", er);
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
            emitter._events && emitter._events.error ? isArray(emitter._events.error) ? emitter._events.error.unshift(fn) : emitter._events.error = [ fn, emitter._events.error ] : emitter.on("error", fn);
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
            for (var i = 0; i < len; i++) dests[i].emit("unpipe", this, unpipeInfo);
            return this;
        }
        var index = indexOf(state.pipes, dest);
        return -1 === index || (state.pipes.splice(index, 1), state.pipesCount -= 1, 1 === state.pipesCount && (state.pipes = state.pipes[0]), 
        dest.emit("unpipe", this, unpipeInfo)), this;
    }, Readable.prototype.on = function(ev, fn) {
        var res = Stream.prototype.on.call(this, ev, fn);
        if ("data" === ev) !1 !== this._readableState.flowing && this.resume(); else if ("readable" === ev) {
            var state = this._readableState;
            state.endEmitted || state.readableListening || (state.readableListening = state.needReadable = !0, 
            state.emittedReadable = !1, state.reading ? state.length && emitReadable(this) : pna.nextTick(nReadingNextTick, this));
        }
        return res;
    }, Readable.prototype.addListener = Readable.prototype.on, Readable.prototype.resume = function() {
        var state = this._readableState;
        return state.flowing || (debug("resume"), state.flowing = !0, (function(stream, state) {
            state.resumeScheduled || (state.resumeScheduled = !0, pna.nextTick(resume_, stream, state));
        })(this, state)), this;
    }, Readable.prototype.pause = function() {
        return debug("call pause flowing=%j", this._readableState.flowing), !1 !== this._readableState.flowing && (debug("pause"), 
        this._readableState.flowing = !1, this.emit("pause")), this;
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
    }, Object.defineProperty(Readable.prototype, "readableHighWaterMark", {
        enumerable: !1,
        get: function() {
            return this._readableState.highWaterMark;
        }
    }), Readable._fromList = fromList;
}
