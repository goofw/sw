function(module, exports, __webpack_require__) {
    "use strict";
    !(function() {
        var inherits = __webpack_require__(0).inherits, EventEmitter = __webpack_require__(5).EventEmitter, dgram = __webpack_require__(69), os = __webpack_require__(21), net = __webpack_require__(42), constants = __webpack_require__(220), regex = {
            http: /HTTP\/\d{1}\.\d{1} \d+ .*/,
            ssdp: /^([^:]+):\s*(.*)$/
        }, version_node = process.version.substr(1), version_module = __webpack_require__(443).version, version_name = __webpack_require__(443).name, self = function(opts) {
            var that = this;
            opts = opts || {}, this.running = !1, this.sig = opts.sig || "node.js/" + version_node + " " + version_name + "/" + version_module, 
            this.multicastIp = 0 !== net.isIP(opts.multicastIp) ? opts.multicastIp : "239.255.255.250", 
            this.multicast = opts.multicast || !0, this.port = opts.port || 1900, this.host = this.multicastIp + ":" + this.port, 
            this.ttl = opts.ttl || 1, this.bindHost = opts.bindHost || !1, this.bindPort = opts.bindPort || 0, 
            this.allowWildcards = opts.allowWildcards || !1, this.reuseAddr = opts.reuseAddr || !0, 
            this.multicastLoopback = opts.multicastLoopback || !1, this.sockets = [], this.interfaces = (function() {
                var localAddresses = [];
                if (that.bindHost && 4 === net.isIP(that.bindHost)) localAddresses.push(that.bindHost); else {
                    var osInterfaces = os.networkInterfaces();
                    for (var osInterface in osInterfaces) for (var osAddresses = osInterfaces[osInterface], i = 0; i < osAddresses.length; i++) {
                        var osAddress = osAddresses[i];
                        osAddress.internal || "IPv4" === osAddress.family && localAddresses.push(osAddress.address);
                    }
                }
                return localAddresses;
            })();
        };
        inherits(self, EventEmitter), self.prototype.stop = function() {
            for (var i = 0; i < this.sockets.length; i++) {
                var socket = this.sockets[i];
                socket && socket.close();
            }
            this.running = !1, this.sockets = [], this.emit("stop", !0);
        }, self.prototype.start = function() {
            if (!this.running) {
                this.running = !0;
                for (var i = 0; i < this.interfaces.length; i++) {
                    var iface = this.interfaces[i], skt = this.createSocket(iface, this.bindPort);
                    this.sockets.push(skt);
                }
                this.emit("start", !0);
            }
        }, self.prototype.createSocket = function(address, port) {
            var that = this, socket = dgram.createSocket({
                type: "udp4",
                reuseAddr: that.reuseAddr,
                toString: function() {
                    return that.type;
                }
            });
            return socket.on("error", (function(err) {
                that.emit("error", {
                    type: "socket",
                    socket: socket,
                    error: err
                });
            })), socket.on("message", (function(message, referrer) {
                that.emit("message", {
                    message: message,
                    referrer: referrer
                }), that.parseMessage(message, referrer);
            })), socket.on("listening", (function() {
                try {
                    var addr = socket.address();
                } catch (e) {
                    return void that.emit("error", {
                        type: "listenSocket",
                        socket: socket
                    });
                }
                var addMember = function() {
                    try {
                        that.multicast && socket.addMembership(that.multicastIp, address), socket.setMulticastTTL(that.ttl), 
                        socket.setMulticastLoopback(that.multicastLoopback);
                    } catch (e) {
                        "ENODEV" === e.code || "EADDRNOAVAIL" === e.code ? (that.emit("delay", {
                            type: "socketMembership",
                            address: addr.address,
                            port: addr.port
                        }), setTimeout((function() {
                            addMember();
                        }), 5e3)) : that.emit("error", {
                            type: "socketMembership",
                            address: addr,
                            error: e
                        });
                    }
                };
                addMember();
            })), socket.bind({
                port: port,
                address: address
            }, (function() {
                that.emit("bind", socket);
            })), socket;
        }, self.prototype.parseMessage = function(msg, rinfo) {
            var type = (msg = msg.toString()).split("\r\n").shift();
            regex.http.test(type) ? this.parseResponse(msg, rinfo) : this.parseCommand(msg, rinfo);
        }, self.prototype.parseCommand = function(msg, rinfo) {
            var method = this.getMethod(msg), headers = this.getHeaders(msg);
            switch (method) {
              case constants.notify:
                this.notify(headers, msg, rinfo);
                break;

              case constants.msearch:
                this.msearch(headers, msg, rinfo);
                break;

              default:
                this.emit("error", {
                    type: "command",
                    subType: "unhandled",
                    message: msg,
                    rinfo: rinfo
                });
            }
        }, self.prototype.notify = function(headers, msg, rinfo) {
            if (headers.NTS) switch (headers.NTS.toLowerCase()) {
              case constants.alive:
                this.emit(constants.advertiseAlive, {
                    headers: headers,
                    rinfo: rinfo
                });
                break;

              case constants.bye:
                this.emit(constants.advertiseBye, {
                    headers: headers,
                    rinfo: rinfo
                });
                break;

              default:
                this.emit("error", {
                    type: "notify",
                    subType: "unhandled",
                    message: msg,
                    rinfo: rinfo
                });
            }
        }, self.prototype.msearch = function(headers, msg, rinfo) {
            headers.MAN && headers.MX && headers.ST && this.emit("msearch", headers, msg, rinfo);
        }, self.prototype.parseResponse = function(msg, rinfo) {
            var headers = this.getHeaders(msg), statusCode = this.getStatusCode(msg);
            this.emit("response", headers, statusCode, rinfo);
        }, self.prototype.getSSDPHeader = function(method, headers, isResponse) {
            var message = [];
            for (var header in method = method.toUpperCase(), isResponse ? message.push("HTTP/1.1 " + method) : message.push(method + " * HTTP/1.1"), 
            headers) message.push(header + ": " + headers[header]);
            return message.push("\r\n"), message.join("\r\n");
        }, self.prototype.getMethod = function(msg) {
            return (msg.split("\r\n").shift().split(" ")[0] || "").toLowerCase();
        }, self.prototype.getStatusCode = function(msg) {
            var type = msg.split("\r\n").shift().split(" ");
            return parseInt(type[1], 10);
        }, self.prototype.getHeaders = function(msg) {
            for (var lines = msg.split("\r\n"), headers = {}, i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (line.length) {
                    var pairs = line.match(regex.ssdp);
                    pairs && (headers[pairs[1].toUpperCase()] = pairs[2]);
                }
            }
            return headers;
        }, self.prototype.send = function(message, host, port) {
            for (var targetHost = host || this.multicastIp, targetPort = port || this.port, self = this, i = 0; i < this.sockets.length; i++) this.sockets[i].send(message, 0, message.length, targetPort, targetHost, (function(err) {
                err ? self.emit("error", {
                    type: "send",
                    error: err
                }) : self.emit("send", message, targetHost, targetPort);
            }));
        }, module.exports = self;
    })();
}
