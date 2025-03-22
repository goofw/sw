function(module, exports, __webpack_require__) {
    module.exports = Peer;
    var debug = __webpack_require__(8)("simple-peer"), getBrowserRTC = __webpack_require__(599), hat = __webpack_require__(91), inherits = __webpack_require__(6), isTypedArray = __webpack_require__(168), once = __webpack_require__(34), stream = __webpack_require__(3);
    function Peer(opts) {
        var self = this;
        if (!(self instanceof Peer)) return new Peer(opts);
        if (self._debug("new peer %o", opts), opts || (opts = {}), opts.allowHalfOpen = !1, 
        null == opts.highWaterMark && (opts.highWaterMark = 1048576), stream.Duplex.call(self, opts), 
        self.initiator = opts.initiator || !1, self.channelConfig = opts.channelConfig || Peer.channelConfig, 
        self.channelName = opts.initiator ? opts.channelName || hat(160) : null, self.config = opts.config || Peer.config, 
        self.constraints = opts.constraints || Peer.constraints, self.offerConstraints = opts.offerConstraints, 
        self.answerConstraints = opts.answerConstraints, self.reconnectTimer = opts.reconnectTimer || !1, 
        self.sdpTransform = opts.sdpTransform || function(sdp) {
            return sdp;
        }, self.stream = opts.stream || !1, self.trickle = void 0 === opts.trickle || opts.trickle, 
        self.destroyed = !1, self.connected = !1, self.remoteAddress = void 0, self.remoteFamily = void 0, 
        self.remotePort = void 0, self.localAddress = void 0, self.localPort = void 0, self._isWrtc = !!opts.wrtc, 
        self._wrtc = opts.wrtc || getBrowserRTC(), !self._wrtc) throw "undefined" == typeof window ? new Error("No WebRTC support: Specify `opts.wrtc` option in this environment") : new Error("No WebRTC support: Not a supported browser");
        self._maxBufferedAmount = opts.highWaterMark, self._pcReady = !1, self._channelReady = !1, 
        self._iceComplete = !1, self._channel = null, self._pendingCandidates = [], self._chunk = null, 
        self._cb = null, self._interval = null, self._reconnectTimeout = null, self._pc = new self._wrtc.RTCPeerConnection(self.config, self.constraints), 
        self._pc.oniceconnectionstatechange = self._onIceConnectionStateChange.bind(self), 
        self._pc.onsignalingstatechange = self._onSignalingStateChange.bind(self), self._pc.onicecandidate = self._onIceCandidate.bind(self), 
        self.stream && self._pc.addStream(self.stream), self._pc.onaddstream = self._onAddStream.bind(self), 
        self.initiator ? (self._setupData({
            channel: self._pc.createDataChannel(self.channelName, self.channelConfig)
        }), self._pc.onnegotiationneeded = once(self._createOffer.bind(self)), "undefined" != typeof window && window.webkitRTCPeerConnection || self._pc.onnegotiationneeded()) : self._pc.ondatachannel = self._setupData.bind(self), 
        self.on("finish", (function() {
            self.connected ? setTimeout((function() {
                self._destroy();
            }), 100) : self.once("connect", (function() {
                setTimeout((function() {
                    self._destroy();
                }), 100);
            }));
        }));
    }
    function noop() {}
    inherits(Peer, stream.Duplex), Peer.WEBRTC_SUPPORT = !!getBrowserRTC(), Peer.config = {
        iceServers: [ {
            url: "stun:23.21.150.121",
            urls: "stun:23.21.150.121"
        } ]
    }, Peer.constraints = {}, Peer.channelConfig = {}, Object.defineProperty(Peer.prototype, "bufferSize", {
        get: function() {
            return this._channel && this._channel.bufferedAmount || 0;
        }
    }), Peer.prototype.address = function() {
        return {
            port: this.localPort,
            family: "IPv4",
            address: this.localAddress
        };
    }, Peer.prototype.signal = function(data) {
        var self = this;
        if (self.destroyed) throw new Error("cannot signal after peer is destroyed");
        if ("string" == typeof data) try {
            data = JSON.parse(data);
        } catch (err) {
            data = {};
        }
        function addIceCandidate(candidate) {
            try {
                self._pc.addIceCandidate(new self._wrtc.RTCIceCandidate(candidate), noop, self._onError.bind(self));
            } catch (err) {
                self._destroy(new Error("error adding candidate: " + err.message));
            }
        }
        self._debug("signal()"), data.sdp && self._pc.setRemoteDescription(new self._wrtc.RTCSessionDescription(data), (function() {
            self.destroyed || ("offer" === self._pc.remoteDescription.type && self._createAnswer(), 
            self._pendingCandidates.forEach(addIceCandidate), self._pendingCandidates = []);
        }), self._onError.bind(self)), data.candidate && (self._pc.remoteDescription ? addIceCandidate(data.candidate) : self._pendingCandidates.push(data.candidate)), 
        data.sdp || data.candidate || self._destroy(new Error("signal() called with invalid signal data"));
    }, Peer.prototype.send = function(chunk) {
        isTypedArray.strict(chunk) || chunk instanceof ArrayBuffer || Buffer.isBuffer(chunk) || "string" == typeof chunk || "undefined" != typeof Blob && chunk instanceof Blob || (chunk = JSON.stringify(chunk)), 
        Buffer.isBuffer(chunk) && this._isWrtc && (chunk = new Uint8Array(chunk));
        var len = chunk.length || chunk.byteLength || chunk.size;
        this._channel.send(chunk), this._debug("write: %d bytes", len);
    }, Peer.prototype.destroy = function(onclose) {
        this._destroy(null, onclose);
    }, Peer.prototype._destroy = function(err, onclose) {
        if (!this.destroyed) {
            if (onclose && this.once("close", onclose), this._debug("destroy (error: %s)", err && err.message), 
            this.readable = this.writable = !1, this._readableState.ended || this.push(null), 
            this._writableState.finished || this.end(), this.destroyed = !0, this.connected = !1, 
            this._pcReady = !1, this._channelReady = !1, this._chunk = null, this._cb = null, 
            clearInterval(this._interval), clearTimeout(this._reconnectTimeout), this._pc) {
                try {
                    this._pc.close();
                } catch (err) {}
                this._pc.oniceconnectionstatechange = null, this._pc.onsignalingstatechange = null, 
                this._pc.onicecandidate = null;
            }
            if (this._channel) {
                try {
                    this._channel.close();
                } catch (err) {}
                this._channel.onmessage = null, this._channel.onopen = null, this._channel.onclose = null;
            }
            this._pc = null, this._channel = null, err && this.emit("error", err), this.emit("close");
        }
    }, Peer.prototype._setupData = function(event) {
        this._channel = event.channel, this.channelName = this._channel.label, this._channel.binaryType = "arraybuffer", 
        this._channel.onmessage = this._onChannelMessage.bind(this), this._channel.onopen = this._onChannelOpen.bind(this), 
        this._channel.onclose = this._onChannelClose.bind(this);
    }, Peer.prototype._read = function() {}, Peer.prototype._write = function(chunk, encoding, cb) {
        if (this.destroyed) return cb(new Error("cannot write after peer is destroyed"));
        if (this.connected) {
            try {
                this.send(chunk);
            } catch (err) {
                return this._onError(err);
            }
            this._channel.bufferedAmount > this._maxBufferedAmount ? (this._debug("start backpressure: bufferedAmount %d", this._channel.bufferedAmount), 
            this._cb = cb) : cb(null);
        } else this._debug("write before connect"), this._chunk = chunk, this._cb = cb;
    }, Peer.prototype._createOffer = function() {
        var self = this;
        self.destroyed || self._pc.createOffer((function(offer) {
            if (!self.destroyed) {
                offer.sdp = self.sdpTransform(offer.sdp), self._pc.setLocalDescription(offer, noop, self._onError.bind(self));
                var sendOffer = function() {
                    var signal = self._pc.localDescription || offer;
                    self._debug("signal"), self.emit("signal", {
                        type: signal.type,
                        sdp: signal.sdp
                    });
                };
                self.trickle || self._iceComplete ? sendOffer() : self.once("_iceComplete", sendOffer);
            }
        }), self._onError.bind(self), self.offerConstraints);
    }, Peer.prototype._createAnswer = function() {
        var self = this;
        self.destroyed || self._pc.createAnswer((function(answer) {
            if (!self.destroyed) {
                answer.sdp = self.sdpTransform(answer.sdp), self._pc.setLocalDescription(answer, noop, self._onError.bind(self));
                var sendAnswer = function() {
                    var signal = self._pc.localDescription || answer;
                    self._debug("signal"), self.emit("signal", {
                        type: signal.type,
                        sdp: signal.sdp
                    });
                };
                self.trickle || self._iceComplete ? sendAnswer() : self.once("_iceComplete", sendAnswer);
            }
        }), self._onError.bind(self), self.answerConstraints);
    }, Peer.prototype._onIceConnectionStateChange = function() {
        var self = this;
        if (!self.destroyed) {
            var iceGatheringState = self._pc.iceGatheringState, iceConnectionState = self._pc.iceConnectionState;
            self._debug("iceConnectionStateChange %s %s", iceGatheringState, iceConnectionState), 
            self.emit("iceConnectionStateChange", iceGatheringState, iceConnectionState), "connected" !== iceConnectionState && "completed" !== iceConnectionState || (clearTimeout(self._reconnectTimeout), 
            self._pcReady = !0, self._maybeReady()), "disconnected" === iceConnectionState && (self.reconnectTimer ? (clearTimeout(self._reconnectTimeout), 
            self._reconnectTimeout = setTimeout((function() {
                self._destroy();
            }), self.reconnectTimer)) : self._destroy()), "failed" === iceConnectionState && self._destroy(), 
            "closed" === iceConnectionState && self._destroy();
        }
    }, Peer.prototype.getStats = function(cb) {
        this._pc.getStats ? "undefined" != typeof window && window.mozRTCPeerConnection ? this._pc.getStats(null, (function(res) {
            var items = [];
            res.forEach((function(item) {
                items.push(item);
            })), cb(items);
        }), this._onError.bind(this)) : this._pc.getStats((function(res) {
            var items = [];
            res.result().forEach((function(result) {
                var item = {};
                result.names().forEach((function(name) {
                    item[name] = result.stat(name);
                })), item.id = result.id, item.type = result.type, item.timestamp = result.timestamp, 
                items.push(item);
            })), cb(items);
        })) : cb([]);
    }, Peer.prototype._maybeReady = function() {
        var self = this;
        self._debug("maybeReady pc %s channel %s", self._pcReady, self._channelReady), !self.connected && !self._connecting && self._pcReady && self._channelReady && (self._connecting = !0, 
        self.getStats((function(items) {
            self._connecting = !1, self.connected = !0;
            var remoteCandidates = {}, localCandidates = {};
            if (items.forEach((function(item) {
                "remotecandidate" === item.type && (remoteCandidates[item.id] = item), "localcandidate" === item.type && (localCandidates[item.id] = item);
            })), items.forEach((function(item) {
                ("googCandidatePair" === item.type && "true" === item.googActiveConnection || "candidatepair" === item.type && item.selected) && (function(item) {
                    var local = localCandidates[item.localCandidateId], remote = remoteCandidates[item.remoteCandidateId];
                    self.remoteAddress = remote.ipAddress, self.remotePort = Number(remote.portNumber), 
                    self.remoteFamily = "IPv4", self._debug("connect remote: %s:%s", self.remoteAddress, self.remotePort), 
                    self.localAddress = local.ipAddress, self.localPort = Number(local.portNumber), 
                    self._debug("connect local: %s:%s", self.localAddress, self.localPort);
                })(item);
            })), self._chunk) {
                try {
                    self.send(self._chunk);
                } catch (err) {
                    return self._onError(err);
                }
                self._chunk = null, self._debug('sent chunk from "write before connect"');
                var cb = self._cb;
                self._cb = null, cb(null);
            }
            self._interval = setInterval((function() {
                if (self._cb && self._channel && !(self._channel.bufferedAmount > self._maxBufferedAmount)) {
                    self._debug("ending backpressure: bufferedAmount %d", self._channel.bufferedAmount);
                    var cb = self._cb;
                    self._cb = null, cb(null);
                }
            }), 150), self._interval.unref && self._interval.unref(), self._debug("connect"), 
            self.emit("connect");
        })));
    }, Peer.prototype._onSignalingStateChange = function() {
        this.destroyed || (this._debug("signalingStateChange %s", this._pc.signalingState), 
        this.emit("signalingStateChange", this._pc.signalingState));
    }, Peer.prototype._onIceCandidate = function(event) {
        this.destroyed || (event.candidate && this.trickle ? this.emit("signal", {
            candidate: {
                candidate: event.candidate.candidate,
                sdpMLineIndex: event.candidate.sdpMLineIndex,
                sdpMid: event.candidate.sdpMid
            }
        }) : event.candidate || (this._iceComplete = !0, this.emit("_iceComplete")));
    }, Peer.prototype._onChannelMessage = function(event) {
        if (!this.destroyed) {
            var data = event.data;
            if (this._debug("read: %d bytes", data.byteLength || data.length), data instanceof ArrayBuffer) data = new Buffer(data), 
            this.push(data); else {
                try {
                    data = JSON.parse(data);
                } catch (err) {}
                this.emit("data", data);
            }
        }
    }, Peer.prototype._onChannelOpen = function() {
        this.connected || this.destroyed || (this._debug("on channel open"), this._channelReady = !0, 
        this._maybeReady());
    }, Peer.prototype._onChannelClose = function() {
        this.destroyed || (this._debug("on channel close"), this._destroy());
    }, Peer.prototype._onAddStream = function(event) {
        this.destroyed || (this._debug("on add stream"), this.emit("stream", event.stream));
    }, Peer.prototype._onError = function(err) {
        this.destroyed || (this._debug("error %s", err.message || err), this._destroy(err));
    }, Peer.prototype._debug = function() {
        var self = this, args = [].slice.call(arguments), id = self.channelName && self.channelName.substring(0, 7);
        args[0] = "[" + id + "] " + args[0], debug.apply(null, args);
    };
}
