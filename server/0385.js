function(module, exports, __webpack_require__) {
    var Buffer = __webpack_require__(10).Buffer, isBufferEncoding = Buffer.isEncoding || function(encoding) {
        switch (encoding && encoding.toLowerCase()) {
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
    }, StringDecoder = exports.StringDecoder = function(encoding) {
        switch (this.encoding = (encoding || "utf8").toLowerCase().replace(/[-_]/, ""), 
        (function(encoding) {
            if (encoding && !isBufferEncoding(encoding)) throw new Error("Unknown encoding: " + encoding);
        })(encoding), this.encoding) {
          case "utf8":
            this.surrogateSize = 3;
            break;

          case "ucs2":
          case "utf16le":
            this.surrogateSize = 2, this.detectIncompleteChar = utf16DetectIncompleteChar;
            break;

          case "base64":
            this.surrogateSize = 3, this.detectIncompleteChar = base64DetectIncompleteChar;
            break;

          default:
            return void (this.write = passThroughWrite);
        }
        this.charBuffer = new Buffer(6), this.charReceived = 0, this.charLength = 0;
    };
    function passThroughWrite(buffer) {
        return buffer.toString(this.encoding);
    }
    function utf16DetectIncompleteChar(buffer) {
        this.charReceived = buffer.length % 2, this.charLength = this.charReceived ? 2 : 0;
    }
    function base64DetectIncompleteChar(buffer) {
        this.charReceived = buffer.length % 3, this.charLength = this.charReceived ? 3 : 0;
    }
    StringDecoder.prototype.write = function(buffer) {
        for (var charStr = ""; this.charLength; ) {
            var available = buffer.length >= this.charLength - this.charReceived ? this.charLength - this.charReceived : buffer.length;
            if (buffer.copy(this.charBuffer, this.charReceived, 0, available), this.charReceived += available, 
            this.charReceived < this.charLength) return "";
            if (buffer = buffer.slice(available, buffer.length), !((charCode = (charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding)).charCodeAt(charStr.length - 1)) >= 55296 && charCode <= 56319)) {
                if (this.charReceived = this.charLength = 0, 0 === buffer.length) return charStr;
                break;
            }
            this.charLength += this.surrogateSize, charStr = "";
        }
        this.detectIncompleteChar(buffer);
        var charCode, end = buffer.length;
        if (this.charLength && (buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end), 
        end -= this.charReceived), end = (charStr += buffer.toString(this.encoding, 0, end)).length - 1, 
        (charCode = charStr.charCodeAt(end)) >= 55296 && charCode <= 56319) {
            var size = this.surrogateSize;
            return this.charLength += size, this.charReceived += size, this.charBuffer.copy(this.charBuffer, size, 0, size), 
            buffer.copy(this.charBuffer, 0, 0, size), charStr.substring(0, end);
        }
        return charStr;
    }, StringDecoder.prototype.detectIncompleteChar = function(buffer) {
        for (var i = buffer.length >= 3 ? 3 : buffer.length; i > 0; i--) {
            var c = buffer[buffer.length - i];
            if (1 == i && c >> 5 == 6) {
                this.charLength = 2;
                break;
            }
            if (i <= 2 && c >> 4 == 14) {
                this.charLength = 3;
                break;
            }
            if (i <= 3 && c >> 3 == 30) {
                this.charLength = 4;
                break;
            }
        }
        this.charReceived = i;
    }, StringDecoder.prototype.end = function(buffer) {
        var res = "";
        if (buffer && buffer.length && (res = this.write(buffer)), this.charReceived) {
            var cr = this.charReceived, buf = this.charBuffer, enc = this.encoding;
            res += buf.slice(0, cr).toString(enc);
        }
        return res;
    };
}
