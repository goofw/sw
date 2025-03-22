function(module, exports, __webpack_require__) {
    var os = __webpack_require__(21);
    function externalIpv4Address(addr) {
        return "IPv4" === addr.family && !addr.internal;
    }
    function ip2int(ip) {
        return ip.split(".").reduce((function(r, v) {
            return 256 * parseInt(r, 10) + parseInt(v, 10);
        }));
    }
    function myAddresses() {
        var ifaces = os.networkInterfaces(), addresses = [];
        return Object.keys(ifaces).forEach((function(key) {
            ifaces[key].filter(externalIpv4Address).forEach((function(addr) {
                var mask = ip2int(addr.netmask);
                addresses.push({
                    address: addr.address,
                    netmask: mask,
                    network: ip2int(addr.address) & mask
                });
            }));
        })), addresses;
    }
    module.exports = {
        ip2int: ip2int,
        addresses: myAddresses,
        addressFor: function(addr) {
            var searchIp = ip2int(addr), retAddr = myAddresses().find((function(net) {
                return net.network == (searchIp & net.netmask);
            }));
            if (retAddr) return retAddr.address;
        }
    };
}
