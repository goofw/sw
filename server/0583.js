function(module, exports, __webpack_require__) {
    var trackerCli = __webpack_require__(584), EventEmitter = __webpack_require__(5).EventEmitter;
    function Tracker(url, opts, infoHash) {
        var self = this;
        EventEmitter.call(this);
        var peerId = new Buffer("01234567890123456789");
        this.run = function() {
            self.numRequests++;
            var client = new trackerCli(peerId, 6881, {
                infoHash: infoHash,
                announce: [ url ]
            });
            client.start(), client.on("peer", (function(addr) {
                self.emit("peer", addr);
            }));
        }, this.pause = function() {};
    }
    Tracker.prototype.__proto__ = EventEmitter.prototype, module.exports = Tracker;
}
