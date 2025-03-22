function(module, exports, __webpack_require__) {
    var os = __webpack_require__(21);
    function pickInterface(interfaces, family) {
        for (var i in interfaces) for (var j = interfaces[i].length - 1; j >= 0; j--) {
            var face = interfaces[i][j], reachable = "IPv4" === family || 0 === face.scopeid;
            if (!face.internal && face.family === family && reachable) return face.address;
        }
        return "IPv4" === family ? "127.0.0.1" : "::1";
    }
    function reduceInterfaces(interfaces, iface) {
        var ifaces = {};
        for (var i in interfaces) i === iface && (ifaces[i] = interfaces[i]);
        return ifaces;
    }
    function ipv4(iface) {
        var interfaces = os.networkInterfaces();
        return iface && (interfaces = reduceInterfaces(interfaces, iface)), pickInterface(interfaces, "IPv4");
    }
    ipv4.ipv4 = ipv4, ipv4.ipv6 = function(iface) {
        var interfaces = os.networkInterfaces();
        return iface && (interfaces = reduceInterfaces(interfaces, iface)), pickInterface(interfaces, "IPv6");
    }, module.exports = ipv4;
}
