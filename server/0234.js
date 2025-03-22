function(module, exports, __webpack_require__) {
    module.exports = {
        read: function(buf, options) {
            return pem.read(buf, options, "pkcs1");
        },
        readPkcs1: function(alg, type, der) {
            switch (alg) {
              case "RSA":
                if ("public" === type) return (function(der) {
                    var n = readMPInt(der, "modulus"), e = readMPInt(der, "exponent");
                    return new Key({
                        type: "rsa",
                        parts: [ {
                            name: "e",
                            data: e
                        }, {
                            name: "n",
                            data: n
                        } ]
                    });
                })(der);
                if ("private" === type) return (function(der) {
                    var version = readMPInt(der, "version");
                    assert.strictEqual(version[0], 0);
                    var n = readMPInt(der, "modulus"), e = readMPInt(der, "public exponent"), d = readMPInt(der, "private exponent"), p = readMPInt(der, "prime1"), q = readMPInt(der, "prime2"), dmodp = readMPInt(der, "exponent1"), dmodq = readMPInt(der, "exponent2"), iqmp = readMPInt(der, "iqmp");
                    return new PrivateKey({
                        type: "rsa",
                        parts: [ {
                            name: "n",
                            data: n
                        }, {
                            name: "e",
                            data: e
                        }, {
                            name: "d",
                            data: d
                        }, {
                            name: "iqmp",
                            data: iqmp
                        }, {
                            name: "p",
                            data: p
                        }, {
                            name: "q",
                            data: q
                        }, {
                            name: "dmodp",
                            data: dmodp
                        }, {
                            name: "dmodq",
                            data: dmodq
                        } ]
                    });
                })(der);
                throw new Error("Unknown key type: " + type);

              case "DSA":
                if ("public" === type) return (function(der) {
                    var y = readMPInt(der, "y"), p = readMPInt(der, "p"), q = readMPInt(der, "q"), g = readMPInt(der, "g");
                    return new Key({
                        type: "dsa",
                        parts: [ {
                            name: "y",
                            data: y
                        }, {
                            name: "p",
                            data: p
                        }, {
                            name: "q",
                            data: q
                        }, {
                            name: "g",
                            data: g
                        } ]
                    });
                })(der);
                if ("private" === type) return (function(der) {
                    var version = readMPInt(der, "version");
                    assert.strictEqual(version.readUInt8(0), 0);
                    var p = readMPInt(der, "p"), q = readMPInt(der, "q"), g = readMPInt(der, "g"), y = readMPInt(der, "y"), x = readMPInt(der, "x");
                    return new PrivateKey({
                        type: "dsa",
                        parts: [ {
                            name: "p",
                            data: p
                        }, {
                            name: "q",
                            data: q
                        }, {
                            name: "g",
                            data: g
                        }, {
                            name: "y",
                            data: y
                        }, {
                            name: "x",
                            data: x
                        } ]
                    });
                })(der);
                throw new Error("Unknown key type: " + type);

              case "EC":
              case "ECDSA":
                if ("private" === type) return (function(der) {
                    var version = readMPInt(der, "version");
                    assert.strictEqual(version.readUInt8(0), 1);
                    var d = der.readString(asn1.Ber.OctetString, !0);
                    der.readSequence(160);
                    var curve = readECDSACurve(der);
                    assert.string(curve, "a known elliptic curve"), der.readSequence(161);
                    var Q = der.readString(asn1.Ber.BitString, !0);
                    Q = utils.ecNormalize(Q);
                    var key = {
                        type: "ecdsa",
                        parts: [ {
                            name: "curve",
                            data: Buffer.from(curve)
                        }, {
                            name: "Q",
                            data: Q
                        }, {
                            name: "d",
                            data: d
                        } ]
                    };
                    return new PrivateKey(key);
                })(der);
                if ("public" === type) return (function(der) {
                    der.readSequence();
                    var oid = der.readOID();
                    assert.strictEqual(oid, "1.2.840.10045.2.1", "must be ecPublicKey");
                    for (var curve, curveOid = der.readOID(), curves = Object.keys(algs.curves), j = 0; j < curves.length; ++j) {
                        var c = curves[j];
                        if (algs.curves[c].pkcs8oid === curveOid) {
                            curve = c;
                            break;
                        }
                    }
                    assert.string(curve, "a known ECDSA named curve");
                    var Q = der.readString(asn1.Ber.BitString, !0);
                    Q = utils.ecNormalize(Q);
                    var key = {
                        type: "ecdsa",
                        parts: [ {
                            name: "curve",
                            data: Buffer.from(curve)
                        }, {
                            name: "Q",
                            data: Q
                        } ]
                    };
                    return new Key(key);
                })(der);
                throw new Error("Unknown key type: " + type);

              case "EDDSA":
              case "EdDSA":
                if ("private" === type) return (function(der) {
                    var version = readMPInt(der, "version");
                    assert.strictEqual(version.readUInt8(0), 1);
                    var k = der.readString(asn1.Ber.OctetString, !0);
                    der.readSequence(160);
                    var oid = der.readOID();
                    assert.strictEqual(oid, "1.3.101.112", "the ed25519 curve identifier"), der.readSequence(161);
                    var A = utils.readBitString(der), key = {
                        type: "ed25519",
                        parts: [ {
                            name: "A",
                            data: utils.zeroPadToLength(A, 32)
                        }, {
                            name: "k",
                            data: k
                        } ]
                    };
                    return new PrivateKey(key);
                })(der);
                throw new Error(type + " keys not supported with EdDSA");

              default:
                throw new Error("Unknown key algo: " + alg);
            }
        },
        write: function(key, options) {
            return pem.write(key, options, "pkcs1");
        },
        writePkcs1: function(der, key) {
            switch (der.startSequence(), key.type) {
              case "rsa":
                PrivateKey.isPrivateKey(key) ? (function(der, key) {
                    var ver = Buffer.from([ 0 ]);
                    der.writeBuffer(ver, asn1.Ber.Integer), der.writeBuffer(key.part.n.data, asn1.Ber.Integer), 
                    der.writeBuffer(key.part.e.data, asn1.Ber.Integer), der.writeBuffer(key.part.d.data, asn1.Ber.Integer), 
                    der.writeBuffer(key.part.p.data, asn1.Ber.Integer), der.writeBuffer(key.part.q.data, asn1.Ber.Integer), 
                    key.part.dmodp && key.part.dmodq || utils.addRSAMissing(key), der.writeBuffer(key.part.dmodp.data, asn1.Ber.Integer), 
                    der.writeBuffer(key.part.dmodq.data, asn1.Ber.Integer), der.writeBuffer(key.part.iqmp.data, asn1.Ber.Integer);
                })(der, key) : (function(der, key) {
                    der.writeBuffer(key.part.n.data, asn1.Ber.Integer), der.writeBuffer(key.part.e.data, asn1.Ber.Integer);
                })(der, key);
                break;

              case "dsa":
                PrivateKey.isPrivateKey(key) ? (function(der, key) {
                    var ver = Buffer.from([ 0 ]);
                    der.writeBuffer(ver, asn1.Ber.Integer), der.writeBuffer(key.part.p.data, asn1.Ber.Integer), 
                    der.writeBuffer(key.part.q.data, asn1.Ber.Integer), der.writeBuffer(key.part.g.data, asn1.Ber.Integer), 
                    der.writeBuffer(key.part.y.data, asn1.Ber.Integer), der.writeBuffer(key.part.x.data, asn1.Ber.Integer);
                })(der, key) : (function(der, key) {
                    der.writeBuffer(key.part.y.data, asn1.Ber.Integer), der.writeBuffer(key.part.p.data, asn1.Ber.Integer), 
                    der.writeBuffer(key.part.q.data, asn1.Ber.Integer), der.writeBuffer(key.part.g.data, asn1.Ber.Integer);
                })(der, key);
                break;

              case "ecdsa":
                PrivateKey.isPrivateKey(key) ? (function(der, key) {
                    var ver = Buffer.from([ 1 ]);
                    der.writeBuffer(ver, asn1.Ber.Integer), der.writeBuffer(key.part.d.data, asn1.Ber.OctetString), 
                    der.startSequence(160);
                    var curve = key.part.curve.data.toString(), curveOid = algs.curves[curve].pkcs8oid;
                    assert.string(curveOid, "a known ECDSA named curve"), der.writeOID(curveOid), der.endSequence(), 
                    der.startSequence(161);
                    var Q = utils.ecNormalize(key.part.Q.data, !0);
                    der.writeBuffer(Q, asn1.Ber.BitString), der.endSequence();
                })(der, key) : (function(der, key) {
                    der.startSequence(), der.writeOID("1.2.840.10045.2.1");
                    var curve = key.part.curve.data.toString(), curveOid = algs.curves[curve].pkcs8oid;
                    assert.string(curveOid, "a known ECDSA named curve"), der.writeOID(curveOid), der.endSequence();
                    var Q = utils.ecNormalize(key.part.Q.data, !0);
                    der.writeBuffer(Q, asn1.Ber.BitString);
                })(der, key);
                break;

              case "ed25519":
                PrivateKey.isPrivateKey(key) ? (function(der, key) {
                    var ver = Buffer.from([ 1 ]);
                    der.writeBuffer(ver, asn1.Ber.Integer), der.writeBuffer(key.part.k.data, asn1.Ber.OctetString), 
                    der.startSequence(160), der.writeOID("1.3.101.112"), der.endSequence(), der.startSequence(161), 
                    utils.writeBitString(der, key.part.A.data), der.endSequence();
                })(der, key) : (function(der, key) {
                    throw new Error("Public keys are not supported for EdDSA PKCS#1");
                })();
                break;

              default:
                throw new Error("Unknown key algo: " + key.type);
            }
            der.endSequence();
        }
    };
    var assert = __webpack_require__(15), asn1 = __webpack_require__(49), Buffer = __webpack_require__(14).Buffer, algs = __webpack_require__(30), utils = __webpack_require__(26), Key = __webpack_require__(25), PrivateKey = __webpack_require__(27), pem = __webpack_require__(56), readECDSACurve = __webpack_require__(101).readECDSACurve;
    function readMPInt(der, nm) {
        return assert.strictEqual(der.peek(), asn1.Ber.Integer, nm + " is not an Integer"), 
        utils.mpNormalize(der.readString(asn1.Ber.Integer, !0));
    }
}
