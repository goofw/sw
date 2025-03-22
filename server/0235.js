function(module, exports, __webpack_require__) {
    module.exports = {
        read: function(buf, options) {
            "string" != typeof buf && (assert.buffer(buf, "buf"), buf = buf.toString("ascii"));
            var lines = buf.split("\n");
            if (lines[0].match(/^Private-key-format\: v1/)) {
                var algElems = lines[1].split(" "), algoNum = parseInt(algElems[1], 10), algoName = algElems[2];
                if (!supportedAlgosById[algoNum]) throw new Error("Unsupported algorithm: " + algoName);
                return (function(alg, elements) {
                    if (supportedAlgosById[alg].match(/^RSA-/)) return (function(elements) {
                        var rsaParams = {};
                        elements.forEach((function(element) {
                            "Modulus:" === element.split(" ")[0] ? rsaParams.n = elementToBuf(element) : "PublicExponent:" === element.split(" ")[0] ? rsaParams.e = elementToBuf(element) : "PrivateExponent:" === element.split(" ")[0] ? rsaParams.d = elementToBuf(element) : "Prime1:" === element.split(" ")[0] ? rsaParams.p = elementToBuf(element) : "Prime2:" === element.split(" ")[0] ? rsaParams.q = elementToBuf(element) : "Exponent1:" === element.split(" ")[0] ? rsaParams.dmodp = elementToBuf(element) : "Exponent2:" === element.split(" ")[0] ? rsaParams.dmodq = elementToBuf(element) : "Coefficient:" === element.split(" ")[0] && (rsaParams.iqmp = elementToBuf(element));
                        }));
                        var key = {
                            type: "rsa",
                            parts: [ {
                                name: "e",
                                data: utils.mpNormalize(rsaParams.e)
                            }, {
                                name: "n",
                                data: utils.mpNormalize(rsaParams.n)
                            }, {
                                name: "d",
                                data: utils.mpNormalize(rsaParams.d)
                            }, {
                                name: "p",
                                data: utils.mpNormalize(rsaParams.p)
                            }, {
                                name: "q",
                                data: utils.mpNormalize(rsaParams.q)
                            }, {
                                name: "dmodp",
                                data: utils.mpNormalize(rsaParams.dmodp)
                            }, {
                                name: "dmodq",
                                data: utils.mpNormalize(rsaParams.dmodq)
                            }, {
                                name: "iqmp",
                                data: utils.mpNormalize(rsaParams.iqmp)
                            } ]
                        };
                        return new PrivateKey(key);
                    })(elements);
                    if ("ECDSA-P384-SHA384" === supportedAlgosById[alg] || "ECDSA-P256-SHA256" === supportedAlgosById[alg]) {
                        var d = Buffer.from(elements[0].split(" ")[1], "base64"), curve = "nistp384", size = 384;
                        "ECDSA-P256-SHA256" === supportedAlgosById[alg] && (curve = "nistp256", size = 256);
                        var Q = utils.publicFromPrivateECDSA(curve, d).part.Q.data, ecdsaKey = {
                            type: "ecdsa",
                            curve: curve,
                            size: size,
                            parts: [ {
                                name: "curve",
                                data: Buffer.from(curve)
                            }, {
                                name: "d",
                                data: d
                            }, {
                                name: "Q",
                                data: Q
                            } ]
                        };
                        return new PrivateKey(ecdsaKey);
                    }
                    throw new Error("Unsupported algorithm: " + supportedAlgosById[alg]);
                })(algoNum, lines.slice(2));
            }
            for (var line = 0; lines[line].match(/^\;/); ) line++;
            if ((lines[line].match(/\. IN KEY /) || lines[line].match(/\. IN DNSKEY /)) && 0 === lines[line + 1].length) return (function(keyString) {
                var elems = keyString.split(" "), algorithm = parseInt(elems[5], 10);
                if (!supportedAlgosById[algorithm]) throw new Error("Unsupported algorithm: " + algorithm);
                var base64key = elems.slice(6, elems.length).join(), keyBuffer = Buffer.from(base64key, "base64");
                if (supportedAlgosById[algorithm].match(/^RSA-/)) {
                    var publicExponentLen = keyBuffer.readUInt8(0);
                    if (3 != publicExponentLen && 1 != publicExponentLen) throw new Error("Cannot parse dnssec key: unsupported exponent length");
                    var publicExponent = keyBuffer.slice(1, publicExponentLen + 1);
                    publicExponent = utils.mpNormalize(publicExponent);
                    var modulus = keyBuffer.slice(1 + publicExponentLen);
                    modulus = utils.mpNormalize(modulus);
                    var rsaKey = {
                        type: "rsa",
                        parts: []
                    };
                    return rsaKey.parts.push({
                        name: "e",
                        data: publicExponent
                    }), rsaKey.parts.push({
                        name: "n",
                        data: modulus
                    }), new Key(rsaKey);
                }
                if ("ECDSA-P384-SHA384" === supportedAlgosById[algorithm] || "ECDSA-P256-SHA256" === supportedAlgosById[algorithm]) {
                    var curve = "nistp384", size = 384;
                    supportedAlgosById[algorithm].match(/^ECDSA-P256-SHA256/) && (curve = "nistp256", 
                    size = 256);
                    var ecdsaKey = {
                        type: "ecdsa",
                        curve: curve,
                        size: size,
                        parts: [ {
                            name: "curve",
                            data: Buffer.from(curve)
                        }, {
                            name: "Q",
                            data: utils.ecNormalize(keyBuffer)
                        } ]
                    };
                    return new Key(ecdsaKey);
                }
                throw new Error("Unsupported algorithm: " + supportedAlgosById[algorithm]);
            })(lines[line]);
            throw new Error("Cannot parse dnssec key");
        },
        write: function(key, options) {
            if (PrivateKey.isPrivateKey(key)) {
                if ("rsa" === key.type) return (function(key, options) {
                    key.part.dmodp && key.part.dmodq || utils.addRSAMissing(key);
                    var out = "";
                    out += "Private-key-format: v1.3\n", out += "Algorithm: " + (function(opts) {
                        if (opts && opts.hashAlgo && "sha1" !== opts.hashAlgo) {
                            if ("sha256" === opts.hashAlgo) return "8 (RSASHA256)";
                            if ("sha512" === opts.hashAlgo) return "10 (RSASHA512)";
                            throw new Error("Unknown or unsupported hash: " + opts.hashAlgo);
                        }
                        return "5 (RSASHA1)";
                    })(options) + "\n", out += "Modulus: " + utils.mpDenormalize(key.part.n.data).toString("base64") + "\n", 
                    out += "PublicExponent: " + utils.mpDenormalize(key.part.e.data).toString("base64") + "\n", 
                    out += "PrivateExponent: " + utils.mpDenormalize(key.part.d.data).toString("base64") + "\n", 
                    out += "Prime1: " + utils.mpDenormalize(key.part.p.data).toString("base64") + "\n", 
                    out += "Prime2: " + utils.mpDenormalize(key.part.q.data).toString("base64") + "\n", 
                    out += "Exponent1: " + utils.mpDenormalize(key.part.dmodp.data).toString("base64") + "\n", 
                    out += "Exponent2: " + utils.mpDenormalize(key.part.dmodq.data).toString("base64") + "\n", 
                    out += "Coefficient: " + utils.mpDenormalize(key.part.iqmp.data).toString("base64") + "\n";
                    var timestamp = new Date;
                    return out += "Created: " + dnssecTimestamp(timestamp) + "\n", out += "Publish: " + dnssecTimestamp(timestamp) + "\n", 
                    out += "Activate: " + dnssecTimestamp(timestamp) + "\n", Buffer.from(out, "ascii");
                })(key, options);
                if ("ecdsa" === key.type) return (function(key, options) {
                    var out = "";
                    if (out += "Private-key-format: v1.3\n", "nistp256" === key.curve) out += "Algorithm: 13 (ECDSAP256SHA256)\n"; else {
                        if ("nistp384" !== key.curve) throw new Error("Unsupported curve");
                        out += "Algorithm: 14 (ECDSAP384SHA384)\n";
                    }
                    out += "PrivateKey: " + key.part.d.data.toString("base64") + "\n";
                    var timestamp = new Date;
                    return out += "Created: " + dnssecTimestamp(timestamp) + "\n", out += "Publish: " + dnssecTimestamp(timestamp) + "\n", 
                    out += "Activate: " + dnssecTimestamp(timestamp) + "\n", Buffer.from(out, "ascii");
                })(key);
                throw new Error("Unsupported algorithm: " + key.type);
            }
            throw Key.isKey(key) ? new Error('Format "dnssec" only supports writing private keys') : new Error("key is not a Key or PrivateKey");
        }
    };
    var assert = __webpack_require__(15), Buffer = __webpack_require__(14).Buffer, Key = __webpack_require__(25), PrivateKey = __webpack_require__(27), utils = __webpack_require__(26), supportedAlgos = (__webpack_require__(100), 
    __webpack_require__(233), {
        "rsa-sha1": 5,
        "rsa-sha256": 8,
        "rsa-sha512": 10,
        "ecdsa-p256-sha256": 13,
        "ecdsa-p384-sha384": 14
    }), supportedAlgosById = {};
    function elementToBuf(e) {
        return Buffer.from(e.split(" ")[1], "base64");
    }
    function dnssecTimestamp(date) {
        var timestampStr = date.getFullYear() + "" + (date.getMonth() + 1) + date.getUTCDate();
        return (timestampStr += "" + date.getUTCHours() + date.getUTCMinutes()) + date.getUTCSeconds();
    }
    Object.keys(supportedAlgos).forEach((function(k) {
        supportedAlgosById[supportedAlgos[k]] = k.toUpperCase();
    }));
}
