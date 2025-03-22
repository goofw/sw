function(module, exports, __webpack_require__) {
    var EventEmitter = __webpack_require__(5).EventEmitter, util = __webpack_require__(0);
    function Channel(bus, sourceId, destinationId, namespace, encoding) {
        EventEmitter.call(this), this.bus = bus, this.sourceId = sourceId, this.destinationId = destinationId, 
        this.namespace = namespace, this.encoding = encoding;
        var self = this;
        function onmessage(sourceId, destinationId, namespace, data) {
            sourceId === self.destinationId && (destinationId !== self.sourceId && "*" !== destinationId || namespace === self.namespace && self.emit("message", (function(data, encoding) {
                if (!encoding) return data;
                if ("JSON" === encoding) return JSON.parse(data);
                throw new Error("Unsupported channel encoding: " + encoding);
            })(data, self.encoding), "*" === destinationId));
        }
        this.bus.on("message", onmessage), this.bus.on("close", self.close), this.once("close", (function() {
            self.bus.removeListener("message", onmessage);
        }));
    }
    __webpack_require__(8)("castv2"), util.inherits(Channel, EventEmitter), Channel.prototype.send = function(data) {
        this.bus.send(this.sourceId, this.destinationId, this.namespace, (function(data, encoding) {
            if (!encoding) return data;
            if ("JSON" === encoding) return JSON.stringify(data);
            throw new Error("Unsupported channel encoding: " + encoding);
        })(data, this.encoding));
    }, Channel.prototype.close = function() {
        this.emit("close");
    }, module.exports = Channel;
}
