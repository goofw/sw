function(module, exports, __webpack_require__) {
    "use strict";
    !(function() {
        var inherits = __webpack_require__(0).inherits, EventEmitter = __webpack_require__(5).EventEmitter, constants = __webpack_require__(220), extend = __webpack_require__(147), SSDP = __webpack_require__(221), uuidV4 = __webpack_require__(148), self = function(opts) {
            opts = opts || {}, this.advertisementInterval = opts.advertisementInterval || 1e4, 
            this.description = opts.description || "upnp/desc.php", this.packetTtl = opts.packetTtl || 1800, 
            this.suppressRootDeviceAdvertisement = opts.suppressRootDeviceAdvertisement || !1, 
            this.extraHeaders = opts.headers || {}, this.passive = opts.passiveResponder || !1, 
            this.queryAuthenticator = "function" == typeof opts.queryAuthenticator && opts.queryAuthenticator, 
            this.usns = [], this.location = opts.location || "http://127.0.0.1/upnp/desc.html", 
            this.udn = opts.udn || "uuid:" + uuidV4(), this.suppressRootDeviceAdvertisement || (this.usns[this.udn] = this.udn), 
            opts.bindPort = 1900, this.ssdp = new SSDP(opts), this.timer = !1;
        };
        inherits(self, EventEmitter), self.prototype.start = function() {
            var that = this;
            this.ssdp.on("start", (function() {
                that.emit("start", !0), that.timer = setInterval((function() {
                    that.advertise();
                }), that.advertisementInterval), that.advertise();
            })), this.ssdp.on("delay", (function(obj) {
                that.emit("delay", obj);
            })), this.ssdp.on("error", (function(err) {
                that.emit("error", {
                    type: "ssdp",
                    error: err
                });
            })), this.ssdp.on("msearch", (function(headers, statusCode, rinfo) {
                that.emit("msearch", headers, statusCode, rinfo), that.respondToSearch(headers.ST, rinfo);
            })), this.ssdp.on("send", (function(msg, ip, port) {
                that.emit("send", msg, ip, port);
            })), this.ssdp.start();
        }, self.prototype.stop = function() {
            this.timer && clearInterval(this.timer), this.ssdp.stop();
        }, self.prototype.advertise = function(service) {
            if (!this.timer) {
                var that = this;
                this.on("start", (function() {
                    that.advertise(service);
                })), this.start();
            }
            if (service && this.addUSN(service), !this.passive) for (var usn in this.usns) {
                var udn = this.usns[usn], nts = constants.alive, headers = {
                    HOST: this.ssdp.host,
                    NT: usn,
                    NTS: nts,
                    USN: udn,
                    LOCATION: this.location,
                    "CACHE-CONTROL": "max-age=" + this.packetTtl,
                    SERVER: this.ssdp.sig
                };
                extend(headers, this.extraHeaders);
                var message = this.ssdp.getSSDPHeader(constants.notify, headers);
                this.ssdp.send(new Buffer(message)), this.emit("advertise", message);
            }
        }, self.prototype.addUSN = function(device) {
            this.usns[device] = this.udn + "::" + device;
        }, self.prototype.respondToSearch = function(serviceType, rinfo) {
            var acceptor, stRegex, peer = {
                address: rinfo.address,
                port: rinfo.port
            };
            if (!this.queryAuthenticator || this.queryAuthenticator(serviceType, rinfo)) for (var usn in '"' === serviceType[0] && '"' === serviceType[serviceType.length - 1] && (serviceType = serviceType.slice(1, -1)), 
            this.allowWildcards ? (stRegex = new RegExp(serviceType.replace(/\*/g, ".*") + "$"), 
            acceptor = function(usn, serviceType) {
                return serviceType === constants.all || stRegex.test(usn);
            }) : acceptor = function(usn, serviceType) {
                return serviceType === constants.all || usn === serviceType;
            }, this.usns) {
                var udn = this.usns[usn];
                if (this.allowWildcards && (udn = udn.replace(stRegex, serviceType)), acceptor(usn, serviceType)) {
                    var pkt = this.ssdp.getSSDPHeader("200 OK", extend({
                        ST: serviceType === constants.all ? usn : serviceType,
                        USN: udn,
                        LOCATION: this.location,
                        "CACHE-CONTROL": "max-age=" + this.packetTtl,
                        DATE: (new Date).toUTCString(),
                        SERVER: this.sig,
                        EXT: ""
                    }, this.extraHeaders), !0);
                    this.emit("respondToSearch", peer.addr, peer.port);
                    var message = new Buffer(pkt);
                    this.ssdp.send(message, peer.address, peer.port);
                }
            }
        }, module.exports = self;
    })();
}
