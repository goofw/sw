function(module, exports, __webpack_require__) {
    var fetch = "undefined" != typeof window ? window.fetch : __webpack_require__(33), events = __webpack_require__(5), PROPS = [ "audio", "audioTrack", "volume", "time", "paused", "state", "length", "mediaSessionId", "subtitlesSrc", "subtitlesDelay", "subtitlesSize" ];
    module.exports = function(url) {
        var self = new events.EventEmitter;
        self.initialized = !1;
        var status = {}, modified = {}, timer = null;
        function sync() {
            var p = fetch(url, {
                method: "POST",
                body: JSON.stringify(modified),
                headers: {
                    "content-type": "application/json"
                }
            });
            modified = {}, p.then((function(res) {
                return res.json();
            })).then((function(resp) {
                var old, current;
                old = status, (current = status = resp).state === old.state && current.source === old.source && current.mediaSessionId === old.mediaSessionId || self.emit("statechanged", {
                    state: current.state
                }), current.time !== old.time && self.emit("timeupdate", {
                    time: current.time
                }), resetTimer();
            }));
        }
        function resetTimer(t) {
            clearTimeout(timer), timer = self.source ? setTimeout(sync, t || 1e3) : null;
        }
        return PROPS.forEach((function(p) {
            Object.defineProperty(self, p, {
                get: function() {
                    return modified.hasOwnProperty(p) ? modified[p] : status[p];
                },
                set: function(v) {
                    modified[p] = v, resetTimer(50), "volume" === p && self.emit("volumechanged");
                }
            });
        })), self.play = function(src) {
            self.source = modified.source = src, resetTimer(50);
        }, self.stop = function() {
            self.source && (resetTimer(50), self.source = modified.source = null);
        }, self;
    };
}
