function(module, exports, __webpack_require__) {
    var DHT = __webpack_require__(568), Tracker = __webpack_require__(583);
    __webpack_require__(5), module.exports = function(sources, swarm, options) {
        var self = this, uniq = {};
        self.options = options, (sources = sources.map((function(src) {
            if ("string" == typeof src) return src.match("^dht:") ? new DHT(src.split(":")[1], options) : src.match("^tracker:") ? new Tracker(src.slice("tracker:".length), {}, swarm.infoHash) : void 0;
        })).map((function(x, i) {
            return x && (x.url = sources[i]), x;
        })).filter((function(x) {
            return x;
        }))).forEach((function(x) {
            x.numFound = 0, x.numFoundUniq = 0, x.numRequests = 0, x.on("peer", (function(addr) {
                uniq[addr] || (x.numFoundUniq++, uniq[addr] = !0), x.numFound++, swarm.add(addr);
            }));
        }));
        var running = !1;
        this.run = function() {
            running = !0, sources.forEach((function(x) {
                x.run(), x.lastStarted = new Date;
            }));
        }, this.pause = function() {
            running = !1, sources.forEach((function(x) {
                x.pause();
            }));
        }, this.close = function() {
            sources.forEach((function(x) {
                x.removeAllListeners && x.removeAllListeners(), x.close && x.close();
            }));
        }, this.stats = function() {
            return sources.map((function(x) {
                return {
                    numFound: x.numFound,
                    numFoundUniq: x.numFoundUniq,
                    numRequests: x.numRequests,
                    url: x.url,
                    lastStarted: x.lastStarted
                };
            }));
        }, this.isRunning = function() {
            return running;
        }, this.run();
        var update = function() {
            var len = swarm.queued;
            return swarm.paused && running ? self.pause() : options.hasOwnProperty("min") && len < options.min && !running ? self.run() : options.hasOwnProperty("max") && len > options.max && running ? self.pause() : void 0;
        };
        swarm.on("wire", update), swarm.on("wire-disconnect", update), swarm.on("resume", update), 
        swarm.on("pause", update);
        var runIntvl = setInterval((function() {
            running && self.run();
        }), 3e4);
        swarm.on("close", (function() {
            swarm.removeAllListeners(), self.pause(), self.close(), sources = [], runIntvl && clearInterval(runIntvl);
        })), swarm.peerSearch = self;
    };
}
