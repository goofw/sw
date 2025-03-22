function(module, exports, __webpack_require__) {
    module.exports = Tracker;
    var EventEmitter = __webpack_require__(5).EventEmitter;
    function Tracker(client, announceUrl) {
        EventEmitter.call(this), this.client = client, this.announceUrl = announceUrl, this.interval = null, 
        this.destroyed = !1;
    }
    __webpack_require__(6)(Tracker, EventEmitter), Tracker.prototype.setInterval = function(intervalMs) {
        if (null == intervalMs && (intervalMs = this.DEFAULT_ANNOUNCE_INTERVAL), clearInterval(this.interval), 
        intervalMs) {
            var update = this.announce.bind(this, this.client._defaultAnnounceOpts());
            this.interval = setInterval(update, intervalMs), this.interval.unref && this.interval.unref();
        }
    };
}
