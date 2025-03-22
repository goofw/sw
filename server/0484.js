function(module, exports, __webpack_require__) {
    module.exports = {
        read: function(buf, options) {
            "string" == typeof buf && (buf = Buffer.from(buf, "binary")), assert.buffer(buf, "buf");
            var der = new asn1.BerReader(buf);
            if (der.readSequence(), Math.abs(der.length - der.remain) > 1) throw new Error("DER sequence does not contain whole byte stream");
            var tbsStart = der.offset;
            der.readSequence();
            var sigOffset = der.offset + der.length, tbsEnd = sigOffset;
            if (der.peek() === Local(0)) {
                der.readSequence(Local(0));
                var version = der.readInt();
                assert.ok(version <= 3, "only x.509 versions up to v3 supported");
            }
            var cert = {
                signatures: {}
            }, sig = cert.signatures.x509 = {};
            sig.extras = {}, cert.serial = (function(der, nm) {
                return assert.strictEqual(der.peek(), asn1.Ber.Integer, "serial is not an Integer"), 
                utils.mpNormalize(der.readString(asn1.Ber.Integer, !0));
            })(der), der.readSequence();
            var after = der.offset + der.length, certAlgOid = der.readOID();
            if (void 0 === SIGN_ALGS[certAlgOid]) throw new Error("unknown signature algorithm " + certAlgOid);
            if (der._offset = after, cert.issuer = Identity.parseAsn1(der), der.readSequence(), 
            cert.validFrom = readDate(der), cert.validUntil = readDate(der), cert.subjects = [ Identity.parseAsn1(der) ], 
            der.readSequence(), after = der.offset + der.length, cert.subjectKey = pkcs8.readPkcs8(void 0, "public", der), 
            der._offset = after, der.peek() === Local(1) && (der.readSequence(Local(1)), sig.extras.issuerUniqueID = buf.slice(der.offset, der.offset + der.length), 
            der._offset += der.length), der.peek() === Local(2) && (der.readSequence(Local(2)), 
            sig.extras.subjectUniqueID = buf.slice(der.offset, der.offset + der.length), der._offset += der.length), 
            der.peek() === Local(3)) {
                der.readSequence(Local(3));
                var extEnd = der.offset + der.length;
                for (der.readSequence(); der.offset < extEnd; ) readExtension(cert, buf, der);
                assert.strictEqual(der.offset, extEnd);
            }
            assert.strictEqual(der.offset, sigOffset), der.readSequence(), after = der.offset + der.length;
            var sigAlgOid = der.readOID(), sigAlg = SIGN_ALGS[sigAlgOid];
            if (void 0 === sigAlg) throw new Error("unknown signature algorithm " + sigAlgOid);
            der._offset = after;
            var sigData = der.readString(asn1.Ber.BitString, !0);
            0 === sigData[0] && (sigData = sigData.slice(1));
            var algParts = sigAlg.split("-");
            return sig.signature = Signature.parse(sigData, algParts[0], "asn1"), sig.signature.hashAlgorithm = algParts[1], 
            sig.algo = sigAlg, sig.cache = buf.slice(tbsStart, tbsEnd), new Certificate(cert);
        },
        verify: function(cert, key) {
            var sig = cert.signatures.x509;
            assert.object(sig, "x509 signature");
            var algParts = sig.algo.split("-");
            if (algParts[0] !== key.type) return !1;
            var blob = sig.cache;
            if (void 0 === blob) {
                var der = new asn1.BerWriter;
                writeTBSCert(cert, der), blob = der.buffer;
            }
            var verifier = key.createVerify(algParts[1]);
            return verifier.write(blob), verifier.verify(sig.signature);
        },
        sign: function(cert, key) {
            void 0 === cert.signatures.x509 && (cert.signatures.x509 = {});
            var sig = cert.signatures.x509;
            if (sig.algo = key.type + "-" + key.defaultHashAlgorithm(), void 0 === SIGN_ALGS[sig.algo]) return !1;
            var der = new asn1.BerWriter;
            writeTBSCert(cert, der);
            var blob = der.buffer;
            sig.cache = blob;
            var signer = key.createSign();
            return signer.write(blob), cert.signatures.x509.signature = signer.sign(), !0;
        },
        signAsync: function(cert, signer, done) {
            void 0 === cert.signatures.x509 && (cert.signatures.x509 = {});
            var sig = cert.signatures.x509, der = new asn1.BerWriter;
            writeTBSCert(cert, der);
            var blob = der.buffer;
            sig.cache = blob, signer(blob, (function(err, signature) {
                err ? done(err) : (sig.algo = signature.type + "-" + signature.hashAlgorithm, void 0 !== SIGN_ALGS[sig.algo] ? (sig.signature = signature, 
                done()) : done(new Error('Invalid signing algorithm "' + sig.algo + '"')));
            }));
        },
        write: function(cert, options) {
            var sig = cert.signatures.x509;
            assert.object(sig, "x509 signature");
            var der = new asn1.BerWriter;
            der.startSequence(), sig.cache ? (der._ensure(sig.cache.length), sig.cache.copy(der._buf, der._offset), 
            der._offset += sig.cache.length) : writeTBSCert(cert, der), der.startSequence(), 
            der.writeOID(SIGN_ALGS[sig.algo]), sig.algo.match(/^rsa-/) && der.writeNull(), der.endSequence();
            var sigData = sig.signature.toBuffer("asn1"), data = Buffer.alloc(sigData.length + 1);
            return data[0] = 0, sigData.copy(data, 1), der.writeBuffer(data, asn1.Ber.BitString), 
            der.endSequence(), der.buffer;
        }
    };
    var assert = __webpack_require__(15), asn1 = __webpack_require__(49), Buffer = __webpack_require__(14).Buffer, utils = (__webpack_require__(30), 
    __webpack_require__(26)), Identity = (__webpack_require__(25), __webpack_require__(27), 
    __webpack_require__(56), __webpack_require__(103)), Signature = __webpack_require__(48), Certificate = __webpack_require__(102), pkcs8 = __webpack_require__(101);
    function Local(i) {
        return asn1.Ber.Context | asn1.Ber.Constructor | i;
    }
    function Context(i) {
        return asn1.Ber.Context | i;
    }
    var SIGN_ALGS = {
        "rsa-md5": "1.2.840.113549.1.1.4",
        "rsa-sha1": "1.2.840.113549.1.1.5",
        "rsa-sha256": "1.2.840.113549.1.1.11",
        "rsa-sha384": "1.2.840.113549.1.1.12",
        "rsa-sha512": "1.2.840.113549.1.1.13",
        "dsa-sha1": "1.2.840.10040.4.3",
        "dsa-sha256": "2.16.840.1.101.3.4.3.2",
        "ecdsa-sha1": "1.2.840.10045.4.1",
        "ecdsa-sha256": "1.2.840.10045.4.3.2",
        "ecdsa-sha384": "1.2.840.10045.4.3.3",
        "ecdsa-sha512": "1.2.840.10045.4.3.4",
        "ed25519-sha512": "1.3.101.112"
    };
    Object.keys(SIGN_ALGS).forEach((function(k) {
        SIGN_ALGS[SIGN_ALGS[k]] = k;
    })), SIGN_ALGS["1.3.14.3.2.3"] = "rsa-md5", SIGN_ALGS["1.3.14.3.2.29"] = "rsa-sha1";
    function readDate(der) {
        if (der.peek() === asn1.Ber.UTCTime) return (function(t) {
            var m = t.match(UTCTIME_RE);
            assert.ok(m, "timestamps must be in UTC");
            var d = new Date, thisYear = d.getUTCFullYear(), century = 100 * Math.floor(thisYear / 100), year = parseInt(m[1], 10);
            return year += thisYear % 100 < 50 && year >= 60 ? century - 1 : century, d.setUTCFullYear(year, parseInt(m[2], 10) - 1, parseInt(m[3], 10)), 
            d.setUTCHours(parseInt(m[4], 10), parseInt(m[5], 10)), m[6] && m[6].length > 0 && d.setUTCSeconds(parseInt(m[6], 10)), 
            d;
        })(der.readString(asn1.Ber.UTCTime));
        if (der.peek() === asn1.Ber.GeneralizedTime) return (function(t) {
            var m = t.match(GTIME_RE);
            assert.ok(m);
            var d = new Date;
            return d.setUTCFullYear(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10)), 
            d.setUTCHours(parseInt(m[4], 10), parseInt(m[5], 10)), m[6] && m[6].length > 0 && d.setUTCSeconds(parseInt(m[6], 10)), 
            d;
        })(der.readString(asn1.Ber.GeneralizedTime));
        throw new Error("Unsupported date format");
    }
    function writeDate(der, date) {
        var d, s;
        date.getUTCFullYear() >= 2050 || date.getUTCFullYear() < 1950 ? der.writeString((s = "", 
        s += zeroPad((d = date).getUTCFullYear(), 4), s += zeroPad(d.getUTCMonth() + 1), 
        s += zeroPad(d.getUTCDate()), s += zeroPad(d.getUTCHours()), s += zeroPad(d.getUTCMinutes()), 
        s += zeroPad(d.getUTCSeconds()), s += "Z"), asn1.Ber.GeneralizedTime) : der.writeString((function(d) {
            var s = "";
            return s += zeroPad(d.getUTCFullYear() % 100), s += zeroPad(d.getUTCMonth() + 1), 
            s += zeroPad(d.getUTCDate()), s += zeroPad(d.getUTCHours()), s += zeroPad(d.getUTCMinutes()), 
            s += zeroPad(d.getUTCSeconds()), s += "Z";
        })(date), asn1.Ber.UTCTime);
    }
    var ALTNAME = {
        OtherName: Local(0),
        RFC822Name: Context(1),
        DNSName: Context(2),
        X400Address: Local(3),
        DirectoryName: Local(4),
        EDIPartyName: Local(5),
        URI: Context(6),
        IPAddress: Context(7),
        OID: Context(8)
    }, EXTPURPOSE = {
        serverAuth: "1.3.6.1.5.5.7.3.1",
        clientAuth: "1.3.6.1.5.5.7.3.2",
        codeSigning: "1.3.6.1.5.5.7.3.3",
        joyentDocker: "1.3.6.1.4.1.38678.1.4.1",
        joyentCmon: "1.3.6.1.4.1.38678.1.4.2"
    }, EXTPURPOSE_REV = {};
    Object.keys(EXTPURPOSE).forEach((function(k) {
        EXTPURPOSE_REV[EXTPURPOSE[k]] = k;
    }));
    var KEYUSEBITS = [ "signature", "identity", "keyEncryption", "encryption", "keyAgreement", "ca", "crl" ];
    function readExtension(cert, buf, der) {
        der.readSequence();
        var id, critical, after = der.offset + der.length, extId = der.readOID(), sig = cert.signatures.x509;
        switch (sig.extras.exts || (sig.extras.exts = []), der.peek() === asn1.Ber.Boolean && (critical = der.readBoolean()), 
        extId) {
          case "2.5.29.19":
            der.readSequence(asn1.Ber.OctetString), der.readSequence();
            var bcEnd = der.offset + der.length, ca = !1;
            der.peek() === asn1.Ber.Boolean && (ca = der.readBoolean()), void 0 === cert.purposes && (cert.purposes = []), 
            !0 === ca && cert.purposes.push("ca");
            var bc = {
                oid: extId,
                critical: critical
            };
            der.offset < bcEnd && der.peek() === asn1.Ber.Integer && (bc.pathLen = der.readInt()), 
            sig.extras.exts.push(bc);
            break;

          case "2.5.29.37":
            der.readSequence(asn1.Ber.OctetString), der.readSequence(), void 0 === cert.purposes && (cert.purposes = []);
            for (var ekEnd = der.offset + der.length; der.offset < ekEnd; ) {
                var oid = der.readOID();
                cert.purposes.push(EXTPURPOSE_REV[oid] || oid);
            }
            -1 !== cert.purposes.indexOf("serverAuth") && -1 === cert.purposes.indexOf("clientAuth") ? cert.subjects.forEach((function(ide) {
                "host" !== ide.type && (ide.type = "host", ide.hostname = ide.uid || ide.email || ide.components[0].value);
            })) : -1 !== cert.purposes.indexOf("clientAuth") && -1 === cert.purposes.indexOf("serverAuth") && cert.subjects.forEach((function(ide) {
                "user" !== ide.type && (ide.type = "user", ide.uid = ide.hostname || ide.email || ide.components[0].value);
            })), sig.extras.exts.push({
                oid: extId,
                critical: critical
            });
            break;

          case "2.5.29.15":
            der.readSequence(asn1.Ber.OctetString);
            var bits = der.readString(asn1.Ber.BitString, !0), setBits = (function(bits, bitIndex) {
                for (var bitLen = 8 * (bits.length - 1) - bits[0], setBits = {}, i = 0; i < bitLen; ++i) {
                    var mask = 1 << 7 - i % 8, bitVal = 0 != (bits[1 + Math.floor(i / 8)] & mask), name = bitIndex[i];
                    bitVal && "string" == typeof name && (setBits[name] = !0);
                }
                return Object.keys(setBits);
            })(bits, KEYUSEBITS);
            setBits.forEach((function(bit) {
                void 0 === cert.purposes && (cert.purposes = []), -1 === cert.purposes.indexOf(bit) && cert.purposes.push(bit);
            })), sig.extras.exts.push({
                oid: extId,
                critical: critical,
                bits: bits
            });
            break;

          case "2.5.29.17":
            der.readSequence(asn1.Ber.OctetString), der.readSequence();
            for (var aeEnd = der.offset + der.length; der.offset < aeEnd; ) switch (der.peek()) {
              case ALTNAME.OtherName:
              case ALTNAME.EDIPartyName:
                der.readSequence(), der._offset += der.length;
                break;

              case ALTNAME.OID:
                der.readOID(ALTNAME.OID);
                break;

              case ALTNAME.RFC822Name:
                var email = der.readString(ALTNAME.RFC822Name);
                id = Identity.forEmail(email), cert.subjects[0].equals(id) || cert.subjects.push(id);
                break;

              case ALTNAME.DirectoryName:
                der.readSequence(ALTNAME.DirectoryName), id = Identity.parseAsn1(der), cert.subjects[0].equals(id) || cert.subjects.push(id);
                break;

              case ALTNAME.DNSName:
                var host = der.readString(ALTNAME.DNSName);
                id = Identity.forHost(host), cert.subjects[0].equals(id) || cert.subjects.push(id);
                break;

              default:
                der.readString(der.peek());
            }
            sig.extras.exts.push({
                oid: extId,
                critical: critical
            });
            break;

          default:
            sig.extras.exts.push({
                oid: extId,
                critical: critical,
                data: der.readString(asn1.Ber.OctetString, !0)
            });
        }
        der._offset = after;
    }
    var UTCTIME_RE = /^([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})?Z$/, GTIME_RE = /^([0-9]{4})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})?Z$/;
    function zeroPad(n, m) {
        void 0 === m && (m = 2);
        for (var s = "" + n; s.length < m; ) s = "0" + s;
        return s;
    }
    function writeTBSCert(cert, der) {
        var sig = cert.signatures.x509;
        assert.object(sig, "x509 signature"), der.startSequence(), der.startSequence(Local(0)), 
        der.writeInt(2), der.endSequence(), der.writeBuffer(utils.mpNormalize(cert.serial), asn1.Ber.Integer), 
        der.startSequence(), der.writeOID(SIGN_ALGS[sig.algo]), sig.algo.match(/^rsa-/) && der.writeNull(), 
        der.endSequence(), cert.issuer.toAsn1(der), der.startSequence(), writeDate(der, cert.validFrom), 
        writeDate(der, cert.validUntil), der.endSequence();
        var subject = cert.subjects[0], altNames = cert.subjects.slice(1);
        if (subject.toAsn1(der), pkcs8.writePkcs8(der, cert.subjectKey), sig.extras && sig.extras.issuerUniqueID && der.writeBuffer(sig.extras.issuerUniqueID, Local(1)), 
        sig.extras && sig.extras.subjectUniqueID && der.writeBuffer(sig.extras.subjectUniqueID, Local(2)), 
        altNames.length > 0 || "host" === subject.type || void 0 !== cert.purposes && cert.purposes.length > 0 || sig.extras && sig.extras.exts) {
            der.startSequence(Local(3)), der.startSequence();
            var exts = [];
            void 0 !== cert.purposes && cert.purposes.length > 0 && (exts.push({
                oid: "2.5.29.19",
                critical: !0
            }), exts.push({
                oid: "2.5.29.15",
                critical: !0
            }), exts.push({
                oid: "2.5.29.37",
                critical: !0
            })), exts.push({
                oid: "2.5.29.17"
            }), sig.extras && sig.extras.exts && (exts = sig.extras.exts);
            for (var i = 0; i < exts.length; ++i) {
                if (der.startSequence(), der.writeOID(exts[i].oid), void 0 !== exts[i].critical && der.writeBoolean(exts[i].critical), 
                "2.5.29.17" === exts[i].oid) {
                    der.startSequence(asn1.Ber.OctetString), der.startSequence(), "host" === subject.type && der.writeString(subject.hostname, Context(2));
                    for (var j = 0; j < altNames.length; ++j) "host" === altNames[j].type ? der.writeString(altNames[j].hostname, ALTNAME.DNSName) : "email" === altNames[j].type ? der.writeString(altNames[j].email, ALTNAME.RFC822Name) : (der.startSequence(ALTNAME.DirectoryName), 
                    altNames[j].toAsn1(der), der.endSequence());
                    der.endSequence(), der.endSequence();
                } else if ("2.5.29.19" === exts[i].oid) {
                    der.startSequence(asn1.Ber.OctetString), der.startSequence();
                    var ca = -1 !== cert.purposes.indexOf("ca"), pathLen = exts[i].pathLen;
                    der.writeBoolean(ca), void 0 !== pathLen && der.writeInt(pathLen), der.endSequence(), 
                    der.endSequence();
                } else if ("2.5.29.37" === exts[i].oid) der.startSequence(asn1.Ber.OctetString), 
                der.startSequence(), cert.purposes.forEach((function(purpose) {
                    if ("ca" !== purpose && -1 === KEYUSEBITS.indexOf(purpose)) {
                        var oid = purpose;
                        void 0 !== EXTPURPOSE[purpose] && (oid = EXTPURPOSE[purpose]), der.writeOID(oid);
                    }
                })), der.endSequence(), der.endSequence(); else if ("2.5.29.15" === exts[i].oid) {
                    if (der.startSequence(asn1.Ber.OctetString), void 0 !== exts[i].bits) der.writeBuffer(exts[i].bits, asn1.Ber.BitString); else {
                        var bits = writeBitField(cert.purposes, KEYUSEBITS);
                        der.writeBuffer(bits, asn1.Ber.BitString);
                    }
                    der.endSequence();
                } else der.writeBuffer(exts[i].data, asn1.Ber.OctetString);
                der.endSequence();
            }
            der.endSequence(), der.endSequence();
        }
        der.endSequence();
    }
    function writeBitField(setBits, bitIndex) {
        var bitLen = bitIndex.length, blen = Math.ceil(bitLen / 8), unused = 8 * blen - bitLen, bits = Buffer.alloc(1 + blen);
        bits[0] = unused;
        for (var i = 0; i < bitLen; ++i) {
            var byteN = 1 + Math.floor(i / 8), mask = 1 << 7 - i % 8, name = bitIndex[i];
            void 0 !== name && -1 !== setBits.indexOf(name) && (bits[byteN] |= mask);
        }
        return bits;
    }
}
