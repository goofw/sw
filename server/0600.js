function(module, exports, __webpack_require__) {
    module.exports = Socket;
    var debug = __webpack_require__(8)("simple-websocket"), inherits = __webpack_require__(6), isTypedArray = __webpack_require__(168), stream = __webpack_require__(3), ws = __webpack_require__(261), WebSocket = "undefined" != typeof window ? window.WebSocket : ws;
    function Socket(url, opts) {
        var self = this;
        if (!(self instanceof Socket)) return new Socket(url, opts);
        opts || (opts = {}), debug("new websocket: %s %o", url, opts), opts.allowHalfOpen = !1, 
        null == opts.highWaterMark && (opts.highWaterMark = 1048576), stream.Duplex.call(self, opts), 
        self.url = url, self.connected = !1, self.destroyed = !1, self._maxBufferedAmount = opts.highWaterMark, 
        self._chunk = null, self._cb = null, self._interval = null, self._ws = new WebSocket(self.url), 
        self._ws.binaryType = "arraybuffer", self._ws.onopen = self._onOpen.bind(self), 
        self._ws.onmessage = self._onMessage.bind(self), self._ws.onclose = self._onClose.bind(self), 
        self._ws.onerror = function() {
            self._onError(new Error("connection error to " + self.url));
        }, self.on("finish", (function() {
            self.connected ? setTimeout((function() {
                self._destroy();
            }), 100) : self.once("connect", (function() {
                setTimeout((function() {
                    self._destroy();
                }), 100);
            }));
        }));
    }
    inherits(Socket, stream.Duplex), Socket.WEBSOCKET_SUPPORT = !!WebSocket, Socket.prototype.send = function(chunk) {
        isTypedArray.strict(chunk) || chunk instanceof ArrayBuffer || Buffer.isBuffer(chunk) || "string" == typeof chunk || "undefined" != typeof Blob && chunk instanceof Blob || (chunk = JSON.stringify(chunk));
        var len = chunk.length || chunk.byteLength || chunk.size;
        this._ws.send(chunk), debug("write: %d bytes", len);
    }, Socket.prototype.destroy = function(onclose) {
        this._destroy(null, onclose);
    }, Socket.prototype._destroy = function(err, onclose) {
        var self = this;
        if (!self.destroyed) {
            if (onclose && self.once("close", onclose), debug("destroy (error: %s)", err && err.message), 
            this.readable = this.writable = !1, self._readableState.ended || self.push(null), 
            self._writableState.finished || self.end(), self.connected = !1, self.destroyed = !0, 
            clearInterval(self._interval), self._interval = null, self._chunk = null, self._cb = null, 
            self._ws) {
                var ws = self._ws, onClose = function() {
                    ws.onclose = null, self.emit("close");
                };
                if (ws.readyState === WebSocket.CLOSED) onClose(); else try {
                    ws.onclose = onClose, ws.close();
                } catch (err) {
                    onClose();
                }
                ws.onopen = null, ws.onmessage = null, ws.onerror = null;
            }
            self._ws = null, err && self.emit("error", err);
        }
    }, Socket.prototype._read = function() {}, Socket.prototype._write = function(chunk, encoding, cb) {
        if (this.destroyed) return cb(new Error("cannot write after socket is destroyed"));
        if (this.connected) {
            try {
                this.send(chunk);
            } catch (err) {
                return this._onError(err);
            }
            "function" != typeof ws && this._ws.bufferedAmount > this._maxBufferedAmount ? (debug("start backpressure: bufferedAmount %d", this._ws.bufferedAmount), 
            this._cb = cb) : cb(null);
        } else debug("write before connect"), this._chunk = chunk, this._cb = cb;
    }, Socket.prototype._onMessage = function(event) {
        if (!this.destroyed) {
            var data = event.data;
            if (debug("read: %d bytes", data.byteLength || data.length), data instanceof ArrayBuffer) data = new Buffer(data), 
            this.push(data); else if (Buffer.isBuffer(data)) this.push(data); else {
                try {
                    data = JSON.parse(data);
                } catch (err) {}
                this.emit("data", data);
            }
        }
    }, Socket.prototype._onOpen = function() {
        var self = this;
        if (!self.connected && !self.destroyed) {
            if (self.connected = !0, self._chunk) {
                try {
                    self.send(self._chunk);
                } catch (err) {
                    return self._onError(err);
                }
                self._chunk = null, debug('sent chunk from "write before connect"');
                var cb = self._cb;
                self._cb = null, cb(null);
            }
            "function" != typeof ws && (self._interval = setInterval((function() {
                if (self._cb && self._ws && !(self._ws.bufferedAmount > self._maxBufferedAmount)) {
                    debug("ending backpressure: bufferedAmount %d", self._ws.bufferedAmount);
                    var cb = self._cb;
                    self._cb = null, cb(null);
                }
            }), 150), self._interval.unref && self._interval.unref()), debug("connect"), self.emit("connect");
        }
    }, Socket.prototype._onClose = function() {
        this.destroyed || (debug("on close"), this._destroy());
    }, Socket.prototype._onError = function(err) {
        this.destroyed || (debug("error: %s", err.message || err), this._destroy(err));
    };
}
