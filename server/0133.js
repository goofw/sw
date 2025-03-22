function(module, exports, __webpack_require__) {
    "use strict";
    var Buffer = __webpack_require__(23).Buffer, isEncoding = Buffer.isEncoding || function(encoding) {
        switch ((encoding = "" + encoding) && encoding.toLowerCase()) {
          case "hex":
          case "utf8":
          case "utf-8":
          case "ascii":
          case "binary":
          case "base64":
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
          case "raw":
            return !0;

          default:
            return !1;
        }
    };
    function StringDecoder(encoding) {
        var nb;
        switch (this.encoding = (function(enc) {
            var nenc = (function(enc) {
                if (!enc) return "utf8";
                for (var retried; ;) switch (enc) {
                  case "utf8":
                  case "utf-8":
                    return "utf8";

                  case "ucs2":
                  case "ucs-2":
                  case "utf16le":
                  case "utf-16le":
                    return "utf16le";

                  case "latin1":
                  case "binary":
                    return "latin1";

                  case "base64":
                  case "ascii":
                  case "hex":
                    return enc;

                  default:
                    if (retried) return;
                    enc = ("" + enc).toLowerCase(), retried = !0;
                }
            })(enc);
            if ("string" != typeof nenc && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error("Unknown encoding: " + enc);
            return nenc || enc;
        })(encoding), this.encoding) {
          case "utf16le":
            this.text = utf16Text, this.end = utf16End, nb = 4;
            break;

          case "utf8":
            this.fillLast = utf8FillLast, nb = 4;
            break;

          case "base64":
            this.text = base64Text, this.end = base64End, nb = 3;
            break;

          default:
            return this.write = simpleWrite, void (this.end = simpleEnd);
        }
        this.lastNeed = 0, this.lastTotal = 0, this.lastChar = Buffer.allocUnsafe(nb);
    }
    function utf8CheckByte(byte) {
        return byte <= 127 ? 0 : byte >> 5 == 6 ? 2 : byte >> 4 == 14 ? 3 : byte >> 3 == 30 ? 4 : byte >> 6 == 2 ? -1 : -2;
    }
    function utf8FillLast(buf) {
        var p = this.lastTotal - this.lastNeed, r = (function(self, buf, p) {
            if (128 != (192 & buf[0])) return self.lastNeed = 0, "�";
            if (self.lastNeed > 1 && buf.length > 1) {
                if (128 != (192 & buf[1])) return self.lastNeed = 1, "�";
                if (self.lastNeed > 2 && buf.length > 2 && 128 != (192 & buf[2])) return self.lastNeed = 2, 
                "�";
            }
        })(this, buf);
        return void 0 !== r ? r : this.lastNeed <= buf.length ? (buf.copy(this.lastChar, p, 0, this.lastNeed), 
        this.lastChar.toString(this.encoding, 0, this.lastTotal)) : (buf.copy(this.lastChar, p, 0, buf.length), 
        void (this.lastNeed -= buf.length));
    }
    function utf16Text(buf, i) {
        if ((buf.length - i) % 2 == 0) {
            var r = buf.toString("utf16le", i);
            if (r) {
                var c = r.charCodeAt(r.length - 1);
                if (c >= 55296 && c <= 56319) return this.lastNeed = 2, this.lastTotal = 4, this.lastChar[0] = buf[buf.length - 2], 
                this.lastChar[1] = buf[buf.length - 1], r.slice(0, -1);
            }
            return r;
        }
        return this.lastNeed = 1, this.lastTotal = 2, this.lastChar[0] = buf[buf.length - 1], 
        buf.toString("utf16le", i, buf.length - 1);
    }
    function utf16End(buf) {
        var r = buf && buf.length ? this.write(buf) : "";
        if (this.lastNeed) {
            var end = this.lastTotal - this.lastNeed;
            return r + this.lastChar.toString("utf16le", 0, end);
        }
        return r;
    }
    function base64Text(buf, i) {
        var n = (buf.length - i) % 3;
        return 0 === n ? buf.toString("base64", i) : (this.lastNeed = 3 - n, this.lastTotal = 3, 
        1 === n ? this.lastChar[0] = buf[buf.length - 1] : (this.lastChar[0] = buf[buf.length - 2], 
        this.lastChar[1] = buf[buf.length - 1]), buf.toString("base64", i, buf.length - n));
    }
    function base64End(buf) {
        var r = buf && buf.length ? this.write(buf) : "";
        return this.lastNeed ? r + this.lastChar.toString("base64", 0, 3 - this.lastNeed) : r;
    }
    function simpleWrite(buf) {
        return buf.toString(this.encoding);
    }
    function simpleEnd(buf) {
        return buf && buf.length ? this.write(buf) : "";
    }
    exports.StringDecoder = StringDecoder, StringDecoder.prototype.write = function(buf) {
        if (0 === buf.length) return "";
        var r, i;
        if (this.lastNeed) {
            if (void 0 === (r = this.fillLast(buf))) return "";
            i = this.lastNeed, this.lastNeed = 0;
        } else i = 0;
        return i < buf.length ? r ? r + this.text(buf, i) : this.text(buf, i) : r || "";
    }, StringDecoder.prototype.end = function(buf) {
        var r = buf && buf.length ? this.write(buf) : "";
        return this.lastNeed ? r + "�" : r;
    }, StringDecoder.prototype.text = function(buf, i) {
        var total = (function(self, buf, i) {
            var j = buf.length - 1;
            if (j < i) return 0;
            var nb = utf8CheckByte(buf[j]);
            return nb >= 0 ? (nb > 0 && (self.lastNeed = nb - 1), nb) : --j < i || -2 === nb ? 0 : (nb = utf8CheckByte(buf[j])) >= 0 ? (nb > 0 && (self.lastNeed = nb - 2), 
            nb) : --j < i || -2 === nb ? 0 : (nb = utf8CheckByte(buf[j])) >= 0 ? (nb > 0 && (2 === nb ? nb = 0 : self.lastNeed = nb - 3), 
            nb) : 0;
        })(this, buf, i);
        if (!this.lastNeed) return buf.toString("utf8", i);
        this.lastTotal = total;
        var end = buf.length - (total - this.lastNeed);
        return buf.copy(this.lastChar, 0, end), buf.toString("utf8", i, end);
    }, StringDecoder.prototype.fillLast = function(buf) {
        if (this.lastNeed <= buf.length) return buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed), 
        this.lastChar.toString(this.encoding, 0, this.lastTotal);
        buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length), this.lastNeed -= buf.length;
    };
}
