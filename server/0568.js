function(module, exports, __webpack_require__) {
    var bittorrentDHT = __webpack_require__(569), EventEmitter = __webpack_require__(5).EventEmitter;
    function DHT(infoHash) {
        var self = this;
        EventEmitter.call(this);
        var abort, wait, dht = new bittorrentDHT({
            concurrency: 10
        });
        this.run = function() {
            abort || wait || (wait = setTimeout((function() {
                self.numRequests++, abort = dht.lookup(infoHash), wait = null;
            }), 1500));
        }, this.pause = function() {
            wait && (clearTimeout(wait), wait = null), abort && (setTimeout(abort, 1500), abort = null);
        }, dht.on("peer", (function(p) {
            self.emit("peer", p.host + ":" + p.port);
        }));
    }
    DHT.prototype.__proto__ = EventEmitter.prototype, module.exports = DHT;
}
