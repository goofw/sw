function(module, exports, __webpack_require__) {
    module.exports = Signature;
    var assert = __webpack_require__(15), Buffer = __webpack_require__(14).Buffer, errs = (__webpack_require__(30), 
    __webpack_require__(9), __webpack_require__(44)), utils = __webpack_require__(26), asn1 = __webpack_require__(49), SSHBuffer = __webpack_require__(100), InvalidAlgorithmError = errs.InvalidAlgorithmError, SignatureParseError = errs.SignatureParseError;
    function Signature(opts) {
        assert.object(opts, "options"), assert.arrayOfObject(opts.parts, "options.parts"), 
        assert.string(opts.type, "options.type");
        for (var partLookup = {}, i = 0; i < opts.parts.length; ++i) {
            var part = opts.parts[i];
            partLookup[part.name] = part;
        }
        this.type = opts.type, this.hashAlgorithm = opts.hashAlgo, this.curve = opts.curve, 
        this.parts = opts.parts, this.part = partLookup;
    }
    Signature.prototype.toBuffer = function(format) {
        var buf;
        void 0 === format && (format = "asn1"), assert.string(format, "format");
        var stype = "ssh-" + this.type;
        switch (this.type) {
          case "rsa":
            switch (this.hashAlgorithm) {
              case "sha256":
                stype = "rsa-sha2-256";
                break;

              case "sha512":
                stype = "rsa-sha2-512";
                break;

              case "sha1":
              case void 0:
                break;

              default:
                throw new Error("SSH signature format does not support hash algorithm " + this.hashAlgorithm);
            }
            return "ssh" === format ? ((buf = new SSHBuffer({})).writeString(stype), buf.writePart(this.part.sig), 
            buf.toBuffer()) : this.part.sig.data;

          case "ed25519":
            return "ssh" === format ? ((buf = new SSHBuffer({})).writeString(stype), buf.writePart(this.part.sig), 
            buf.toBuffer()) : this.part.sig.data;

          case "dsa":
          case "ecdsa":
            var r, s;
            if ("asn1" === format) {
                var der = new asn1.BerWriter;
                return der.startSequence(), r = utils.mpNormalize(this.part.r.data), s = utils.mpNormalize(this.part.s.data), 
                der.writeBuffer(r, asn1.Ber.Integer), der.writeBuffer(s, asn1.Ber.Integer), der.endSequence(), 
                der.buffer;
            }
            if ("ssh" === format && "dsa" === this.type) {
                if ((buf = new SSHBuffer({})).writeString("ssh-dss"), (r = this.part.r.data).length > 20 && 0 === r[0] && (r = r.slice(1)), 
                (s = this.part.s.data).length > 20 && 0 === s[0] && (s = s.slice(1)), this.hashAlgorithm && "sha1" !== this.hashAlgorithm || r.length + s.length !== 40) throw new Error("OpenSSH only supports DSA signatures with SHA1 hash");
                return buf.writeBuffer(Buffer.concat([ r, s ])), buf.toBuffer();
            }
            if ("ssh" === format && "ecdsa" === this.type) {
                var curve, inner = new SSHBuffer({});
                r = this.part.r.data, inner.writeBuffer(r), inner.writePart(this.part.s), buf = new SSHBuffer({}), 
                0 === r[0] && (r = r.slice(1));
                var sz = 8 * r.length;
                return 256 === sz ? curve = "nistp256" : 384 === sz ? curve = "nistp384" : 528 === sz && (curve = "nistp521"), 
                buf.writeString("ecdsa-sha2-" + curve), buf.writeBuffer(inner.toBuffer()), buf.toBuffer();
            }
            throw new Error("Invalid signature format");

          default:
            throw new Error("Invalid signature data");
        }
    }, Signature.prototype.toString = function(format) {
        return assert.optionalString(format, "format"), this.toBuffer(format).toString("base64");
    }, Signature.parse = function(data, type, format) {
        "string" == typeof data && (data = Buffer.from(data, "base64")), assert.buffer(data, "data"), 
        assert.string(format, "format"), assert.string(type, "type");
        var opts = {};
        opts.type = type.toLowerCase(), opts.parts = [];
        try {
            switch (assert.ok(data.length > 0, "signature must not be empty"), opts.type) {
              case "rsa":
              case "ed25519":
                return (function(data, type, format, opts) {
                    if ("ssh" === format) {
                        try {
                            var buf = new SSHBuffer({
                                buffer: data
                            }), head = buf.readString();
                        } catch (e) {}
                        if (void 0 !== buf) {
                            var msg = "SSH signature does not match expected type (expected " + type + ", got " + head + ")";
                            switch (head) {
                              case "ssh-rsa":
                                assert.strictEqual(type, "rsa", msg), opts.hashAlgo = "sha1";
                                break;

                              case "rsa-sha2-256":
                                assert.strictEqual(type, "rsa", msg), opts.hashAlgo = "sha256";
                                break;

                              case "rsa-sha2-512":
                                assert.strictEqual(type, "rsa", msg), opts.hashAlgo = "sha512";
                                break;

                              case "ssh-ed25519":
                                assert.strictEqual(type, "ed25519", msg), opts.hashAlgo = "sha512";
                                break;

                              default:
                                throw new Error("Unknown SSH signature type: " + head);
                            }
                            var sig = buf.readPart();
                            return assert.ok(buf.atEnd(), "extra trailing bytes"), sig.name = "sig", opts.parts.push(sig), 
                            new Signature(opts);
                        }
                    }
                    return opts.parts.push({
                        name: "sig",
                        data: data
                    }), new Signature(opts);
                })(data, type, format, opts);

              case "dsa":
              case "ecdsa":
                return "asn1" === format ? (function(data, type, format, opts) {
                    var der = new asn1.BerReader(data);
                    der.readSequence();
                    var r = der.readString(asn1.Ber.Integer, !0), s = der.readString(asn1.Ber.Integer, !0);
                    return opts.parts.push({
                        name: "r",
                        data: utils.mpNormalize(r)
                    }), opts.parts.push({
                        name: "s",
                        data: utils.mpNormalize(s)
                    }), new Signature(opts);
                })(data, 0, 0, opts) : "dsa" === opts.type ? (function(data, type, format, opts) {
                    if (40 != data.length) {
                        var buf = new SSHBuffer({
                            buffer: data
                        }), d = buf.readBuffer();
                        "ssh-dss" === d.toString("ascii") && (d = buf.readBuffer()), assert.ok(buf.atEnd(), "extra trailing bytes"), 
                        assert.strictEqual(d.length, 40, "invalid inner length"), data = d;
                    }
                    return opts.parts.push({
                        name: "r",
                        data: data.slice(0, 20)
                    }), opts.parts.push({
                        name: "s",
                        data: data.slice(20, 40)
                    }), new Signature(opts);
                })(data, 0, 0, opts) : (function(data, type, format, opts) {
                    var r, s, buf = new SSHBuffer({
                        buffer: data
                    }), inner = buf.readBuffer(), stype = inner.toString("ascii");
                    if ("ecdsa-" === stype.slice(0, 6)) {
                        var parts = stype.split("-");
                        switch (assert.strictEqual(parts[0], "ecdsa"), assert.strictEqual(parts[1], "sha2"), 
                        opts.curve = parts[2], opts.curve) {
                          case "nistp256":
                            opts.hashAlgo = "sha256";
                            break;

                          case "nistp384":
                            opts.hashAlgo = "sha384";
                            break;

                          case "nistp521":
                            opts.hashAlgo = "sha512";
                            break;

                          default:
                            throw new Error("Unsupported ECDSA curve: " + opts.curve);
                        }
                        inner = buf.readBuffer(), assert.ok(buf.atEnd(), "extra trailing bytes on outer"), 
                        r = (buf = new SSHBuffer({
                            buffer: inner
                        })).readPart();
                    } else r = {
                        data: inner
                    };
                    return s = buf.readPart(), assert.ok(buf.atEnd(), "extra trailing bytes"), r.name = "r", 
                    s.name = "s", opts.parts.push(r), opts.parts.push(s), new Signature(opts);
                })(data, 0, 0, opts);

              default:
                throw new InvalidAlgorithmError(type);
            }
        } catch (e) {
            if (e instanceof InvalidAlgorithmError) throw e;
            throw new SignatureParseError(type, format, e);
        }
    }, Signature.isSignature = function(obj, ver) {
        return utils.isCompatible(obj, Signature, ver);
    }, Signature.prototype._sshpkApiVersion = [ 2, 1 ], Signature._oldVersionDetect = function(obj) {
        return assert.func(obj.toBuffer), obj.hasOwnProperty("hashAlgorithm") ? [ 2, 0 ] : [ 1, 0 ];
    };
}
