function(module, exports, __webpack_require__) {
    (function(module) {
        (function() {
            var expandIPv6, ipaddr, ipv4Part, ipv4Regexes, ipv6Part, ipv6Regexes, matchCIDR;
            ipaddr = {}, null !== module && module.exports ? module.exports = ipaddr : this.ipaddr = ipaddr, 
            matchCIDR = function(first, second, partSize, cidrBits) {
                var part, shift;
                if (first.length !== second.length) throw new Error("ipaddr: cannot match CIDR for objects with different lengths");
                for (part = 0; cidrBits > 0; ) {
                    if ((shift = partSize - cidrBits) < 0 && (shift = 0), first[part] >> shift != second[part] >> shift) return !1;
                    cidrBits -= partSize, part += 1;
                }
                return !0;
            }, ipaddr.subnetMatch = function(address, rangeList, defaultName) {
                var k, len, rangeName, rangeSubnets, subnet;
                for (rangeName in null == defaultName && (defaultName = "unicast"), rangeList) for (!(rangeSubnets = rangeList[rangeName])[0] || rangeSubnets[0] instanceof Array || (rangeSubnets = [ rangeSubnets ]), 
                k = 0, len = rangeSubnets.length; k < len; k++) if (subnet = rangeSubnets[k], address.kind() === subnet[0].kind() && address.match.apply(address, subnet)) return rangeName;
                return defaultName;
            }, ipaddr.IPv4 = (function() {
                function IPv4(octets) {
                    var k, len, octet;
                    if (4 !== octets.length) throw new Error("ipaddr: ipv4 octet count should be 4");
                    for (k = 0, len = octets.length; k < len; k++) if (!(0 <= (octet = octets[k]) && octet <= 255)) throw new Error("ipaddr: ipv4 octet should fit in 8 bits");
                    this.octets = octets;
                }
                return IPv4.prototype.kind = function() {
                    return "ipv4";
                }, IPv4.prototype.toString = function() {
                    return this.octets.join(".");
                }, IPv4.prototype.toNormalizedString = function() {
                    return this.toString();
                }, IPv4.prototype.toByteArray = function() {
                    return this.octets.slice(0);
                }, IPv4.prototype.match = function(other, cidrRange) {
                    var ref;
                    if (void 0 === cidrRange && (other = (ref = other)[0], cidrRange = ref[1]), "ipv4" !== other.kind()) throw new Error("ipaddr: cannot match ipv4 address with non-ipv4 one");
                    return matchCIDR(this.octets, other.octets, 8, cidrRange);
                }, IPv4.prototype.SpecialRanges = {
                    unspecified: [ [ new IPv4([ 0, 0, 0, 0 ]), 8 ] ],
                    broadcast: [ [ new IPv4([ 255, 255, 255, 255 ]), 32 ] ],
                    multicast: [ [ new IPv4([ 224, 0, 0, 0 ]), 4 ] ],
                    linkLocal: [ [ new IPv4([ 169, 254, 0, 0 ]), 16 ] ],
                    loopback: [ [ new IPv4([ 127, 0, 0, 0 ]), 8 ] ],
                    carrierGradeNat: [ [ new IPv4([ 100, 64, 0, 0 ]), 10 ] ],
                    private: [ [ new IPv4([ 10, 0, 0, 0 ]), 8 ], [ new IPv4([ 172, 16, 0, 0 ]), 12 ], [ new IPv4([ 192, 168, 0, 0 ]), 16 ] ],
                    reserved: [ [ new IPv4([ 192, 0, 0, 0 ]), 24 ], [ new IPv4([ 192, 0, 2, 0 ]), 24 ], [ new IPv4([ 192, 88, 99, 0 ]), 24 ], [ new IPv4([ 198, 51, 100, 0 ]), 24 ], [ new IPv4([ 203, 0, 113, 0 ]), 24 ], [ new IPv4([ 240, 0, 0, 0 ]), 4 ] ]
                }, IPv4.prototype.range = function() {
                    return ipaddr.subnetMatch(this, this.SpecialRanges);
                }, IPv4.prototype.toIPv4MappedAddress = function() {
                    return ipaddr.IPv6.parse("::ffff:" + this.toString());
                }, IPv4.prototype.prefixLengthFromSubnetMask = function() {
                    var cidr, i, k, octet, stop, zeros, zerotable;
                    for (zerotable = {
                        0: 8,
                        128: 7,
                        192: 6,
                        224: 5,
                        240: 4,
                        248: 3,
                        252: 2,
                        254: 1,
                        255: 0
                    }, cidr = 0, stop = !1, i = k = 3; k >= 0; i = k += -1) {
                        if (!((octet = this.octets[i]) in zerotable)) return null;
                        if (zeros = zerotable[octet], stop && 0 !== zeros) return null;
                        8 !== zeros && (stop = !0), cidr += zeros;
                    }
                    return 32 - cidr;
                }, IPv4;
            })(), ipv4Part = "(0?\\d+|0x[a-f0-9]+)", ipv4Regexes = {
                fourOctet: new RegExp("^" + ipv4Part + "\\." + ipv4Part + "\\." + ipv4Part + "\\." + ipv4Part + "$", "i"),
                longValue: new RegExp("^" + ipv4Part + "$", "i")
            }, ipaddr.IPv4.parser = function(string) {
                var match, parseIntAuto, part, shift, value;
                if (parseIntAuto = function(string) {
                    return "0" === string[0] && "x" !== string[1] ? parseInt(string, 8) : parseInt(string);
                }, match = string.match(ipv4Regexes.fourOctet)) return (function() {
                    var k, len, ref, results;
                    for (results = [], k = 0, len = (ref = match.slice(1, 6)).length; k < len; k++) part = ref[k], 
                    results.push(parseIntAuto(part));
                    return results;
                })();
                if (match = string.match(ipv4Regexes.longValue)) {
                    if ((value = parseIntAuto(match[1])) > 4294967295 || value < 0) throw new Error("ipaddr: address outside defined range");
                    return (function() {
                        var k, results;
                        for (results = [], shift = k = 0; k <= 24; shift = k += 8) results.push(value >> shift & 255);
                        return results;
                    })().reverse();
                }
                return null;
            }, ipaddr.IPv6 = (function() {
                function IPv6(parts, zoneId) {
                    var i, k, l, len, part, ref;
                    if (16 === parts.length) for (this.parts = [], i = k = 0; k <= 14; i = k += 2) this.parts.push(parts[i] << 8 | parts[i + 1]); else {
                        if (8 !== parts.length) throw new Error("ipaddr: ipv6 part count should be 8 or 16");
                        this.parts = parts;
                    }
                    for (l = 0, len = (ref = this.parts).length; l < len; l++) if (!(0 <= (part = ref[l]) && part <= 65535)) throw new Error("ipaddr: ipv6 part should fit in 16 bits");
                    zoneId && (this.zoneId = zoneId);
                }
                return IPv6.prototype.kind = function() {
                    return "ipv6";
                }, IPv6.prototype.toString = function() {
                    return this.toNormalizedString().replace(/((^|:)(0(:|$))+)/, "::");
                }, IPv6.prototype.toRFC5952String = function() {
                    var bestMatchIndex, bestMatchLength, match, regex, string;
                    for (regex = /((^|:)(0(:|$)){2,})/g, string = this.toNormalizedString(), bestMatchIndex = 0, 
                    bestMatchLength = -1; match = regex.exec(string); ) match[0].length > bestMatchLength && (bestMatchIndex = match.index, 
                    bestMatchLength = match[0].length);
                    return bestMatchLength < 0 ? string : string.substring(0, bestMatchIndex) + "::" + string.substring(bestMatchIndex + bestMatchLength);
                }, IPv6.prototype.toByteArray = function() {
                    var bytes, k, len, part, ref;
                    for (bytes = [], k = 0, len = (ref = this.parts).length; k < len; k++) part = ref[k], 
                    bytes.push(part >> 8), bytes.push(255 & part);
                    return bytes;
                }, IPv6.prototype.toNormalizedString = function() {
                    var addr, part, suffix;
                    return addr = function() {
                        var k, len, ref, results;
                        for (results = [], k = 0, len = (ref = this.parts).length; k < len; k++) part = ref[k], 
                        results.push(part.toString(16));
                        return results;
                    }.call(this).join(":"), suffix = "", this.zoneId && (suffix = "%" + this.zoneId), 
                    addr + suffix;
                }, IPv6.prototype.toFixedLengthString = function() {
                    var addr, part, suffix;
                    return addr = function() {
                        var k, len, ref, results;
                        for (results = [], k = 0, len = (ref = this.parts).length; k < len; k++) part = ref[k], 
                        results.push(part.toString(16).padStart(4, "0"));
                        return results;
                    }.call(this).join(":"), suffix = "", this.zoneId && (suffix = "%" + this.zoneId), 
                    addr + suffix;
                }, IPv6.prototype.match = function(other, cidrRange) {
                    var ref;
                    if (void 0 === cidrRange && (other = (ref = other)[0], cidrRange = ref[1]), "ipv6" !== other.kind()) throw new Error("ipaddr: cannot match ipv6 address with non-ipv6 one");
                    return matchCIDR(this.parts, other.parts, 16, cidrRange);
                }, IPv6.prototype.SpecialRanges = {
                    unspecified: [ new IPv6([ 0, 0, 0, 0, 0, 0, 0, 0 ]), 128 ],
                    linkLocal: [ new IPv6([ 65152, 0, 0, 0, 0, 0, 0, 0 ]), 10 ],
                    multicast: [ new IPv6([ 65280, 0, 0, 0, 0, 0, 0, 0 ]), 8 ],
                    loopback: [ new IPv6([ 0, 0, 0, 0, 0, 0, 0, 1 ]), 128 ],
                    uniqueLocal: [ new IPv6([ 64512, 0, 0, 0, 0, 0, 0, 0 ]), 7 ],
                    ipv4Mapped: [ new IPv6([ 0, 0, 0, 0, 0, 65535, 0, 0 ]), 96 ],
                    rfc6145: [ new IPv6([ 0, 0, 0, 0, 65535, 0, 0, 0 ]), 96 ],
                    rfc6052: [ new IPv6([ 100, 65435, 0, 0, 0, 0, 0, 0 ]), 96 ],
                    "6to4": [ new IPv6([ 8194, 0, 0, 0, 0, 0, 0, 0 ]), 16 ],
                    teredo: [ new IPv6([ 8193, 0, 0, 0, 0, 0, 0, 0 ]), 32 ],
                    reserved: [ [ new IPv6([ 8193, 3512, 0, 0, 0, 0, 0, 0 ]), 32 ] ]
                }, IPv6.prototype.range = function() {
                    return ipaddr.subnetMatch(this, this.SpecialRanges);
                }, IPv6.prototype.isIPv4MappedAddress = function() {
                    return "ipv4Mapped" === this.range();
                }, IPv6.prototype.toIPv4Address = function() {
                    var high, low, ref;
                    if (!this.isIPv4MappedAddress()) throw new Error("ipaddr: trying to convert a generic ipv6 address to ipv4");
                    return high = (ref = this.parts.slice(-2))[0], low = ref[1], new ipaddr.IPv4([ high >> 8, 255 & high, low >> 8, 255 & low ]);
                }, IPv6.prototype.prefixLengthFromSubnetMask = function() {
                    var cidr, i, k, part, stop, zeros, zerotable;
                    for (zerotable = {
                        0: 16,
                        32768: 15,
                        49152: 14,
                        57344: 13,
                        61440: 12,
                        63488: 11,
                        64512: 10,
                        65024: 9,
                        65280: 8,
                        65408: 7,
                        65472: 6,
                        65504: 5,
                        65520: 4,
                        65528: 3,
                        65532: 2,
                        65534: 1,
                        65535: 0
                    }, cidr = 0, stop = !1, i = k = 7; k >= 0; i = k += -1) {
                        if (!((part = this.parts[i]) in zerotable)) return null;
                        if (zeros = zerotable[part], stop && 0 !== zeros) return null;
                        16 !== zeros && (stop = !0), cidr += zeros;
                    }
                    return 128 - cidr;
                }, IPv6;
            })(), ipv6Part = "(?:[0-9a-f]+::?)+", ipv6Regexes = {
                zoneIndex: new RegExp("%[0-9a-z]{1,}", "i"),
                native: new RegExp("^(::)?(" + ipv6Part + ")?([0-9a-f]+)?(::)?(%[0-9a-z]{1,})?$", "i"),
                transitional: new RegExp("^((?:" + ipv6Part + ")|(?:::)(?:" + ipv6Part + ")?)" + ipv4Part + "\\." + ipv4Part + "\\." + ipv4Part + "\\." + ipv4Part + "(%[0-9a-z]{1,})?$", "i")
            }, expandIPv6 = function(string, parts) {
                var colonCount, lastColon, part, replacement, replacementCount, zoneId;
                if (string.indexOf("::") !== string.lastIndexOf("::")) return null;
                for ((zoneId = (string.match(ipv6Regexes.zoneIndex) || [])[0]) && (zoneId = zoneId.substring(1), 
                string = string.replace(/%.+$/, "")), colonCount = 0, lastColon = -1; (lastColon = string.indexOf(":", lastColon + 1)) >= 0; ) colonCount++;
                if ("::" === string.substr(0, 2) && colonCount--, "::" === string.substr(-2, 2) && colonCount--, 
                colonCount > parts) return null;
                for (replacementCount = parts - colonCount, replacement = ":"; replacementCount--; ) replacement += "0:";
                return ":" === (string = string.replace("::", replacement))[0] && (string = string.slice(1)), 
                ":" === string[string.length - 1] && (string = string.slice(0, -1)), {
                    parts: parts = (function() {
                        var k, len, ref, results;
                        for (results = [], k = 0, len = (ref = string.split(":")).length; k < len; k++) part = ref[k], 
                        results.push(parseInt(part, 16));
                        return results;
                    })(),
                    zoneId: zoneId
                };
            }, ipaddr.IPv6.parser = function(string) {
                var addr, k, len, match, octet, octets, zoneId;
                if (ipv6Regexes.native.test(string)) return expandIPv6(string, 8);
                if ((match = string.match(ipv6Regexes.transitional)) && (zoneId = match[6] || "", 
                (addr = expandIPv6(match[1].slice(0, -1) + zoneId, 6)).parts)) {
                    for (k = 0, len = (octets = [ parseInt(match[2]), parseInt(match[3]), parseInt(match[4]), parseInt(match[5]) ]).length; k < len; k++) if (!(0 <= (octet = octets[k]) && octet <= 255)) return null;
                    return addr.parts.push(octets[0] << 8 | octets[1]), addr.parts.push(octets[2] << 8 | octets[3]), 
                    {
                        parts: addr.parts,
                        zoneId: addr.zoneId
                    };
                }
                return null;
            }, ipaddr.IPv4.isIPv4 = ipaddr.IPv6.isIPv6 = function(string) {
                return null !== this.parser(string);
            }, ipaddr.IPv4.isValid = function(string) {
                try {
                    return new this(this.parser(string)), !0;
                } catch (error1) {
                    return !1;
                }
            }, ipaddr.IPv4.isValidFourPartDecimal = function(string) {
                return !(!ipaddr.IPv4.isValid(string) || !string.match(/^(0|[1-9]\d*)(\.(0|[1-9]\d*)){3}$/));
            }, ipaddr.IPv6.isValid = function(string) {
                var addr;
                if ("string" == typeof string && -1 === string.indexOf(":")) return !1;
                try {
                    return new this((addr = this.parser(string)).parts, addr.zoneId), !0;
                } catch (error1) {
                    return !1;
                }
            }, ipaddr.IPv4.parse = function(string) {
                var parts;
                if (null === (parts = this.parser(string))) throw new Error("ipaddr: string is not formatted like ip address");
                return new this(parts);
            }, ipaddr.IPv6.parse = function(string) {
                var addr;
                if (null === (addr = this.parser(string)).parts) throw new Error("ipaddr: string is not formatted like ip address");
                return new this(addr.parts, addr.zoneId);
            }, ipaddr.IPv4.parseCIDR = function(string) {
                var maskLength, match, parsed;
                if ((match = string.match(/^(.+)\/(\d+)$/)) && (maskLength = parseInt(match[2])) >= 0 && maskLength <= 32) return parsed = [ this.parse(match[1]), maskLength ], 
                Object.defineProperty(parsed, "toString", {
                    value: function() {
                        return this.join("/");
                    }
                }), parsed;
                throw new Error("ipaddr: string is not formatted like an IPv4 CIDR range");
            }, ipaddr.IPv4.subnetMaskFromPrefixLength = function(prefix) {
                var filledOctetCount, j, octets;
                if ((prefix = parseInt(prefix)) < 0 || prefix > 32) throw new Error("ipaddr: invalid IPv4 prefix length");
                for (octets = [ 0, 0, 0, 0 ], j = 0, filledOctetCount = Math.floor(prefix / 8); j < filledOctetCount; ) octets[j] = 255, 
                j++;
                return filledOctetCount < 4 && (octets[filledOctetCount] = Math.pow(2, prefix % 8) - 1 << 8 - prefix % 8), 
                new this(octets);
            }, ipaddr.IPv4.broadcastAddressFromCIDR = function(string) {
                var cidr, i, ipInterfaceOctets, octets, subnetMaskOctets;
                try {
                    for (ipInterfaceOctets = (cidr = this.parseCIDR(string))[0].toByteArray(), subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray(), 
                    octets = [], i = 0; i < 4; ) octets.push(parseInt(ipInterfaceOctets[i], 10) | 255 ^ parseInt(subnetMaskOctets[i], 10)), 
                    i++;
                    return new this(octets);
                } catch (error1) {
                    throw new Error("ipaddr: the address does not have IPv4 CIDR format");
                }
            }, ipaddr.IPv4.networkAddressFromCIDR = function(string) {
                var cidr, i, ipInterfaceOctets, octets, subnetMaskOctets;
                try {
                    for (ipInterfaceOctets = (cidr = this.parseCIDR(string))[0].toByteArray(), subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray(), 
                    octets = [], i = 0; i < 4; ) octets.push(parseInt(ipInterfaceOctets[i], 10) & parseInt(subnetMaskOctets[i], 10)), 
                    i++;
                    return new this(octets);
                } catch (error1) {
                    throw new Error("ipaddr: the address does not have IPv4 CIDR format");
                }
            }, ipaddr.IPv6.parseCIDR = function(string) {
                var maskLength, match, parsed;
                if ((match = string.match(/^(.+)\/(\d+)$/)) && (maskLength = parseInt(match[2])) >= 0 && maskLength <= 128) return parsed = [ this.parse(match[1]), maskLength ], 
                Object.defineProperty(parsed, "toString", {
                    value: function() {
                        return this.join("/");
                    }
                }), parsed;
                throw new Error("ipaddr: string is not formatted like an IPv6 CIDR range");
            }, ipaddr.isValid = function(string) {
                return ipaddr.IPv6.isValid(string) || ipaddr.IPv4.isValid(string);
            }, ipaddr.parse = function(string) {
                if (ipaddr.IPv6.isValid(string)) return ipaddr.IPv6.parse(string);
                if (ipaddr.IPv4.isValid(string)) return ipaddr.IPv4.parse(string);
                throw new Error("ipaddr: the address has neither IPv6 nor IPv4 format");
            }, ipaddr.parseCIDR = function(string) {
                try {
                    return ipaddr.IPv6.parseCIDR(string);
                } catch (error1) {
                    try {
                        return ipaddr.IPv4.parseCIDR(string);
                    } catch (error1) {
                        throw new Error("ipaddr: the address has neither IPv6 nor IPv4 CIDR format");
                    }
                }
            }, ipaddr.fromByteArray = function(bytes) {
                var length;
                if (4 === (length = bytes.length)) return new ipaddr.IPv4(bytes);
                if (16 === length) return new ipaddr.IPv6(bytes);
                throw new Error("ipaddr: the binary input is neither an IPv6 nor IPv4 address");
            }, ipaddr.process = function(string) {
                var addr;
                return "ipv6" === (addr = this.parse(string)).kind() && addr.isIPv4MappedAddress() ? addr.toIPv4Address() : addr;
            };
        }).call(this);
    }).call(this, __webpack_require__(62)(module));
}
