function(module, exports, __webpack_require__) {
    var packet = __webpack_require__(900), dgram = __webpack_require__(69), thunky = __webpack_require__(904), events = __webpack_require__(5), os = __webpack_require__(21), noop = function() {};
    module.exports = function(opts) {
        opts || (opts = {});
        var that = new events.EventEmitter, port = "number" == typeof opts.port ? opts.port : 5353, type = opts.type || "udp4", ip = opts.ip || opts.host || ("udp4" === type ? "224.0.0.251" : null), me = {
            address: ip,
            port: port
        }, memberships = {}, destroyed = !1, interval = null;
        if (!("udp6" !== type || ip && opts.interface)) throw new Error("For IPv6 multicast you must specify `ip` and `interface`");
        var socket = opts.socket || dgram.createSocket({
            type: type,
            reuseAddr: !1 !== opts.reuseAddr,
            toString: function() {
                return type;
            }
        });
        socket.on("error", (function(err) {
            "EACCES" === err.code || "EADDRINUSE" === err.code ? that.emit("error", err) : that.emit("warning", err);
        })), socket.on("message", (function(message, rinfo) {
            try {
                message = packet.decode(message);
            } catch (err) {
                return void that.emit("warning", err);
            }
            that.emit("packet", message, rinfo), "query" === message.type && that.emit("query", message, rinfo), 
            "response" === message.type && that.emit("response", message, rinfo);
        })), socket.on("listening", (function() {
            port || (port = me.port = socket.address().port), !1 !== opts.multicast && (that.update(), 
            interval = setInterval(that.update, 5e3), socket.setMulticastTTL(opts.ttl || 255), 
            socket.setMulticastLoopback(!1 !== opts.loopback));
        }));
        var bind = thunky((function(cb) {
            if (!port) return cb(null);
            socket.once("error", cb), socket.bind(port, opts.interface, (function() {
                socket.removeListener("error", cb), cb(null);
            }));
        }));
        return bind((function(err) {
            if (err) return that.emit("error", err);
            that.emit("ready");
        })), that.send = function(value, rinfo, cb) {
            if ("function" == typeof rinfo) return that.send(value, null, rinfo);
            cb || (cb = noop), rinfo || (rinfo = me), bind((function(err) {
                if (destroyed) return cb();
                if (err) return cb(err);
                var message = packet.encode(value);
                socket.send(message, 0, message.length, rinfo.port, rinfo.address || rinfo.host, cb);
            }));
        }, that.response = that.respond = function(res, rinfo, cb) {
            Array.isArray(res) && (res = {
                answers: res
            }), res.type = "response", res.flags = (res.flags || 0) | packet.AUTHORITATIVE_ANSWER, 
            that.send(res, rinfo, cb);
        }, that.query = function(q, type, rinfo, cb) {
            return "function" == typeof type ? that.query(q, null, null, type) : "object" == typeof type && type && type.port ? that.query(q, null, type, rinfo) : "function" == typeof rinfo ? that.query(q, type, null, rinfo) : (cb || (cb = noop), 
            "string" == typeof q && (q = [ {
                name: q,
                type: type || "ANY"
            } ]), Array.isArray(q) && (q = {
                type: "query",
                questions: q
            }), q.type = "query", void that.send(q, rinfo, cb));
        }, that.destroy = function(cb) {
            if (cb || (cb = noop), destroyed) return process.nextTick(cb);
            destroyed = !0, clearInterval(interval), socket.once("close", cb), socket.close();
        }, that.update = function() {
            for (var ifaces = opts.interface ? [].concat(opts.interface) : (function() {
                for (var networks = os.networkInterfaces(), names = Object.keys(networks), res = [], i = 0; i < names.length; i++) for (var net = networks[names[i]], j = 0; j < net.length; j++) {
                    var iface = net[j];
                    if ("IPv4" === iface.family) {
                        res.push(iface.address);
                        break;
                    }
                }
                return res;
            })(), updated = !1, i = 0; i < ifaces.length; i++) {
                var addr = ifaces[i];
                if (!memberships[addr]) {
                    memberships[addr] = !0, updated = !0;
                    try {
                        socket.addMembership(ip, addr);
                    } catch (err) {
                        that.emit("warning", err);
                    }
                }
            }
            updated && socket.setMulticastInterface && socket.setMulticastInterface(opts.interface || (function() {
                for (var networks = os.networkInterfaces(), names = Object.keys(networks), i = 0; i < names.length; i++) for (var net = networks[names[i]], j = 0; j < net.length; j++) {
                    var iface = net[j];
                    if ("IPv4" === iface.family && !iface.internal) return iface.address;
                }
                return "127.0.0.1";
            })());
        }, that;
    };
}
