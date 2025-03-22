function(module, exports, __webpack_require__) {
    module.exports = {
        read: function(buf, options) {
            return pem.read(buf, options, "pkcs8");
        },
        readPkcs8: function(alg, type, der) {
            der.peek() === asn1.Ber.Integer && (assert.strictEqual(type, "private", "unexpected Integer at start of public key"), 
            der.readString(asn1.Ber.Integer, !0)), der.readSequence();
            var next = der.offset + der.length, oid = der.readOID();
            switch (oid) {
              case "1.2.840.113549.1.1.1":
                return der._offset = next, "public" === type ? (function(der) {
                    der.readSequence(asn1.Ber.BitString), der.readByte(), der.readSequence();
                    var n = readMPInt(der, "modulus"), e = readMPInt(der, "exponent"), key = {
                        type: "rsa",
                        source: der.originalInput,
                        parts: [ {
                            name: "e",
                            data: e
                        }, {
                            name: "n",
                            data: n
                        } ]
                    };
                    return new Key(key);
                })(der) : (function(der) {
                    der.readSequence(asn1.Ber.OctetString), der.readSequence();
                    var ver = readMPInt(der, "version");
                    assert.equal(ver[0], 0, "unknown RSA private key version");
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

              case "1.2.840.10040.4.1":
                return "public" === type ? (function(der) {
                    der.readSequence();
                    var p = readMPInt(der, "p"), q = readMPInt(der, "q"), g = readMPInt(der, "g");
                    der.readSequence(asn1.Ber.BitString), der.readByte();
                    var y = readMPInt(der, "y");
                    return new Key({
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
                        } ]
                    });
                })(der) : (function(der) {
                    der.readSequence();
                    var p = readMPInt(der, "p"), q = readMPInt(der, "q"), g = readMPInt(der, "g");
                    der.readSequence(asn1.Ber.OctetString);
                    var x = readMPInt(der, "x"), y = utils.calculateDSAPublic(g, p, x);
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

              case "1.2.840.10045.2.1":
                return "public" === type ? (function(der) {
                    var curveName = readECDSACurve(der);
                    assert.string(curveName, "a known elliptic curve");
                    var Q = der.readString(asn1.Ber.BitString, !0);
                    Q = utils.ecNormalize(Q);
                    var key = {
                        type: "ecdsa",
                        parts: [ {
                            name: "curve",
                            data: Buffer.from(curveName)
                        }, {
                            name: "Q",
                            data: Q
                        } ]
                    };
                    return new Key(key);
                })(der) : (function(der) {
                    var curveName = readECDSACurve(der);
                    assert.string(curveName, "a known elliptic curve"), der.readSequence(asn1.Ber.OctetString), 
                    der.readSequence();
                    var version = readMPInt(der, "version");
                    assert.equal(version[0], 1, "unknown version of ECDSA key");
                    var Q, d = der.readString(asn1.Ber.OctetString, !0);
                    160 == der.peek() && (der.readSequence(160), der._offset += der.length), 161 == der.peek() && (der.readSequence(161), 
                    Q = der.readString(asn1.Ber.BitString, !0), Q = utils.ecNormalize(Q)), void 0 === Q && (Q = utils.publicFromPrivateECDSA(curveName, d).part.Q.data);
                    var key = {
                        type: "ecdsa",
                        parts: [ {
                            name: "curve",
                            data: Buffer.from(curveName)
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

              case "1.3.101.112":
                return "public" === type ? (function(der) {
                    0 === der.peek() && der.readByte();
                    var A = utils.readBitString(der), key = {
                        type: "ed25519",
                        parts: [ {
                            name: "A",
                            data: utils.zeroPadToLength(A, 32)
                        } ]
                    };
                    return new Key(key);
                })(der) : (function(der) {
                    0 === der.peek() && der.readByte(), der.readSequence(asn1.Ber.OctetString);
                    var A, k = der.readString(asn1.Ber.OctetString, !0);
                    k = utils.zeroPadToLength(k, 32), der.peek() === asn1.Ber.BitString ? (A = utils.readBitString(der), 
                    A = utils.zeroPadToLength(A, 32)) : A = utils.calculateED25519Public(k);
                    var key = {
                        type: "ed25519",
                        parts: [ {
                            name: "A",
                            data: utils.zeroPadToLength(A, 32)
                        }, {
                            name: "k",
                            data: utils.zeroPadToLength(k, 32)
                        } ]
                    };
                    return new PrivateKey(key);
                })(der);

              case "1.3.101.110":
                return "public" === type ? (function(der) {
                    var A = utils.readBitString(der), key = {
                        type: "curve25519",
                        parts: [ {
                            name: "A",
                            data: utils.zeroPadToLength(A, 32)
                        } ]
                    };
                    return new Key(key);
                })(der) : (function(der) {
                    0 === der.peek() && der.readByte(), der.readSequence(asn1.Ber.OctetString);
                    var k = der.readString(asn1.Ber.OctetString, !0);
                    k = utils.zeroPadToLength(k, 32);
                    var A = utils.calculateX25519Public(k), key = {
                        type: "curve25519",
                        parts: [ {
                            name: "A",
                            data: utils.zeroPadToLength(A, 32)
                        }, {
                            name: "k",
                            data: utils.zeroPadToLength(k, 32)
                        } ]
                    };
                    return new PrivateKey(key);
                })(der);

              default:
                throw new Error("Unknown key type OID " + oid);
            }
        },
        write: function(key, options) {
            return pem.write(key, options, "pkcs8");
        },
        writePkcs8: writePkcs8,
        pkcs8ToBuffer: function(key) {
            var der = new asn1.BerWriter;
            return writePkcs8(der, key), der.buffer;
        },
        readECDSACurve: readECDSACurve,
        writeECDSACurve: writeECDSACurve
    };
    var assert = __webpack_require__(15), asn1 = __webpack_require__(49), Buffer = __webpack_require__(14).Buffer, algs = __webpack_require__(30), utils = __webpack_require__(26), Key = __webpack_require__(25), PrivateKey = __webpack_require__(27), pem = __webpack_require__(56);
    function readMPInt(der, nm) {
        return assert.strictEqual(der.peek(), asn1.Ber.Integer, nm + " is not an Integer"), 
        utils.mpNormalize(der.readString(asn1.Ber.Integer, !0));
    }
    function readECDSACurve(der) {
        var curveName, curveNames, j, c, cd;
        if (der.peek() === asn1.Ber.OID) {
            var oid = der.readOID();
            for (curveNames = Object.keys(algs.curves), j = 0; j < curveNames.length; ++j) if (c = curveNames[j], 
            (cd = algs.curves[c]).pkcs8oid === oid) {
                curveName = c;
                break;
            }
        } else {
            der.readSequence();
            var version = der.readString(asn1.Ber.Integer, !0);
            assert.strictEqual(version[0], 1, "ECDSA key not version 1");
            var curve = {};
            der.readSequence();
            var fieldTypeOid = der.readOID();
            assert.strictEqual(fieldTypeOid, "1.2.840.10045.1.1", "ECDSA key is not from a prime-field");
            var p = curve.p = utils.mpNormalize(der.readString(asn1.Ber.Integer, !0));
            curve.size = 8 * p.length - utils.countZeros(p), der.readSequence(), curve.a = utils.mpNormalize(der.readString(asn1.Ber.OctetString, !0)), 
            curve.b = utils.mpNormalize(der.readString(asn1.Ber.OctetString, !0)), der.peek() === asn1.Ber.BitString && (curve.s = der.readString(asn1.Ber.BitString, !0)), 
            curve.G = der.readString(asn1.Ber.OctetString, !0), assert.strictEqual(curve.G[0], 4, "uncompressed G is required"), 
            curve.n = utils.mpNormalize(der.readString(asn1.Ber.Integer, !0)), curve.h = utils.mpNormalize(der.readString(asn1.Ber.Integer, !0)), 
            assert.strictEqual(curve.h[0], 1, "a cofactor=1 curve is required"), curveNames = Object.keys(algs.curves);
            var ks = Object.keys(curve);
            for (j = 0; j < curveNames.length; ++j) {
                c = curveNames[j], cd = algs.curves[c];
                for (var equal = !0, i = 0; i < ks.length; ++i) {
                    var k = ks[i];
                    if (void 0 !== cd[k]) if ("object" == typeof cd[k] && void 0 !== cd[k].equals) {
                        if (!cd[k].equals(curve[k])) {
                            equal = !1;
                            break;
                        }
                    } else if (Buffer.isBuffer(cd[k])) {
                        if (cd[k].toString("binary") !== curve[k].toString("binary")) {
                            equal = !1;
                            break;
                        }
                    } else if (cd[k] !== curve[k]) {
                        equal = !1;
                        break;
                    }
                }
                if (equal) {
                    curveName = c;
                    break;
                }
            }
        }
        return curveName;
    }
    function writePkcs8(der, key) {
        if (der.startSequence(), PrivateKey.isPrivateKey(key)) {
            var sillyInt = Buffer.from([ 0 ]);
            der.writeBuffer(sillyInt, asn1.Ber.Integer);
        }
        switch (der.startSequence(), key.type) {
          case "rsa":
            der.writeOID("1.2.840.113549.1.1.1"), PrivateKey.isPrivateKey(key) ? (function(key, der) {
                der.writeNull(), der.endSequence(), der.startSequence(asn1.Ber.OctetString), der.startSequence();
                var version = Buffer.from([ 0 ]);
                der.writeBuffer(version, asn1.Ber.Integer), der.writeBuffer(key.part.n.data, asn1.Ber.Integer), 
                der.writeBuffer(key.part.e.data, asn1.Ber.Integer), der.writeBuffer(key.part.d.data, asn1.Ber.Integer), 
                der.writeBuffer(key.part.p.data, asn1.Ber.Integer), der.writeBuffer(key.part.q.data, asn1.Ber.Integer), 
                key.part.dmodp && key.part.dmodq || utils.addRSAMissing(key), der.writeBuffer(key.part.dmodp.data, asn1.Ber.Integer), 
                der.writeBuffer(key.part.dmodq.data, asn1.Ber.Integer), der.writeBuffer(key.part.iqmp.data, asn1.Ber.Integer), 
                der.endSequence(), der.endSequence();
            })(key, der) : (function(key, der) {
                der.writeNull(), der.endSequence(), der.startSequence(asn1.Ber.BitString), der.writeByte(0), 
                der.startSequence(), der.writeBuffer(key.part.n.data, asn1.Ber.Integer), der.writeBuffer(key.part.e.data, asn1.Ber.Integer), 
                der.endSequence(), der.endSequence();
            })(key, der);
            break;

          case "dsa":
            der.writeOID("1.2.840.10040.4.1"), PrivateKey.isPrivateKey(key) ? (function(key, der) {
                der.startSequence(), der.writeBuffer(key.part.p.data, asn1.Ber.Integer), der.writeBuffer(key.part.q.data, asn1.Ber.Integer), 
                der.writeBuffer(key.part.g.data, asn1.Ber.Integer), der.endSequence(), der.endSequence(), 
                der.startSequence(asn1.Ber.OctetString), der.writeBuffer(key.part.x.data, asn1.Ber.Integer), 
                der.endSequence();
            })(key, der) : (function(key, der) {
                der.startSequence(), der.writeBuffer(key.part.p.data, asn1.Ber.Integer), der.writeBuffer(key.part.q.data, asn1.Ber.Integer), 
                der.writeBuffer(key.part.g.data, asn1.Ber.Integer), der.endSequence(), der.endSequence(), 
                der.startSequence(asn1.Ber.BitString), der.writeByte(0), der.writeBuffer(key.part.y.data, asn1.Ber.Integer), 
                der.endSequence();
            })(key, der);
            break;

          case "ecdsa":
            der.writeOID("1.2.840.10045.2.1"), PrivateKey.isPrivateKey(key) ? (function(key, der) {
                writeECDSACurve(key, der), der.endSequence(), der.startSequence(asn1.Ber.OctetString), 
                der.startSequence();
                var version = Buffer.from([ 1 ]);
                der.writeBuffer(version, asn1.Ber.Integer), der.writeBuffer(key.part.d.data, asn1.Ber.OctetString), 
                der.startSequence(161);
                var Q = utils.ecNormalize(key.part.Q.data, !0);
                der.writeBuffer(Q, asn1.Ber.BitString), der.endSequence(), der.endSequence(), der.endSequence();
            })(key, der) : (function(key, der) {
                writeECDSACurve(key, der), der.endSequence();
                var Q = utils.ecNormalize(key.part.Q.data, !0);
                der.writeBuffer(Q, asn1.Ber.BitString);
            })(key, der);
            break;

          case "ed25519":
            if (der.writeOID("1.3.101.112"), PrivateKey.isPrivateKey(key)) throw new Error("Ed25519 private keys in pkcs8 format are not supported");
            !(function(key, der) {
                der.endSequence(), utils.writeBitString(der, key.part.A.data);
            })(key, der);
            break;

          default:
            throw new Error("Unsupported key type: " + key.type);
        }
        der.endSequence();
    }
    function writeECDSACurve(key, der) {
        var curve = algs.curves[key.curve];
        if (curve.pkcs8oid) der.writeOID(curve.pkcs8oid); else {
            der.startSequence();
            var version = Buffer.from([ 1 ]);
            der.writeBuffer(version, asn1.Ber.Integer), der.startSequence(), der.writeOID("1.2.840.10045.1.1"), 
            der.writeBuffer(curve.p, asn1.Ber.Integer), der.endSequence(), der.startSequence();
            var a = curve.p;
            0 === a[0] && (a = a.slice(1)), der.writeBuffer(a, asn1.Ber.OctetString), der.writeBuffer(curve.b, asn1.Ber.OctetString), 
            der.writeBuffer(curve.s, asn1.Ber.BitString), der.endSequence(), der.writeBuffer(curve.G, asn1.Ber.OctetString), 
            der.writeBuffer(curve.n, asn1.Ber.Integer);
            var h = curve.h;
            h || (h = Buffer.from([ 1 ])), der.writeBuffer(h, asn1.Ber.Integer), der.endSequence();
        }
    }
}
