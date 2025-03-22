function(module, exports, __webpack_require__) {
    module.exports = Identity;
    var assert = __webpack_require__(15), utils = (__webpack_require__(30), __webpack_require__(9), 
    __webpack_require__(97), __webpack_require__(48), __webpack_require__(44), __webpack_require__(0), 
    __webpack_require__(26)), asn1 = __webpack_require__(49), Buffer = __webpack_require__(14).Buffer, DNS_NAME_RE = /^([*]|[a-z0-9][a-z0-9\-]{0,62})(?:\.([*]|[a-z0-9][a-z0-9\-]{0,62}))*$/i, oids = {
        cn: "2.5.4.3",
        o: "2.5.4.10",
        ou: "2.5.4.11",
        l: "2.5.4.7",
        s: "2.5.4.8",
        c: "2.5.4.6",
        sn: "2.5.4.4",
        postalCode: "2.5.4.17",
        serialNumber: "2.5.4.5",
        street: "2.5.4.9",
        x500UniqueIdentifier: "2.5.4.45",
        role: "2.5.4.72",
        telephoneNumber: "2.5.4.20",
        description: "2.5.4.13",
        dc: "0.9.2342.19200300.100.1.25",
        uid: "0.9.2342.19200300.100.1.1",
        mail: "0.9.2342.19200300.100.1.3",
        title: "2.5.4.12",
        gn: "2.5.4.42",
        initials: "2.5.4.43",
        pseudonym: "2.5.4.65",
        emailAddress: "1.2.840.113549.1.9.1"
    }, unoids = {};
    function Identity(opts) {
        var self = this;
        if (assert.object(opts, "options"), assert.arrayOfObject(opts.components, "options.components"), 
        this.components = opts.components, this.componentLookup = {}, this.components.forEach((function(c) {
            c.name && !c.oid && (c.oid = oids[c.name]), c.oid && !c.name && (c.name = unoids[c.oid]), 
            void 0 === self.componentLookup[c.name] && (self.componentLookup[c.name] = []), 
            self.componentLookup[c.name].push(c);
        })), this.componentLookup.cn && this.componentLookup.cn.length > 0 && (this.cn = this.componentLookup.cn[0].value), 
        assert.optionalString(opts.type, "options.type"), void 0 === opts.type) 1 === this.components.length && this.componentLookup.cn && 1 === this.componentLookup.cn.length && this.componentLookup.cn[0].value.match(DNS_NAME_RE) ? (this.type = "host", 
        this.hostname = this.componentLookup.cn[0].value) : this.componentLookup.dc && this.components.length === this.componentLookup.dc.length ? (this.type = "host", 
        this.hostname = this.componentLookup.dc.map((function(c) {
            return c.value;
        })).join(".")) : this.componentLookup.uid && this.components.length === this.componentLookup.uid.length ? (this.type = "user", 
        this.uid = this.componentLookup.uid[0].value) : this.componentLookup.cn && 1 === this.componentLookup.cn.length && this.componentLookup.cn[0].value.match(DNS_NAME_RE) ? (this.type = "host", 
        this.hostname = this.componentLookup.cn[0].value) : this.componentLookup.uid && 1 === this.componentLookup.uid.length ? (this.type = "user", 
        this.uid = this.componentLookup.uid[0].value) : this.componentLookup.mail && 1 === this.componentLookup.mail.length ? (this.type = "email", 
        this.email = this.componentLookup.mail[0].value) : this.componentLookup.cn && 1 === this.componentLookup.cn.length ? (this.type = "user", 
        this.uid = this.componentLookup.cn[0].value) : this.type = "unknown"; else if (this.type = opts.type, 
        "host" === this.type) this.hostname = opts.hostname; else if ("user" === this.type) this.uid = opts.uid; else {
            if ("email" !== this.type) throw new Error("Unknown type " + this.type);
            this.email = opts.email;
        }
    }
    Object.keys(oids).forEach((function(k) {
        unoids[oids[k]] = k;
    })), Identity.prototype.toString = function() {
        return this.components.map((function(c) {
            var n = c.name.toUpperCase();
            n = n.replace(/=/g, "\\=");
            var v = c.value;
            return n + "=" + v.replace(/,/g, "\\,");
        })).join(", ");
    }, Identity.prototype.get = function(name, asArray) {
        assert.string(name, "name");
        var arr = this.componentLookup[name];
        if (void 0 !== arr && 0 !== arr.length) {
            if (!asArray && arr.length > 1) throw new Error("Multiple values for attribute " + name);
            return asArray ? arr.map((function(c) {
                return c.value;
            })) : arr[0].value;
        }
    }, Identity.prototype.toArray = function(idx) {
        return this.components.map((function(c) {
            return {
                name: c.name,
                value: c.value
            };
        }));
    };
    var NOT_PRINTABLE = /[^a-zA-Z0-9 '(),+.\/:=?-]/, NOT_IA5 = /[^\x00-\x7f]/;
    function globMatch(a, b) {
        if ("**" === a || "**" === b) return !0;
        var aParts = a.split("."), bParts = b.split(".");
        if (aParts.length !== bParts.length) return !1;
        for (var i = 0; i < aParts.length; ++i) if ("*" !== aParts[i] && "*" !== bParts[i] && aParts[i] !== bParts[i]) return !1;
        return !0;
    }
    Identity.prototype.toAsn1 = function(der, tag) {
        der.startSequence(tag), this.components.forEach((function(c) {
            if (der.startSequence(asn1.Ber.Constructor | asn1.Ber.Set), der.startSequence(), 
            der.writeOID(c.oid), c.asn1type === asn1.Ber.Utf8String || c.value.match(NOT_IA5)) {
                var v = Buffer.from(c.value, "utf8");
                der.writeBuffer(v, asn1.Ber.Utf8String);
            } else if (c.asn1type === asn1.Ber.IA5String || c.value.match(NOT_PRINTABLE)) der.writeString(c.value, asn1.Ber.IA5String); else {
                var type = asn1.Ber.PrintableString;
                void 0 !== c.asn1type && (type = c.asn1type), der.writeString(c.value, type);
            }
            der.endSequence(), der.endSequence();
        })), der.endSequence();
    }, Identity.prototype.equals = function(other) {
        if (!Identity.isIdentity(other, [ 1, 0 ])) return !1;
        if (other.components.length !== this.components.length) return !1;
        for (var i = 0; i < this.components.length; ++i) {
            if (this.components[i].oid !== other.components[i].oid) return !1;
            if (!globMatch(this.components[i].value, other.components[i].value)) return !1;
        }
        return !0;
    }, Identity.forHost = function(hostname) {
        return assert.string(hostname, "hostname"), new Identity({
            type: "host",
            hostname: hostname,
            components: [ {
                name: "cn",
                value: hostname
            } ]
        });
    }, Identity.forUser = function(uid) {
        return assert.string(uid, "uid"), new Identity({
            type: "user",
            uid: uid,
            components: [ {
                name: "uid",
                value: uid
            } ]
        });
    }, Identity.forEmail = function(email) {
        return assert.string(email, "email"), new Identity({
            type: "email",
            email: email,
            components: [ {
                name: "mail",
                value: email
            } ]
        });
    }, Identity.parseDN = function(dn) {
        assert.string(dn, "dn");
        for (var parts = [ "" ], idx = 0, rem = dn; rem.length > 0; ) {
            var m;
            if (null !== (m = /^,/.exec(rem))) parts[++idx] = "", rem = rem.slice(m[0].length); else if (null !== (m = /^\\,/.exec(rem))) parts[idx] += ",", 
            rem = rem.slice(m[0].length); else if (null !== (m = /^\\./.exec(rem))) parts[idx] += m[0], 
            rem = rem.slice(m[0].length); else {
                if (null === (m = /^[^\\,]+/.exec(rem))) throw new Error("Failed to parse DN");
                parts[idx] += m[0], rem = rem.slice(m[0].length);
            }
        }
        return new Identity({
            components: parts.map((function(c) {
                for (var eqPos = (c = c.trim()).indexOf("="); eqPos > 0 && "\\" === c.charAt(eqPos - 1); ) eqPos = c.indexOf("=", eqPos + 1);
                if (-1 === eqPos) throw new Error("Failed to parse DN");
                return {
                    name: c.slice(0, eqPos).toLowerCase().replace(/\\=/g, "="),
                    value: c.slice(eqPos + 1)
                };
            }))
        });
    }, Identity.fromArray = function(components) {
        return assert.arrayOfObject(components, "components"), components.forEach((function(cmp) {
            if (assert.object(cmp, "component"), assert.string(cmp.name, "component.name"), 
            !Buffer.isBuffer(cmp.value) && "string" != typeof cmp.value) throw new Error("Invalid component value");
        })), new Identity({
            components: components
        });
    }, Identity.parseAsn1 = function(der, top) {
        var components = [];
        der.readSequence(top);
        for (var end = der.offset + der.length; der.offset < end; ) {
            der.readSequence(asn1.Ber.Constructor | asn1.Ber.Set);
            var after = der.offset + der.length;
            der.readSequence();
            var value, oid = der.readOID(), type = der.peek();
            switch (type) {
              case asn1.Ber.PrintableString:
              case asn1.Ber.IA5String:
              case asn1.Ber.OctetString:
              case asn1.Ber.T61String:
                value = der.readString(type);
                break;

              case asn1.Ber.Utf8String:
                value = (value = der.readString(type, !0)).toString("utf8");
                break;

              case asn1.Ber.CharacterString:
              case asn1.Ber.BMPString:
                value = (value = der.readString(type, !0)).toString("utf16le");
                break;

              default:
                throw new Error("Unknown asn1 type " + type);
            }
            components.push({
                oid: oid,
                asn1type: type,
                value: value
            }), der._offset = after;
        }
        return der._offset = end, new Identity({
            components: components
        });
    }, Identity.isIdentity = function(obj, ver) {
        return utils.isCompatible(obj, Identity, ver);
    }, Identity.prototype._sshpkApiVersion = [ 1, 0 ], Identity._oldVersionDetect = function(obj) {
        return [ 1, 0 ];
    };
}
