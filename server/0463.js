function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(req, trust) {
        if (!req) throw new TypeError("req argument is required");
        if (!trust) throw new TypeError("trust argument is required");
        var addrs = alladdrs(req, trust);
        return addrs[addrs.length - 1];
    }, module.exports.all = alladdrs, module.exports.compile = compile;
    var forwarded = __webpack_require__(980), ipaddr = __webpack_require__(166), DIGIT_REGEXP = /^[0-9]+$/, isip = ipaddr.isValid, parseip = ipaddr.parse, IP_RANGES = {
        linklocal: [ "169.254.0.0/16", "fe80::/10" ],
        loopback: [ "127.0.0.1/8", "::1/128" ],
        uniquelocal: [ "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "fc00::/7" ]
    };
    function alladdrs(req, trust) {
        var addrs = forwarded(req);
        if (!trust) return addrs;
        "function" != typeof trust && (trust = compile(trust));
        for (var i = 0; i < addrs.length - 1; i++) trust(addrs[i], i) || (addrs.length = i + 1);
        return addrs;
    }
    function compile(val) {
        if (!val) throw new TypeError("argument is required");
        var trust, rangeSubnets, len, subnets, subnet, subnetip, subnetkind, subnetisipv4, subnetrange;
        if ("string" == typeof val) trust = [ val ]; else {
            if (!Array.isArray(val)) throw new TypeError("unsupported trust argument");
            trust = val.slice();
        }
        for (var i = 0; i < trust.length; i++) val = trust[i], IP_RANGES.hasOwnProperty(val) && (val = IP_RANGES[val], 
        trust.splice.apply(trust, [ i, 1 ].concat(val)), i += val.length - 1);
        return rangeSubnets = (function(arr) {
            for (var rangeSubnets = new Array(arr.length), i = 0; i < arr.length; i++) rangeSubnets[i] = parseipNotation(arr[i]);
            return rangeSubnets;
        })(trust), 0 === (len = rangeSubnets.length) ? trustNone : 1 === len ? (subnet = rangeSubnets[0], 
        subnetip = subnet[0], subnetkind = subnetip.kind(), subnetisipv4 = "ipv4" === subnetkind, 
        subnetrange = subnet[1], function(addr) {
            if (!isip(addr)) return !1;
            var ip = parseip(addr);
            if (ip.kind() !== subnetkind) {
                if (subnetisipv4 && !ip.isIPv4MappedAddress()) return !1;
                ip = subnetisipv4 ? ip.toIPv4Address() : ip.toIPv4MappedAddress();
            }
            return ip.match(subnetip, subnetrange);
        }) : (subnets = rangeSubnets, function(addr) {
            if (!isip(addr)) return !1;
            for (var ipconv, ip = parseip(addr), kind = ip.kind(), i = 0; i < subnets.length; i++) {
                var subnet = subnets[i], subnetip = subnet[0], subnetkind = subnetip.kind(), subnetrange = subnet[1], trusted = ip;
                if (kind !== subnetkind) {
                    if ("ipv4" === subnetkind && !ip.isIPv4MappedAddress()) continue;
                    ipconv || (ipconv = "ipv4" === subnetkind ? ip.toIPv4Address() : ip.toIPv4MappedAddress()), 
                    trusted = ipconv;
                }
                if (trusted.match(subnetip, subnetrange)) return !0;
            }
            return !1;
        });
    }
    function parseipNotation(note) {
        var pos = note.lastIndexOf("/"), str = -1 !== pos ? note.substring(0, pos) : note;
        if (!isip(str)) throw new TypeError("invalid IP address: " + str);
        var ip = parseip(str);
        -1 === pos && "ipv6" === ip.kind() && ip.isIPv4MappedAddress() && (ip = ip.toIPv4Address());
        var max = "ipv6" === ip.kind() ? 128 : 32, range = -1 !== pos ? note.substring(pos + 1, note.length) : null;
        if ((range = null === range ? max : DIGIT_REGEXP.test(range) ? parseInt(range, 10) : "ipv4" === ip.kind() && isip(range) ? (function(netmask) {
            var ip = parseip(netmask);
            return "ipv4" === ip.kind() ? ip.prefixLengthFromSubnetMask() : null;
        })(range) : null) <= 0 || range > max) throw new TypeError("invalid range on address: " + note);
        return [ ip, range ];
    }
    function trustNone() {
        return !1;
    }
}
