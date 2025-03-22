function(module, exports, __webpack_require__) {
    const addrToIPPort = __webpack_require__(614), ipaddr = __webpack_require__(166);
    module.exports = addrs => ("string" == typeof addrs && (addrs = [ addrs ]), Buffer.concat(addrs.map((addr => {
        const s = addrToIPPort(addr);
        if (2 !== s.length) throw new Error("invalid address format, expecting: 10.10.10.5:128");
        const ip = ipaddr.parse(s[0]), ipBuf = Buffer.from(ip.toByteArray()), port = s[1], portBuf = Buffer.allocUnsafe(2);
        return portBuf.writeUInt16BE(port, 0), Buffer.concat([ ipBuf, portBuf ]);
    })))), module.exports.multi = module.exports, module.exports.multi6 = module.exports;
}
