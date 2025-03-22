function(module, exports, __webpack_require__) {
    "use strict";
    __webpack_require__(7);
    var querystring = __webpack_require__(28), Promise = __webpack_require__(219), MediaRendererClient = (__webpack_require__(33), 
    Promise.promisifyAll(__webpack_require__(440)), __webpack_require__(31), __webpack_require__(162), 
    __webpack_require__(952)), util = __webpack_require__(0), castingUtils = __webpack_require__(218), Player = __webpack_require__(447);
    function DLNAClient(device, executables) {
        Player.call(this, device), this.device = device, this.seekTime = 0, this.stateFlags = 1, 
        this.executables = executables, this.videoDuration = {}, this._handleError = this._handleError.bind(this), 
        this._updateStatus = this._updateStatus.bind(this);
        var client = new MediaRendererClient(device.location);
        this.player = Promise.promisifyAll(client);
        var self = this;
        client.on("status", this._updateStatus), client.on("loading", (function() {
            self._updateStatusField("state", "TRANSITIONING");
        })), client.on("playing", (function() {
            self._updateStatusField("state", "PLAYING");
        })), client.on("paused", (function() {
            self._updateStatusField("state", "PAUSED_PLAYBACK");
        })), client.on("stopped", (function() {
            self._updateStatusField("state", "STOPPED");
        })), client.on("error", this._handleError);
    }
    util.inherits(DLNAClient, Player), DLNAClient.FLAG_DISABLE_UPDATES = 2, DLNAClient.PLAYBACK_DELAY = 3e3, 
    DLNAClient.prototype._handleError = function(err) {
        this.mediaStatus.state = 7, console.log(err.toString());
    }, DLNAClient.prototype._updateStatusField = function(field, value) {
        if (void 0 !== value && !(this.stateFlags & DLNAClient.FLAG_DISABLE_UPDATES)) switch (field) {
          case "state":
            this.mediaStatus.realStatus = value, this.mediaStatus[field] = {
                IDLE: 0,
                TRANSITIONING: 2,
                PLAYING: 3,
                PAUSED_PLAYBACK: 4,
                STOPPED: 5,
                NO_MEDIA_PRESENT: 6,
                ERROR_OCCURRED: 7
            }[value], 6 == this.mediaStatus[field] && this.stateFlags && (this.mediaStatus[field] = 5), 
            this.mediaStatus.paused = 4 == this.mediaStatus[field];
            break;

          case "time":
            this.mediaStatus[field] = this.seekTime + 1e3 * parseInt(value, 10);
            break;

          case "volume":
            this.mediaStatus[field] = parseFloat(value, 10) / 100;
            break;

          default:
            this.mediaStatus[field] = value;
        }
    }, DLNAClient.prototype._updateStatus = function(status) {
        status && (this._updateStatusField("state", status.TransportState), this._updateStatusField("time", status.CurrentTrackPosition), 
        this._updateStatusField("volume", status.CurrentVolume));
    }, DLNAClient.prototype.middleware = function(req, res, next) {
        return this.setEndpoint(req), this.transcodeURL = this.endpoint + req.baseUrl + "/transcode.mp4", 
        Player.prototype.middleware.call(this, req, res, next);
    }, DLNAClient.prototype.init = function() {
        var self = this;
        return Promise.all([ this.player.getPositionAsync(), this.player.getVolumeAsync() ]).then((function(res) {
            return self._updateStatus({
                CurrentTrackPosition: res[0],
                CurrentVolume: res[1]
            }), self.mediaStatus;
        }));
    }, DLNAClient.prototype._simplePlayerCommand = function(cmd, args) {
        return args = args || [], this.player[cmd].apply(this.player, args).then(this.status.bind(this));
    }, DLNAClient.prototype.status = function() {
        return Promise.resolve(this.mediaStatus);
    }, DLNAClient.prototype.playFromStatus = function() {
        if (!this.mediaStatus.source) return Promise.reject("No source!");
        this.stateFlags |= DLNAClient.FLAG_DISABLE_UPDATES, this.mediaStatus.state = 3, 
        this.seekTime = this.mediaStatus.time;
        var options = {
            autoplay: !0,
            contentType: "video/x-mkv",
            metadata: {
                title: "Video by Stremio",
                creator: "Stremio",
                type: "video"
            }
        }, proxySrv = this.transcodeURL + "?" + querystring.stringify({
            video: this.mediaStatus.source,
            audioTrack: this.mediaStatus.audioTrack,
            time: this.mediaStatus.time / 1e3 || 0,
            subtitles: this.mediaStatus.subtitlesSrc,
            subtitlesDelay: this.mediaStatus.subtitlesDelay
        }), self = this;
        return this.player.stopAsync().catch(Function.prototype).then((function() {
            return self.stateFlags &= ~DLNAClient.FLAG_DISABLE_UPDATES, self.player.loadAsync(proxySrv, options);
        }));
    }, DLNAClient.prototype.delayedPlayFromStatus = function() {
        clearTimeout(this.deferedPlay), this.stateFlags |= DLNAClient.FLAG_DISABLE_UPDATES, 
        this.mediaStatus.state = 3;
        var playFromStatus = this.playFromStatus.bind(this);
        return this.deferedPlay = setTimeout(playFromStatus, DLNAClient.PLAYBACK_DELAY), 
        this.mediaStatus;
    }, DLNAClient.prototype.play = function(srcURL) {
        this.mediaStatus.source = srcURL, this.mediaStatus.time = 0, this.mediaStatus.subtitlesSrc = null, 
        this.mediaStatus.subtitlesDelay = 0;
        var self = this;
        return castingUtils.getVideoInfo(this.executables.ffmpeg, srcURL).then((function(info) {
            return self.mediaStatus.audio = info.streams.filter((function(stream) {
                return "Audio" === stream.type;
            })), self.mediaStatus.audioTrack = (self.mediaStatus.audio[0] || {}).id, self.stateFlags = 0, 
            self.mediaStatus.length = 1e3 * info.duration, self.delayedPlayFromStatus();
        }));
    }, DLNAClient.prototype.audioTrack = function(audioTrack, offset) {
        return offset && console.log("Audio track offset is not implemented yet"), this.mediaStatus.source ? (this.mediaStatus.audioTrack = audioTrack, 
        this.delayedPlayFromStatus()) : this.status();
    }, DLNAClient.prototype.subtitles = function(subsURL, offset, style) {
        return this.mediaStatus.source ? (this.mediaStatus.subtitlesSrc = subsURL, this.mediaStatus.subtitlesDelay = offset, 
        this.delayedPlayFromStatus()) : this.status();
    }, DLNAClient.prototype.resume = function() {
        return this._simplePlayerCommand("playAsync");
    }, DLNAClient.prototype.pause = function() {
        return this._simplePlayerCommand("pauseAsync");
    }, DLNAClient.prototype.stop = function() {
        return this._simplePlayerCommand("stopAsync");
    }, DLNAClient.prototype.seek = function(time) {
        return 3 != this.mediaStatus.state ? this.status() : (this.mediaStatus.time = parseInt(time, 10), 
        this.delayedPlayFromStatus());
    }, DLNAClient.prototype.volume = function(vol) {
        return this._simplePlayerCommand("setVolumeAsync", [ 100 * parseFloat(vol, 10) ]);
    }, DLNAClient.prototype.close = function() {
        return this.stateFlags = 1, this.stop();
    }, module.exports = DLNAClient;
}
