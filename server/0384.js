function(module, exports, __webpack_require__) {
    module.exports = Writable;
    var Buffer = __webpack_require__(10).Buffer;
    Writable.WritableState = WritableState;
    var util = __webpack_require__(32);
    util.inherits = __webpack_require__(6);
    var Stream = __webpack_require__(3);
    function WriteReq(chunk, encoding, cb) {
        this.chunk = chunk, this.encoding = encoding, this.callback = cb;
    }
    function WritableState(options, stream) {
        var Duplex = __webpack_require__(73), hwm = (options = options || {}).highWaterMark, defaultHwm = options.objectMode ? 16 : 16384;
        this.highWaterMark = hwm || 0 === hwm ? hwm : defaultHwm, this.objectMode = !!options.objectMode, 
        stream instanceof Duplex && (this.objectMode = this.objectMode || !!options.writableObjectMode), 
        this.highWaterMark = ~~this.highWaterMark, this.needDrain = !1, this.ending = !1, 
        this.ended = !1, this.finished = !1;
        var noDecode = !1 === options.decodeStrings;
        this.decodeStrings = !noDecode, this.defaultEncoding = options.defaultEncoding || "utf8", 
        this.length = 0, this.writing = !1, this.corked = 0, this.sync = !0, this.bufferProcessing = !1, 
        this.onwrite = function(er) {
            !(function(stream, er) {
                var state = stream._writableState, sync = state.sync, cb = state.writecb;
                if ((function(state) {
                    state.writing = !1, state.writecb = null, state.length -= state.writelen, state.writelen = 0;
                })(state), er) !(function(stream, state, sync, er, cb) {
                    sync ? process.nextTick((function() {
                        state.pendingcb--, cb(er);
                    })) : (state.pendingcb--, cb(er)), stream._writableState.errorEmitted = !0, stream.emit("error", er);
                })(stream, state, sync, er, cb); else {
                    var finished = needFinish(stream, state);
                    finished || state.corked || state.bufferProcessing || !state.buffer.length || clearBuffer(stream, state), 
                    sync ? process.nextTick((function() {
                        afterWrite(stream, state, finished, cb);
                    })) : afterWrite(stream, state, finished, cb);
                }
            })(stream, er);
        }, this.writecb = null, this.writelen = 0, this.buffer = [], this.pendingcb = 0, 
        this.prefinished = !1, this.errorEmitted = !1;
    }
    function Writable(options) {
        var Duplex = __webpack_require__(73);
        if (!(this instanceof Writable || this instanceof Duplex)) return new Writable(options);
        this._writableState = new WritableState(options, this), this.writable = !0, Stream.call(this);
    }
    function doWrite(stream, state, writev, len, chunk, encoding, cb) {
        state.writelen = len, state.writecb = cb, state.writing = !0, state.sync = !0, writev ? stream._writev(chunk, state.onwrite) : stream._write(chunk, encoding, state.onwrite), 
        state.sync = !1;
    }
    function afterWrite(stream, state, finished, cb) {
        finished || (function(stream, state) {
            0 === state.length && state.needDrain && (state.needDrain = !1, stream.emit("drain"));
        })(stream, state), state.pendingcb--, cb(), finishMaybe(stream, state);
    }
    function clearBuffer(stream, state) {
        if (state.bufferProcessing = !0, stream._writev && state.buffer.length > 1) {
            for (var cbs = [], c = 0; c < state.buffer.length; c++) cbs.push(state.buffer[c].callback);
            state.pendingcb++, doWrite(stream, state, !0, state.length, state.buffer, "", (function(err) {
                for (var i = 0; i < cbs.length; i++) state.pendingcb--, cbs[i](err);
            })), state.buffer = [];
        } else {
            for (c = 0; c < state.buffer.length; c++) {
                var entry = state.buffer[c], chunk = entry.chunk, encoding = entry.encoding, cb = entry.callback, len = state.objectMode ? 1 : chunk.length;
                if (doWrite(stream, state, !1, len, chunk, encoding, cb), state.writing) {
                    c++;
                    break;
                }
            }
            c < state.buffer.length ? state.buffer = state.buffer.slice(c) : state.buffer.length = 0;
        }
        state.bufferProcessing = !1;
    }
    function needFinish(stream, state) {
        return state.ending && 0 === state.length && !state.finished && !state.writing;
    }
    function prefinish(stream, state) {
        state.prefinished || (state.prefinished = !0, stream.emit("prefinish"));
    }
    function finishMaybe(stream, state) {
        var need = needFinish(0, state);
        return need && (0 === state.pendingcb ? (prefinish(stream, state), state.finished = !0, 
        stream.emit("finish")) : prefinish(stream, state)), need;
    }
    util.inherits(Writable, Stream), Writable.prototype.pipe = function() {
        this.emit("error", new Error("Cannot pipe. Not readable."));
    }, Writable.prototype.write = function(chunk, encoding, cb) {
        var state = this._writableState, ret = !1;
        return util.isFunction(encoding) && (cb = encoding, encoding = null), util.isBuffer(chunk) ? encoding = "buffer" : encoding || (encoding = state.defaultEncoding), 
        util.isFunction(cb) || (cb = function() {}), state.ended ? (function(stream, state, cb) {
            var er = new Error("write after end");
            stream.emit("error", er), process.nextTick((function() {
                cb(er);
            }));
        })(this, 0, cb) : (function(stream, state, chunk, cb) {
            var valid = !0;
            if (!(util.isBuffer(chunk) || util.isString(chunk) || util.isNullOrUndefined(chunk) || state.objectMode)) {
                var er = new TypeError("Invalid non-string/buffer chunk");
                stream.emit("error", er), process.nextTick((function() {
                    cb(er);
                })), valid = !1;
            }
            return valid;
        })(this, state, chunk, cb) && (state.pendingcb++, ret = (function(stream, state, chunk, encoding, cb) {
            chunk = (function(state, chunk, encoding) {
                return !state.objectMode && !1 !== state.decodeStrings && util.isString(chunk) && (chunk = new Buffer(chunk, encoding)), 
                chunk;
            })(state, chunk, encoding), util.isBuffer(chunk) && (encoding = "buffer");
            var len = state.objectMode ? 1 : chunk.length;
            state.length += len;
            var ret = state.length < state.highWaterMark;
            return ret || (state.needDrain = !0), state.writing || state.corked ? state.buffer.push(new WriteReq(chunk, encoding, cb)) : doWrite(stream, state, !1, len, chunk, encoding, cb), 
            ret;
        })(this, state, chunk, encoding, cb)), ret;
    }, Writable.prototype.cork = function() {
        this._writableState.corked++;
    }, Writable.prototype.uncork = function() {
        var state = this._writableState;
        state.corked && (state.corked--, state.writing || state.corked || state.finished || state.bufferProcessing || !state.buffer.length || clearBuffer(this, state));
    }, Writable.prototype._write = function(chunk, encoding, cb) {
        cb(new Error("not implemented"));
    }, Writable.prototype._writev = null, Writable.prototype.end = function(chunk, encoding, cb) {
        var state = this._writableState;
        util.isFunction(chunk) ? (cb = chunk, chunk = null, encoding = null) : util.isFunction(encoding) && (cb = encoding, 
        encoding = null), util.isNullOrUndefined(chunk) || this.write(chunk, encoding), 
        state.corked && (state.corked = 1, this.uncork()), state.ending || state.finished || (function(stream, state, cb) {
            state.ending = !0, finishMaybe(stream, state), cb && (state.finished ? process.nextTick(cb) : stream.once("finish", cb)), 
            state.ended = !0;
        })(this, state, cb);
    };
}
