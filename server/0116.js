function(module, exports, __webpack_require__) {
    var ip = exports, {Buffer: Buffer} = __webpack_require__(10), os = __webpack_require__(21);
    ip.toBuffer = function(ip, buff, offset) {
        var result;
        if (offset = ~~offset, this.isV4Format(ip)) result = buff || new Buffer(offset + 4), 
        ip.split(/\./g).map((byte => {
            result[offset++] = 255 & parseInt(byte, 10);
        })); else if (this.isV6Format(ip)) {
            var i, sections = ip.split(":", 8);
            for (i = 0; i < sections.length; i++) {
                var v4Buffer;
                this.isV4Format(sections[i]) && (v4Buffer = this.toBuffer(sections[i]), sections[i] = v4Buffer.slice(0, 2).toString("hex")), 
                v4Buffer && ++i < 8 && sections.splice(i, 0, v4Buffer.slice(2, 4).toString("hex"));
            }
            if ("" === sections[0]) for (;sections.length < 8; ) sections.unshift("0"); else if ("" === sections[sections.length - 1]) for (;sections.length < 8; ) sections.push("0"); else if (sections.length < 8) {
                for (i = 0; i < sections.length && "" !== sections[i]; i++) ;
                var argv = [ i, 1 ];
                for (i = 9 - sections.length; i > 0; i--) argv.push("0");
                sections.splice.apply(sections, argv);
            }
            for (result = buff || new Buffer(offset + 16), i = 0; i < sections.length; i++) {
                var word = parseInt(sections[i], 16);
                result[offset++] = word >> 8 & 255, result[offset++] = 255 & word;
            }
        }
        if (!result) throw Error(`Invalid ip address: ${ip}`);
        return result;
    }, ip.toString = function(buff, offset, length) {
        offset = ~~offset;
        var i, result = [];
        if (4 === (length = length || buff.length - offset)) {
            for (i = 0; i < length; i++) result.push(buff[offset + i]);
            result = result.join(".");
        } else if (16 === length) {
            for (i = 0; i < length; i += 2) result.push(buff.readUInt16BE(offset + i).toString(16));
            result = (result = (result = result.join(":")).replace(/(^|:)0(:0)*:0(:|$)/, "$1::$3")).replace(/:{3,4}/, "::");
        }
        return result;
    };
    var ipv4Regex = /^(\d{1,3}\.){3,3}\d{1,3}$/, ipv6Regex = /^(::)?(((\d{1,3}\.){3}(\d{1,3}){1})?([0-9a-f]){0,4}:{0,2}){1,8}(::)?$/i;
    function _normalizeFamily(family) {
        return 4 === family ? "ipv4" : 6 === family ? "ipv6" : family ? family.toLowerCase() : "ipv4";
    }
    ip.isV4Format = function(ip) {
        return ipv4Regex.test(ip);
    }, ip.isV6Format = function(ip) {
        return ipv6Regex.test(ip);
    }, ip.fromPrefixLen = function(prefixlen, family) {
        var len = 4;
        "ipv6" === (family = prefixlen > 32 ? "ipv6" : _normalizeFamily(family)) && (len = 16);
        for (var buff = new Buffer(len), i = 0, n = buff.length; i < n; ++i) {
            var bits = 8;
            prefixlen < 8 && (bits = prefixlen), prefixlen -= bits, buff[i] = 255 & ~(255 >> bits);
        }
        return ip.toString(buff);
    }, ip.mask = function(addr, mask) {
        addr = ip.toBuffer(addr), mask = ip.toBuffer(mask);
        var i, result = new Buffer(Math.max(addr.length, mask.length));
        if (addr.length === mask.length) for (i = 0; i < addr.length; i++) result[i] = addr[i] & mask[i]; else if (4 === mask.length) for (i = 0; i < mask.length; i++) result[i] = addr[addr.length - 4 + i] & mask[i]; else {
            for (i = 0; i < result.length - 6; i++) result[i] = 0;
            for (result[10] = 255, result[11] = 255, i = 0; i < addr.length; i++) result[i + 12] = addr[i] & mask[i + 12];
            i += 12;
        }
        for (;i < result.length; i++) result[i] = 0;
        return ip.toString(result);
    }, ip.cidr = function(cidrString) {
        var cidrParts = cidrString.split("/"), addr = cidrParts[0];
        if (2 !== cidrParts.length) throw new Error(`invalid CIDR subnet: ${addr}`);
        var mask = ip.fromPrefixLen(parseInt(cidrParts[1], 10));
        return ip.mask(addr, mask);
    }, ip.subnet = function(addr, mask) {
        for (var networkAddress = ip.toLong(ip.mask(addr, mask)), maskBuffer = ip.toBuffer(mask), maskLength = 0, i = 0; i < maskBuffer.length; i++) if (255 === maskBuffer[i]) maskLength += 8; else for (var octet = 255 & maskBuffer[i]; octet; ) octet = octet << 1 & 255, 
        maskLength++;
        var numberOfAddresses = Math.pow(2, 32 - maskLength);
        return {
            networkAddress: ip.fromLong(networkAddress),
            firstAddress: numberOfAddresses <= 2 ? ip.fromLong(networkAddress) : ip.fromLong(networkAddress + 1),
            lastAddress: numberOfAddresses <= 2 ? ip.fromLong(networkAddress + numberOfAddresses - 1) : ip.fromLong(networkAddress + numberOfAddresses - 2),
            broadcastAddress: ip.fromLong(networkAddress + numberOfAddresses - 1),
            subnetMask: mask,
            subnetMaskLength: maskLength,
            numHosts: numberOfAddresses <= 2 ? numberOfAddresses : numberOfAddresses - 2,
            length: numberOfAddresses,
            contains: other => networkAddress === ip.toLong(ip.mask(other, mask))
        };
    }, ip.cidrSubnet = function(cidrString) {
        var cidrParts = cidrString.split("/"), addr = cidrParts[0];
        if (2 !== cidrParts.length) throw new Error(`invalid CIDR subnet: ${addr}`);
        var mask = ip.fromPrefixLen(parseInt(cidrParts[1], 10));
        return ip.subnet(addr, mask);
    }, ip.not = function(addr) {
        for (var buff = ip.toBuffer(addr), i = 0; i < buff.length; i++) buff[i] = 255 ^ buff[i];
        return ip.toString(buff);
    }, ip.or = function(a, b) {
        var i;
        if (a = ip.toBuffer(a), b = ip.toBuffer(b), a.length === b.length) {
            for (i = 0; i < a.length; ++i) a[i] |= b[i];
            return ip.toString(a);
        }
        var buff = a, other = b;
        b.length > a.length && (buff = b, other = a);
        var offset = buff.length - other.length;
        for (i = offset; i < buff.length; ++i) buff[i] |= other[i - offset];
        return ip.toString(buff);
    }, ip.isEqual = function(a, b) {
        var i;
        if (a = ip.toBuffer(a), b = ip.toBuffer(b), a.length === b.length) {
            for (i = 0; i < a.length; i++) if (a[i] !== b[i]) return !1;
            return !0;
        }
        if (4 === b.length) {
            var t = b;
            b = a, a = t;
        }
        for (i = 0; i < 10; i++) if (0 !== b[i]) return !1;
        var word = b.readUInt16BE(10);
        if (0 !== word && 65535 !== word) return !1;
        for (i = 0; i < 4; i++) if (a[i] !== b[i + 12]) return !1;
        return !0;
    }, ip.isPrivate = function(addr) {
        return /^(::f{4}:)?10\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) || /^(::f{4}:)?192\.168\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) || /^(::f{4}:)?172\.(1[6-9]|2\d|30|31)\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) || /^(::f{4}:)?127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) || /^(::f{4}:)?169\.254\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) || /^f[cd][0-9a-f]{2}:/i.test(addr) || /^fe80:/i.test(addr) || /^::1$/.test(addr) || /^::$/.test(addr);
    }, ip.isPublic = function(addr) {
        return !ip.isPrivate(addr);
    }, ip.isLoopback = function(addr) {
        return /^(::f{4}:)?127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})/.test(addr) || /^fe80::1$/.test(addr) || /^::1$/.test(addr) || /^::$/.test(addr);
    }, ip.loopback = function(family) {
        if ("ipv4" !== (family = _normalizeFamily(family)) && "ipv6" !== family) throw new Error("family must be ipv4 or ipv6");
        return "ipv4" === family ? "127.0.0.1" : "fe80::1";
    }, ip.address = function(name, family) {
        var interfaces = os.networkInterfaces();
        if (family = _normalizeFamily(family), name && "private" !== name && "public" !== name) {
            var res = interfaces[name].filter((details => _normalizeFamily(details.family) === family));
            if (0 === res.length) return;
            return res[0].address;
        }
        var all = Object.keys(interfaces).map((nic => {
            var addresses = interfaces[nic].filter((details => (details.family = _normalizeFamily(details.family), 
            details.family === family && !ip.isLoopback(details.address) && (!name || ("public" === name ? ip.isPrivate(details.address) : ip.isPublic(details.address))))));
            return addresses.length ? addresses[0].address : void 0;
        })).filter(Boolean);
        return all.length ? all[0] : ip.loopback(family);
    }, ip.toLong = function(ip) {
        var ipl = 0;
        return ip.split(".").forEach((octet => {
            ipl <<= 8, ipl += parseInt(octet);
        })), ipl >>> 0;
    }, ip.fromLong = function(ipl) {
        return `${ipl >>> 24}.${ipl >> 16 & 255}.${ipl >> 8 & 255}.${255 & ipl}`;
    };
}
