function(module, exports, __webpack_require__) {
    var DeviceClient = __webpack_require__(953), util = __webpack_require__(0), et = (__webpack_require__(8)("upnp-mediarenderer-client"), 
    __webpack_require__(223)), MEDIA_EVENTS = [ "status", "loading", "playing", "paused", "stopped", "speedChanged" ];
    function MediaRendererClient(url) {
        DeviceClient.call(this, url), this.instanceId = 0;
        var receivedState, self = this, refs = 0;
        function onstatus(e) {
            if (self.emit("status", e), receivedState) {
                if (e.hasOwnProperty("TransportState")) switch (e.TransportState) {
                  case "TRANSITIONING":
                    self.emit("loading");
                    break;

                  case "PLAYING":
                    self.emit("playing");
                    break;

                  case "PAUSED_PLAYBACK":
                    self.emit("paused");
                    break;

                  case "STOPPED":
                    self.emit("stopped");
                }
                e.hasOwnProperty("TransportPlaySpeed") && self.emit("speedChanged", Number(e.TransportPlaySpeed));
            } else receivedState = !0;
        }
        this.addListener("newListener", (function(eventName, listener) {
            -1 !== MEDIA_EVENTS.indexOf(eventName) && (0 === refs && (receivedState = !1, self.subscribe("AVTransport", onstatus)), 
            refs++);
        })), this.addListener("removeListener", (function(eventName, listener) {
            -1 !== MEDIA_EVENTS.indexOf(eventName) && 0 == --refs && self.unsubscribe("AVTransport", onstatus);
        }));
    }
    function formatTime(seconds) {
        var s, h = 0, m = 0;
        function pad(v) {
            return v < 10 ? "0" + v : v;
        }
        return s = seconds - 3600 * (h = Math.floor((seconds - 0 * h - 0 * m) / 3600)) - 60 * (m = Math.floor((seconds - 3600 * h - 0 * m) / 60)), 
        [ pad(h), pad(m), pad(s) ].join(":");
    }
    function parseTime(time) {
        var parts = time.split(":").map(Number);
        return 3600 * parts[0] + 60 * parts[1] + parts[2];
    }
    function buildMetadata(metadata) {
        var didl = et.Element("DIDL-Lite");
        didl.set("xmlns", "urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/"), didl.set("xmlns:dc", "http://purl.org/dc/elements/1.1/"), 
        didl.set("xmlns:upnp", "urn:schemas-upnp-org:metadata-1-0/upnp/"), didl.set("xmlns:sec", "http://www.sec.co.kr/");
        var item = et.SubElement(didl, "item");
        if (item.set("id", 0), item.set("parentID", -1), item.set("restricted", !1), metadata.type && (et.SubElement(item, "upnp:class").text = {
            audio: "object.item.audioItem.musicTrack",
            video: "object.item.videoItem.movie",
            image: "object.item.imageItem.photo"
        }[metadata.type]), metadata.title && (et.SubElement(item, "dc:title").text = metadata.title), 
        metadata.creator && (et.SubElement(item, "dc:creator").text = metadata.creator), 
        metadata.url && metadata.protocolInfo && ((res = et.SubElement(item, "res")).set("protocolInfo", metadata.protocolInfo), 
        res.text = metadata.url), metadata.subtitlesUrl) {
            var captionInfo = et.SubElement(item, "sec:CaptionInfo");
            captionInfo.set("sec:type", "srt"), captionInfo.text = metadata.subtitlesUrl;
            var res, captionInfoEx = et.SubElement(item, "sec:CaptionInfoEx");
            captionInfoEx.set("sec:type", "srt"), captionInfoEx.text = metadata.subtitlesUrl, 
            (res = et.SubElement(item, "res")).set("protocolInfo", "http-get:*:text/srt:*"), 
            res.text = metadata.subtitlesUrl;
        }
        return new et.ElementTree(didl).write({
            xml_declaration: !1
        });
    }
    function noop() {}
    util.inherits(MediaRendererClient, DeviceClient), MediaRendererClient.prototype.getSupportedProtocols = function(callback) {
        this.callAction("ConnectionManager", "GetProtocolInfo", {}, (function(err, result) {
            if (err) return callback(err);
            var protocols = result.Sink.split(",").map((function(line) {
                var tmp = line.split(":");
                return {
                    protocol: tmp[0],
                    network: tmp[1],
                    contentFormat: tmp[2],
                    additionalInfo: tmp[3]
                };
            }));
            callback(null, protocols);
        }));
    }, MediaRendererClient.prototype.getPosition = function(callback) {
        this.callAction("AVTransport", "GetPositionInfo", {
            InstanceID: this.instanceId
        }, (function(err, result) {
            if (err) return callback(err);
            var str = "NOT_IMPLEMENTED" !== result.AbsTime ? result.AbsTime : result.RelTime;
            callback(null, parseTime(str));
        }));
    }, MediaRendererClient.prototype.getDuration = function(callback) {
        this.callAction("AVTransport", "GetMediaInfo", {
            InstanceID: this.instanceId
        }, (function(err, result) {
            if (err) return callback(err);
            callback(null, parseTime(result.MediaDuration));
        }));
    }, MediaRendererClient.prototype.load = function(url, options, callback) {
        var self = this;
        "function" == typeof options && (callback = options, options = {});
        var protocolInfo = "http-get:*:" + (options.contentType || "video/mpeg") + ":*", metadata = options.metadata || {};
        metadata.url = url, metadata.protocolInfo = protocolInfo;
        var params = {
            RemoteProtocolInfo: protocolInfo,
            PeerConnectionManager: null,
            PeerConnectionID: -1,
            Direction: "Input"
        };
        this.callAction("ConnectionManager", "PrepareForConnection", params, (function(err, result) {
            if (err) {
                if ("ENOACTION" !== err.code) return callback(err);
            } else self.instanceId = result.AVTransportID;
            var params = {
                InstanceID: self.instanceId,
                CurrentURI: url,
                CurrentURIMetaData: buildMetadata(metadata)
            };
            self.callAction("AVTransport", "SetAVTransportURI", params, (function(err) {
                if (err) return callback(err);
                options.autoplay ? self.play(callback) : callback();
            }));
        }));
    }, MediaRendererClient.prototype.play = function(callback) {
        var params = {
            InstanceID: this.instanceId,
            Speed: 1
        };
        this.callAction("AVTransport", "Play", params, callback || noop);
    }, MediaRendererClient.prototype.pause = function(callback) {
        var params = {
            InstanceID: this.instanceId
        };
        this.callAction("AVTransport", "Pause", params, callback || noop);
    }, MediaRendererClient.prototype.stop = function(callback) {
        var params = {
            InstanceID: this.instanceId
        };
        this.callAction("AVTransport", "Stop", params, callback || noop);
    }, MediaRendererClient.prototype.seek = function(seconds, callback) {
        var params = {
            InstanceID: this.instanceId,
            Unit: "REL_TIME",
            Target: formatTime(seconds)
        };
        this.callAction("AVTransport", "Seek", params, callback || noop);
    }, MediaRendererClient.prototype.getVolume = function(callback) {
        this.callAction("RenderingControl", "GetVolume", {
            InstanceID: this.instanceId,
            Channel: "Master"
        }, (function(err, result) {
            if (err) return callback(err);
            callback(null, parseInt(result.CurrentVolume));
        }));
    }, MediaRendererClient.prototype.setVolume = function(volume, callback) {
        var params = {
            InstanceID: this.instanceId,
            Channel: "Master",
            DesiredVolume: volume
        };
        this.callAction("RenderingControl", "SetVolume", params, callback || noop);
    }, module.exports = MediaRendererClient;
}
