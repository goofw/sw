function(module, exports, __webpack_require__) {
    "use strict";
    !(function() {
        var inherits = __webpack_require__(0).inherits, EventEmitter = __webpack_require__(5).EventEmitter, constants = __webpack_require__(220), SSDP = __webpack_require__(221), self = function(opts) {
            opts = opts || {}, this.searchInterval = opts.searchInterval || 1e4, this.ssdp = new SSDP(opts), 
            this.timer = !1;
        };
        inherits(self, EventEmitter), self.prototype.start = function() {
            var that = this;
            this.ssdp.on("start", (function() {
                that.emit("start", !0);
            })), this.ssdp.on("delay", (function(obj) {
                that.emit("delay", obj);
            })), this.ssdp.on("error", (function(err) {
                that.emit("error", {
                    type: "ssdp",
                    error: err
                });
            })), this.ssdp.on("bind", (function(socket) {
                that.emit("bind", socket);
            })), this.ssdp.on("response", (function(headers, statusCode, rinfo) {
                that.processResponse(headers, statusCode, rinfo);
            })), this.ssdp.on("send", (function(msg, ip, port) {
                that.emit("send", msg, ip, port);
            })), this.ssdp.start();
        }, self.prototype.stop = function() {
            this.timer && clearInterval(this.timer), this.ssdp.stop();
        }, self.prototype.browse = function(serviceType) {
            var that = this;
            if (!this.ssdp.running) return this.on("start", (function() {
                that.browse(serviceType);
            })), this.start();
            var pkt = this.ssdp.getSSDPHeader(constants.msearch, {
                HOST: this.ssdp.host,
                ST: serviceType,
                MAN: '"ssdp:discover"',
                MX: 3
            }), message = new Buffer(pkt), search = function() {
                that.emit("msearch", message), that.ssdp.send(message);
            };
            search(), this.timer = setInterval((function() {
                search();
            }), this.searchInterval);
        }, self.prototype.processResponse = function(headers, statusCode, rInfo) {
            this.emit("response", {
                headers: headers,
                statusCode: statusCode,
                referrer: rInfo
            });
        }, module.exports = self;
    })();
}
