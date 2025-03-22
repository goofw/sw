function(module, exports, __webpack_require__) {
    "use strict";
    __webpack_require__(444);
    var castingUtils = __webpack_require__(218), querystring = __webpack_require__(28), Promise = __webpack_require__(219), Client = __webpack_require__(942).Client, util = __webpack_require__(0), Player = __webpack_require__(447);
    function ChromecastClient(device, executables) {
        Player.call(this, device), this.audio = {
            tracks: [],
            currentTrack: null
        }, this.seekTime = 0, this.stateFlags = 1, this.msgId = 0, this.sessionHeartbeat = null, 
        this.sessionStatus = null, this.mediaSender = null, this.mediaReceiver = null, this.mediaSessionStatus = {}, 
        this.executables = executables, this.device = device, this._conformStatus = this._conformStatus.bind(this), 
        this.client = new Client, this.client.on("error", (function(err) {
            console.log("ChromeCast client error", err);
        }));
    }
    util.inherits(ChromecastClient, Player), ChromecastClient.APP_ID = "74B9F456", ChromecastClient.MESSAGE_TIMEOUT = 5e3, 
    ChromecastClient.PLAYBACK_DELAY = 4e3, ChromecastClient.DEFAULT_SENDER = "sender-0", 
    ChromecastClient.DEFAULT_RECEIVER = "receiver-0", ChromecastClient.channelsNS = {
        connection: "urn:x-cast:com.google.cast.tp.connection",
        heartbeat: "urn:x-cast:com.google.cast.tp.heartbeat",
        receiver: "urn:x-cast:com.google.cast.receiver",
        media: "urn:x-cast:com.google.cast.media"
    }, ChromecastClient.mapState = function(statusText) {
        return {
            "Ready To Cast": 6,
            BUFFERING: 2,
            PLAYING: 3,
            PAUSED: 4,
            STOPPED: 5,
            NO_MEDIA_PRESENT: 6,
            ERROR_OCCURRED: 7
        }[statusText];
    }, ChromecastClient.prototype.request = function(ns, msg, sender, receiver) {
        sender = sender || ChromecastClient.DEFAULT_SENDER, receiver = receiver || ChromecastClient.DEFAULT_RECEIVER, 
        this.client.send(sender, receiver, ns, JSON.stringify(msg));
    }, ChromecastClient.prototype.requestResponse = function(ns, msg, sender, receiver) {
        var self = this;
        return sender = sender || ChromecastClient.DEFAULT_SENDER, receiver = receiver || ChromecastClient.DEFAULT_RECEIVER, 
        new Promise((function(resolve, reject) {
            var messageTimeout = setTimeout((function() {
                self.client.removeListener("message", getMessage), reject("Response timeout for " + ns + " with session ID: " + receiver);
            }), ChromecastClient.MESSAGE_TIMEOUT);
            if ("PING" !== msg.type) {
                var requestId = ++self.msgId;
                msg.requestId = requestId;
            }
            function getMessage(sourceId, destinationId, namespace, data) {
                if (sourceId == receiver && (destinationId === sender || "*" === destinationId) && namespace === ns) {
                    var response = JSON.parse(data);
                    if ("PONG" === response.type || response.requestId === requestId) return self.client.removeListener("message", getMessage), 
                    clearTimeout(messageTimeout), "INVALID_REQUEST" === response.type ? reject("Invalid request: " + response.reason) : resolve(response);
                }
            }
            self.client.on("message", getMessage), self.request(ns, msg, sender, receiver);
        }));
    }, ChromecastClient.prototype._disconnect = function() {
        this.client.socket && (this.request(ChromecastClient.channelsNS.connection, {
            type: "CLOSE"
        }), this.client.close());
    }, ChromecastClient.prototype._connect = function() {
        var self = this;
        return this.client.ps ? self.requestResponse(ChromecastClient.channelsNS.receiver, {
            type: "GET_STATUS"
        }) : (this._disconnect(), new Promise((function(resolve, reject) {
            self.client.connect(self.device.host, (function() {
                self.request(ChromecastClient.channelsNS.connection, {
                    type: "CONNECT"
                }), heartbeat(), self.requestResponse(ChromecastClient.channelsNS.receiver, {
                    type: "GET_STATUS"
                }).then(resolve);
            }));
        })));
        function heartbeat() {
            self.client.ps ? self.requestResponse(ChromecastClient.channelsNS.heartbeat, {
                type: "PING"
            }).then((function(pong) {
                setTimeout(heartbeat, 5e3);
            })).catch((function(err) {
                console.log("heartbeat error", err);
            })) : console.log("Heart stops.");
        }
    }, ChromecastClient.prototype._connectMedia = function() {
        var self = this;
        return this.mediaSender = "client-" + Math.floor(1e6 * Math.random()), this.mediaReceiver = this.sessionStatus.applications[0].sessionId, 
        this.request(ChromecastClient.channelsNS.connection, {
            type: "CONNECT"
        }, this.mediaSender, this.mediaReceiver), this.requestResponse(ChromecastClient.channelsNS.media, {
            type: "GET_STATUS"
        }, this.mediaSender, this.mediaReceiver).catch((function(err) {
            return console.log("!MediaSessionEerror", err), {
                status: [ {
                    error: err
                } ]
            };
        })).then((function(res) {
            res.status && res.status[0] && (self.mediaSessionStatus = res.status[0] || {});
        }));
    }, ChromecastClient.prototype.init = function() {
        var self = this;
        return this.mediaSessionStatus = {}, this._connect().then((function(res) {
            return res.status && res.status.applications && res.status.applications[0].appId === ChromecastClient.APP_ID ? res : self.requestResponse(ChromecastClient.channelsNS.receiver, {
                type: "LAUNCH",
                appId: ChromecastClient.APP_ID
            });
        })).then((function(res) {
            self.sessionStatus = res.status;
        }));
    }, ChromecastClient.prototype._conformStatus = function(status) {
        (status = status || {}).status && (status = status.status);
        var conformedStatus = this.mediaStatus;
        if (status.volume && !conformedStatus.volume && (conformedStatus.volume = status.volume.level), 
        status.applications && status.applications[0]) {
            var app = status.applications[0];
            conformedStatus.state = ChromecastClient.mapState(app.statusText);
        }
        return status.playerState && (conformedStatus.state = ChromecastClient.mapState(status.playerState)), 
        6 == conformedStatus.state && this.stateFlags && (conformedStatus.state = 5), conformedStatus.paused = 4 == conformedStatus.state, 
        status.currentTime && (conformedStatus.time = 1e3 * status.currentTime), conformedStatus;
    }, ChromecastClient.prototype._subsPrepare = function(subsURL, offset, style) {
        return {
            trackId: 1,
            trackContentId: subsURL = subsURL ? this.endpoint + "/subtitles.srt?from=" + encodeURIComponent(subsURL) : "",
            trackContentType: "text/vtt",
            type: "TEXT",
            subtype: "SUBTITLES",
            offset: parseFloat(offset, 10) || 0,
            style: style || null
        };
    }, ChromecastClient.prototype.middleware = function(req, res, next) {
        return this.setEndpoint(req), this.transcodeURL = this.endpoint + req.baseUrl + "/transcode", 
        Player.prototype.middleware.call(this, req, res, next);
    }, ChromecastClient.prototype.status = function() {
        var self = this;
        return this._connectMedia().then((function() {
            return self.mediaStatus.volume = 0, self.mediaStatus.audio = self.audio.tracks, 
            self.mediaStatus.audioTrack = self.audio.currentTrack, self._conformStatus(self.sessionStatus), 
            self._conformStatus(self.mediaSessionStatus), self.mediaStatus;
        }));
    }, ChromecastClient.prototype._mediaRequest = function(data) {
        var self = this;
        return this._connectMedia().then((function() {
            return self.mediaSessionStatus.mediaSessionId && (data.mediaSessionId = self.mediaSessionStatus.mediaSessionId), 
            self.requestResponse(ChromecastClient.channelsNS.media, data, self.mediaSender, self.mediaReceiver);
        })).then(this._conformStatus);
    }, ChromecastClient.prototype.playFromStatus = function() {
        if (clearTimeout(this.deferedPlay), !this.mediaStatus.source) return Promise.reject("No source!");
        this.mediaStatus.time = parseInt(this.mediaStatus.time, 10);
        var media = {
            contentId: this.transcodeURL + "?" + querystring.stringify({
                video: this.mediaStatus.source,
                audioTrack: this.audio.currentTrack,
                time: this.seekTime
            }),
            streamType: "BUFFERED",
            contentType: "video/x-matroska",
            metadata: {
                seekTime: this.seekTime,
                duration: this.mediaStatus.length,
                type: 1,
                metadataType: 1
            },
            tracks: []
        };
        return this.mediaStatus.subtitlesSrc && media.tracks.push(this._subsPrepare(this.mediaStatus.subtitlesSrc, this.mediaStatus.subtitlesDelay, {
            fontSize: parseInt(this.mediaStatus.subtitlesSize, 10) + 1 + "vw"
        })), this._mediaRequest({
            type: "LOAD",
            media: media,
            autoplay: !0,
            currentTime: 0,
            activeTrackIds: [],
            repeatMode: "REPEAT_OFF"
        });
    }, ChromecastClient.prototype.play = function(srcURL) {
        this.seekTime = 0, this.mediaStatus.source = srcURL, this.mediaStatus.time = 0, 
        this.mediaStatus.subtitlesSrc = null, this.mediaStatus.subtitlesDelay = 0;
        var self = this;
        return castingUtils.getVideoInfo(this.executables.ffmpeg, srcURL).then((function(info) {
            return self.audio.tracks = info.streams.filter((function(stream) {
                return "Audio" === stream.type;
            })), self.audio.currentTrack = (self.audio[0] || {}).id, self.mediaStatus.length = 1e3 * info.duration, 
            self.stateFlags = 0, self.status().then((function(status) {
                return status.state = 3, self.deferedPlay = setTimeout((function() {
                    self.playFromStatus();
                }), ChromecastClient.PLAYBACK_DELAY), status;
            }));
        }));
    }, ChromecastClient.prototype.audioTrack = function(audioTrack, offset) {
        return offset && console.log("Audio track offset is not implemented yet"), 3 != this.mediaStatus.state ? Promise.resolve() : (this.audio.currentTrack = audioTrack, 
        this.playFromStatus());
    }, ChromecastClient.prototype.subtitles = function(subsURL, offset, style) {
        this.mediaStatus.subtitlesSrc = subsURL, this.mediaStatus.subtitlesDelay = offset;
        var subs = this._subsPrepare(subsURL, offset, style);
        return this._mediaRequest(subs);
    }, ChromecastClient.prototype.resume = function() {
        return this._mediaRequest({
            type: "PLAY"
        });
    }, ChromecastClient.prototype.pause = function() {
        return this._mediaRequest({
            type: "PAUSE"
        });
    }, ChromecastClient.prototype.stop = function() {
        return this.close();
    }, ChromecastClient.prototype.seek = function(time) {
        return 3 != this.mediaStatus.state ? Promise.resolve() : (this.seekTime = parseInt(time, 10) / 1e3 || 0, 
        this.playFromStatus());
    }, ChromecastClient.prototype.volume = function(vol) {
        return this.requestResponse(ChromecastClient.channelsNS.receiver, {
            type: "SET_VOLUME",
            volume: {
                level: parseFloat(vol, 10)
            }
        }).then(this._conformStatus);
    }, ChromecastClient.prototype.close = function() {
        var self = this;
        return this.stateFlags = 1, this.requestResponse(ChromecastClient.channelsNS.receiver, {
            type: "STOP",
            sessionId: this.sessionStatus.applications[0].sessionId
        }).then((function() {
            self._disconnect();
        }));
    }, module.exports = ChromecastClient;
}
