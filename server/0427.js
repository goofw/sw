function(module, exports, __webpack_require__) {
    "use strict";
    function CorkedRequest(state) {
        var _this = this;
        this.next = null, this.entry = null, this.finish = function() {
            !(function(corkReq, state, err) {
                var entry = corkReq.entry;
                for (corkReq.entry = null; entry; ) {
                    var cb = entry.callback;
                    state.pendingcb--, cb(undefined), entry = entry.next;
                }
                state.corkedRequestsFree.next = corkReq;
            })(_this, state);
        };
    }
    var Duplex;
    module.exports = Writable, Writable.WritableState = WritableState;
    var realHasInstance, internalUtil = {
        deprecate: __webpack_require__(185)
    }, Stream = __webpack_require__(424), Buffer = __webpack_require__(10).Buffer, OurUint8Array = global.Uint8Array || function() {}, destroyImpl = __webpack_require__(425), getHighWaterMark = __webpack_require__(426).getHighWaterMark, _require$codes = __webpack_require__(65).codes, ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE, ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED, ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK, ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE, ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED, ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES, ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END, ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING, errorOrDestroy = destroyImpl.errorOrDestroy;
    function nop() {}
    function WritableState(options, stream, isDuplex) {
        Duplex = Duplex || __webpack_require__(76), options = options || {}, "boolean" != typeof isDuplex && (isDuplex = stream instanceof Duplex), 
        this.objectMode = !!options.objectMode, isDuplex && (this.objectMode = this.objectMode || !!options.writableObjectMode), 
        this.highWaterMark = getHighWaterMark(this, options, "writableHighWaterMark", isDuplex), 
        this.finalCalled = !1, this.needDrain = !1, this.ending = !1, this.ended = !1, this.finished = !1, 
        this.destroyed = !1;
        var noDecode = !1 === options.decodeStrings;
        this.decodeStrings = !noDecode, this.defaultEncoding = options.defaultEncoding || "utf8", 
        this.length = 0, this.writing = !1, this.corked = 0, this.sync = !0, this.bufferProcessing = !1, 
        this.onwrite = function(er) {
            !(function(stream, er) {
                var state = stream._writableState, sync = state.sync, cb = state.writecb;
                if ("function" != typeof cb) throw new ERR_MULTIPLE_CALLBACK;
                if ((function(state) {
                    state.writing = !1, state.writecb = null, state.length -= state.writelen, state.writelen = 0;
                })(state), er) !(function(stream, state, sync, er, cb) {
                    --state.pendingcb, sync ? (process.nextTick(cb, er), process.nextTick(finishMaybe, stream, state), 
                    stream._writableState.errorEmitted = !0, errorOrDestroy(stream, er)) : (cb(er), 
                    stream._writableState.errorEmitted = !0, errorOrDestroy(stream, er), finishMaybe(stream, state));
                })(stream, state, sync, er, cb); else {
                    var finished = needFinish(state) || stream.destroyed;
                    finished || state.corked || state.bufferProcessing || !state.bufferedRequest || clearBuffer(stream, state), 
                    sync ? process.nextTick(afterWrite, stream, state, finished, cb) : afterWrite(stream, state, finished, cb);
                }
            })(stream, er);
        }, this.writecb = null, this.writelen = 0, this.bufferedRequest = null, this.lastBufferedRequest = null, 
        this.pendingcb = 0, this.prefinished = !1, this.errorEmitted = !1, this.emitClose = !1 !== options.emitClose, 
        this.autoDestroy = !!options.autoDestroy, this.bufferedRequestCount = 0, this.corkedRequestsFree = new CorkedRequest(this);
    }
    function Writable(options) {
        var isDuplex = this instanceof (Duplex = Duplex || __webpack_require__(76));
        if (!isDuplex && !realHasInstance.call(Writable, this)) return new Writable(options);
        this._writableState = new WritableState(options, this, isDuplex), this.writable = !0, 
        options && ("function" == typeof options.write && (this._write = options.write), 
        "function" == typeof options.writev && (this._writev = options.writev), "function" == typeof options.destroy && (this._destroy = options.destroy), 
        "function" == typeof options.final && (this._final = options.final)), Stream.call(this);
    }
    function doWrite(stream, state, writev, len, chunk, encoding, cb) {
        state.writelen = len, state.writecb = cb, state.writing = !0, state.sync = !0, state.destroyed ? state.onwrite(new ERR_STREAM_DESTROYED("write")) : writev ? stream._writev(chunk, state.onwrite) : stream._write(chunk, encoding, state.onwrite), 
        state.sync = !1;
    }
    function afterWrite(stream, state, finished, cb) {
        finished || (function(stream, state) {
            0 === state.length && state.needDrain && (state.needDrain = !1, stream.emit("drain"));
        })(stream, state), state.pendingcb--, cb(), finishMaybe(stream, state);
    }
    function clearBuffer(stream, state) {
        state.bufferProcessing = !0;
        var entry = state.bufferedRequest;
        if (stream._writev && entry && entry.next) {
            var l = state.bufferedRequestCount, buffer = new Array(l), holder = state.corkedRequestsFree;
            holder.entry = entry;
            for (var count = 0, allBuffers = !0; entry; ) buffer[count] = entry, entry.isBuf || (allBuffers = !1), 
            entry = entry.next, count += 1;
            buffer.allBuffers = allBuffers, doWrite(stream, state, !0, state.length, buffer, "", holder.finish), 
            state.pendingcb++, state.lastBufferedRequest = null, holder.next ? (state.corkedRequestsFree = holder.next, 
            holder.next = null) : state.corkedRequestsFree = new CorkedRequest(state), state.bufferedRequestCount = 0;
        } else {
            for (;entry; ) {
                var chunk = entry.chunk, encoding = entry.encoding, cb = entry.callback;
                if (doWrite(stream, state, !1, state.objectMode ? 1 : chunk.length, chunk, encoding, cb), 
                entry = entry.next, state.bufferedRequestCount--, state.writing) break;
            }
            null === entry && (state.lastBufferedRequest = null);
        }
        state.bufferedRequest = entry, state.bufferProcessing = !1;
    }
    function needFinish(state) {
        return state.ending && 0 === state.length && null === state.bufferedRequest && !state.finished && !state.writing;
    }
    function callFinal(stream, state) {
        stream._final((function(err) {
            state.pendingcb--, err && errorOrDestroy(stream, err), state.prefinished = !0, stream.emit("prefinish"), 
            finishMaybe(stream, state);
        }));
    }
    function finishMaybe(stream, state) {
        var need = needFinish(state);
        if (need && ((function(stream, state) {
            state.prefinished || state.finalCalled || ("function" != typeof stream._final || state.destroyed ? (state.prefinished = !0, 
            stream.emit("prefinish")) : (state.pendingcb++, state.finalCalled = !0, process.nextTick(callFinal, stream, state)));
        })(stream, state), 0 === state.pendingcb && (state.finished = !0, stream.emit("finish"), 
        state.autoDestroy))) {
            var rState = stream._readableState;
            (!rState || rState.autoDestroy && rState.endEmitted) && stream.destroy();
        }
        return need;
    }
    __webpack_require__(6)(Writable, Stream), WritableState.prototype.getBuffer = function() {
        for (var current = this.bufferedRequest, out = []; current; ) out.push(current), 
        current = current.next;
        return out;
    }, (function() {
        try {
            Object.defineProperty(WritableState.prototype, "buffer", {
                get: internalUtil.deprecate((function() {
                    return this.getBuffer();
                }), "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
            });
        } catch (_) {}
    })(), "function" == typeof Symbol && Symbol.hasInstance && "function" == typeof Function.prototype[Symbol.hasInstance] ? (realHasInstance = Function.prototype[Symbol.hasInstance], 
    Object.defineProperty(Writable, Symbol.hasInstance, {
        value: function(object) {
            return !!realHasInstance.call(this, object) || this === Writable && object && object._writableState instanceof WritableState;
        }
    })) : realHasInstance = function(object) {
        return object instanceof this;
    }, Writable.prototype.pipe = function() {
        errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE);
    }, Writable.prototype.write = function(chunk, encoding, cb) {
        var obj, state = this._writableState, ret = !1, isBuf = !state.objectMode && (obj = chunk, 
        Buffer.isBuffer(obj) || obj instanceof OurUint8Array);
        return isBuf && !Buffer.isBuffer(chunk) && (chunk = (function(chunk) {
            return Buffer.from(chunk);
        })(chunk)), "function" == typeof encoding && (cb = encoding, encoding = null), isBuf ? encoding = "buffer" : encoding || (encoding = state.defaultEncoding), 
        "function" != typeof cb && (cb = nop), state.ending ? (function(stream, cb) {
            var er = new ERR_STREAM_WRITE_AFTER_END;
            errorOrDestroy(stream, er), process.nextTick(cb, er);
        })(this, cb) : (isBuf || (function(stream, state, chunk, cb) {
            var er;
            return null === chunk ? er = new ERR_STREAM_NULL_VALUES : "string" == typeof chunk || state.objectMode || (er = new ERR_INVALID_ARG_TYPE("chunk", [ "string", "Buffer" ], chunk)), 
            !er || (errorOrDestroy(stream, er), process.nextTick(cb, er), !1);
        })(this, state, chunk, cb)) && (state.pendingcb++, ret = (function(stream, state, isBuf, chunk, encoding, cb) {
            if (!isBuf) {
                var newChunk = (function(state, chunk, encoding) {
                    return state.objectMode || !1 === state.decodeStrings || "string" != typeof chunk || (chunk = Buffer.from(chunk, encoding)), 
                    chunk;
                })(state, chunk, encoding);
                chunk !== newChunk && (isBuf = !0, encoding = "buffer", chunk = newChunk);
            }
            var len = state.objectMode ? 1 : chunk.length;
            state.length += len;
            var ret = state.length < state.highWaterMark;
            if (ret || (state.needDrain = !0), state.writing || state.corked) {
                var last = state.lastBufferedRequest;
                state.lastBufferedRequest = {
                    chunk: chunk,
                    encoding: encoding,
                    isBuf: isBuf,
                    callback: cb,
                    next: null
                }, last ? last.next = state.lastBufferedRequest : state.bufferedRequest = state.lastBufferedRequest, 
                state.bufferedRequestCount += 1;
            } else doWrite(stream, state, !1, len, chunk, encoding, cb);
            return ret;
        })(this, state, isBuf, chunk, encoding, cb)), ret;
    }, Writable.prototype.cork = function() {
        this._writableState.corked++;
    }, Writable.prototype.uncork = function() {
        var state = this._writableState;
        state.corked && (state.corked--, state.writing || state.corked || state.bufferProcessing || !state.bufferedRequest || clearBuffer(this, state));
    }, Writable.prototype.setDefaultEncoding = function(encoding) {
        if ("string" == typeof encoding && (encoding = encoding.toLowerCase()), !([ "hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw" ].indexOf((encoding + "").toLowerCase()) > -1)) throw new ERR_UNKNOWN_ENCODING(encoding);
        return this._writableState.defaultEncoding = encoding, this;
    }, Object.defineProperty(Writable.prototype, "writableBuffer", {
        enumerable: !1,
        get: function() {
            return this._writableState && this._writableState.getBuffer();
        }
    }), Object.defineProperty(Writable.prototype, "writableHighWaterMark", {
        enumerable: !1,
        get: function() {
            return this._writableState.highWaterMark;
        }
    }), Writable.prototype._write = function(chunk, encoding, cb) {
        cb(new ERR_METHOD_NOT_IMPLEMENTED("_write()"));
    }, Writable.prototype._writev = null, Writable.prototype.end = function(chunk, encoding, cb) {
        var state = this._writableState;
        return "function" == typeof chunk ? (cb = chunk, chunk = null, encoding = null) : "function" == typeof encoding && (cb = encoding, 
        encoding = null), null != chunk && this.write(chunk, encoding), state.corked && (state.corked = 1, 
        this.uncork()), state.ending || (function(stream, state, cb) {
            state.ending = !0, finishMaybe(stream, state), cb && (state.finished ? process.nextTick(cb) : stream.once("finish", cb)), 
            state.ended = !0, stream.writable = !1;
        })(this, state, cb), this;
    }, Object.defineProperty(Writable.prototype, "writableLength", {
        enumerable: !1,
        get: function() {
            return this._writableState.length;
        }
    }), Object.defineProperty(Writable.prototype, "destroyed", {
        enumerable: !1,
        get: function() {
            return void 0 !== this._writableState && this._writableState.destroyed;
        },
        set: function(value) {
            this._writableState && (this._writableState.destroyed = value);
        }
    }), Writable.prototype.destroy = destroyImpl.destroy, Writable.prototype._undestroy = destroyImpl.undestroy, 
    Writable.prototype._destroy = function(err, cb) {
        cb(err);
    };
}
