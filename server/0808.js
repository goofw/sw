function(module, exports) {
    var C = {}, LEFT_BRACE = C.LEFT_BRACE = 1, RIGHT_BRACE = C.RIGHT_BRACE = 2, LEFT_BRACKET = C.LEFT_BRACKET = 3, RIGHT_BRACKET = C.RIGHT_BRACKET = 4, COLON = C.COLON = 5, COMMA = C.COMMA = 6, TRUE = C.TRUE = 7, FALSE = C.FALSE = 8, NULL = C.NULL = 9, STRING = C.STRING = 10, NUMBER = C.NUMBER = 11, START = C.START = 17, STOP = C.STOP = 18, TRUE1 = C.TRUE1 = 33, TRUE2 = C.TRUE2 = 34, TRUE3 = C.TRUE3 = 35, FALSE1 = C.FALSE1 = 49, FALSE2 = C.FALSE2 = 50, FALSE3 = C.FALSE3 = 51, FALSE4 = C.FALSE4 = 52, NULL1 = C.NULL1 = 65, NULL2 = C.NULL2 = 66, NULL3 = C.NULL3 = 67, NUMBER1 = C.NUMBER1 = 81, NUMBER3 = C.NUMBER3 = 83, STRING1 = C.STRING1 = 97, STRING2 = C.STRING2 = 98, STRING3 = C.STRING3 = 99, STRING4 = C.STRING4 = 100, STRING5 = C.STRING5 = 101, STRING6 = C.STRING6 = 102, VALUE = C.VALUE = 113, KEY = C.KEY = 114, OBJECT = C.OBJECT = 129, ARRAY = C.ARRAY = 130, BACK_SLASH = "\\".charCodeAt(0), FORWARD_SLASH = "/".charCodeAt(0), BACKSPACE = "\b".charCodeAt(0), FORM_FEED = "\f".charCodeAt(0), NEWLINE = "\n".charCodeAt(0), CARRIAGE_RETURN = "\r".charCodeAt(0), TAB = "\t".charCodeAt(0);
    function Parser() {
        this.tState = START, this.value = void 0, this.string = void 0, this.stringBuffer = Buffer.alloc ? Buffer.alloc(65536) : new Buffer(65536), 
        this.stringBufferOffset = 0, this.unicode = void 0, this.highSurrogate = void 0, 
        this.key = void 0, this.mode = void 0, this.stack = [], this.state = VALUE, this.bytes_remaining = 0, 
        this.bytes_in_sequence = 0, this.temp_buffs = {
            2: new Buffer(2),
            3: new Buffer(3),
            4: new Buffer(4)
        }, this.offset = -1;
    }
    Parser.toknam = function(code) {
        for (var keys = Object.keys(C), i = 0, l = keys.length; i < l; i++) {
            var key = keys[i];
            if (C[key] === code) return key;
        }
        return code && "0x" + code.toString(16);
    };
    var proto = Parser.prototype;
    proto.onError = function(err) {
        throw err;
    }, proto.charError = function(buffer, i) {
        this.tState = STOP, this.onError(new Error("Unexpected " + JSON.stringify(String.fromCharCode(buffer[i])) + " at position " + i + " in state " + Parser.toknam(this.tState)));
    }, proto.appendStringChar = function(char) {
        this.stringBufferOffset >= 65536 && (this.string += this.stringBuffer.toString("utf8"), 
        this.stringBufferOffset = 0), this.stringBuffer[this.stringBufferOffset++] = char;
    }, proto.appendStringBuf = function(buf, start, end) {
        var size = buf.length;
        "number" == typeof start && (size = "number" == typeof end ? end < 0 ? buf.length - start + end : end - start : buf.length - start), 
        size < 0 && (size = 0), this.stringBufferOffset + size > 65536 && (this.string += this.stringBuffer.toString("utf8", 0, this.stringBufferOffset), 
        this.stringBufferOffset = 0), buf.copy(this.stringBuffer, this.stringBufferOffset, start, end), 
        this.stringBufferOffset += size;
    }, proto.write = function(buffer) {
        var n;
        "string" == typeof buffer && (buffer = new Buffer(buffer));
        for (var i = 0, l = buffer.length; i < l; i++) if (this.tState === START) {
            if (n = buffer[i], this.offset++, 123 === n) this.onToken(LEFT_BRACE, "{"); else if (125 === n) this.onToken(RIGHT_BRACE, "}"); else if (91 === n) this.onToken(LEFT_BRACKET, "["); else if (93 === n) this.onToken(RIGHT_BRACKET, "]"); else if (58 === n) this.onToken(COLON, ":"); else if (44 === n) this.onToken(COMMA, ","); else if (116 === n) this.tState = TRUE1; else if (102 === n) this.tState = FALSE1; else if (110 === n) this.tState = NULL1; else if (34 === n) this.string = "", 
            this.stringBufferOffset = 0, this.tState = STRING1; else if (45 === n) this.string = "-", 
            this.tState = NUMBER1; else if (n >= 48 && n < 64) this.string = String.fromCharCode(n), 
            this.tState = NUMBER3; else if (32 !== n && 9 !== n && 10 !== n && 13 !== n) return this.charError(buffer, i);
        } else if (this.tState === STRING1) if (n = buffer[i], this.bytes_remaining > 0) {
            for (var j = 0; j < this.bytes_remaining; j++) this.temp_buffs[this.bytes_in_sequence][this.bytes_in_sequence - this.bytes_remaining + j] = buffer[j];
            this.appendStringBuf(this.temp_buffs[this.bytes_in_sequence]), this.bytes_in_sequence = this.bytes_remaining = 0, 
            i = i + j - 1;
        } else if (0 === this.bytes_remaining && n >= 128) {
            if (n <= 193 || n > 244) return this.onError(new Error("Invalid UTF-8 character at position " + i + " in state " + Parser.toknam(this.tState)));
            if (n >= 194 && n <= 223 && (this.bytes_in_sequence = 2), n >= 224 && n <= 239 && (this.bytes_in_sequence = 3), 
            n >= 240 && n <= 244 && (this.bytes_in_sequence = 4), this.bytes_in_sequence + i > buffer.length) {
                for (var k = 0; k <= buffer.length - 1 - i; k++) this.temp_buffs[this.bytes_in_sequence][k] = buffer[i + k];
                this.bytes_remaining = i + this.bytes_in_sequence - buffer.length, i = buffer.length - 1;
            } else this.appendStringBuf(buffer, i, i + this.bytes_in_sequence), i = i + this.bytes_in_sequence - 1;
        } else if (34 === n) this.tState = START, this.string += this.stringBuffer.toString("utf8", 0, this.stringBufferOffset), 
        this.stringBufferOffset = 0, this.onToken(STRING, this.string), this.offset += Buffer.byteLength(this.string, "utf8") + 1, 
        this.string = void 0; else if (92 === n) this.tState = STRING2; else {
            if (!(n >= 32)) return this.charError(buffer, i);
            this.appendStringChar(n);
        } else if (this.tState === STRING2) if (34 === (n = buffer[i])) this.appendStringChar(n), 
        this.tState = STRING1; else if (92 === n) this.appendStringChar(BACK_SLASH), this.tState = STRING1; else if (47 === n) this.appendStringChar(FORWARD_SLASH), 
        this.tState = STRING1; else if (98 === n) this.appendStringChar(BACKSPACE), this.tState = STRING1; else if (102 === n) this.appendStringChar(FORM_FEED), 
        this.tState = STRING1; else if (110 === n) this.appendStringChar(NEWLINE), this.tState = STRING1; else if (114 === n) this.appendStringChar(CARRIAGE_RETURN), 
        this.tState = STRING1; else if (116 === n) this.appendStringChar(TAB), this.tState = STRING1; else {
            if (117 !== n) return this.charError(buffer, i);
            this.unicode = "", this.tState = STRING3;
        } else if (this.tState === STRING3 || this.tState === STRING4 || this.tState === STRING5 || this.tState === STRING6) {
            if (!((n = buffer[i]) >= 48 && n < 64 || n > 64 && n <= 70 || n > 96 && n <= 102)) return this.charError(buffer, i);
            if (this.unicode += String.fromCharCode(n), this.tState++ === STRING6) {
                var intVal = parseInt(this.unicode, 16);
                this.unicode = void 0, void 0 !== this.highSurrogate && intVal >= 56320 && intVal < 57344 ? (this.appendStringBuf(new Buffer(String.fromCharCode(this.highSurrogate, intVal))), 
                this.highSurrogate = void 0) : void 0 === this.highSurrogate && intVal >= 55296 && intVal < 56320 ? this.highSurrogate = intVal : (void 0 !== this.highSurrogate && (this.appendStringBuf(new Buffer(String.fromCharCode(this.highSurrogate))), 
                this.highSurrogate = void 0), this.appendStringBuf(new Buffer(String.fromCharCode(intVal)))), 
                this.tState = STRING1;
            }
        } else if (this.tState === NUMBER1 || this.tState === NUMBER3) switch (n = buffer[i]) {
          case 48:
          case 49:
          case 50:
          case 51:
          case 52:
          case 53:
          case 54:
          case 55:
          case 56:
          case 57:
          case 46:
          case 101:
          case 69:
          case 43:
          case 45:
            this.string += String.fromCharCode(n), this.tState = NUMBER3;
            break;

          default:
            this.tState = START;
            var result = Number(this.string);
            if (isNaN(result)) return this.charError(buffer, i);
            this.string.match(/[0-9]+/) == this.string && result.toString() != this.string ? this.onToken(STRING, this.string) : this.onToken(NUMBER, result), 
            this.offset += this.string.length - 1, this.string = void 0, i--;
        } else if (this.tState === TRUE1) {
            if (114 !== buffer[i]) return this.charError(buffer, i);
            this.tState = TRUE2;
        } else if (this.tState === TRUE2) {
            if (117 !== buffer[i]) return this.charError(buffer, i);
            this.tState = TRUE3;
        } else if (this.tState === TRUE3) {
            if (101 !== buffer[i]) return this.charError(buffer, i);
            this.tState = START, this.onToken(TRUE, !0), this.offset += 3;
        } else if (this.tState === FALSE1) {
            if (97 !== buffer[i]) return this.charError(buffer, i);
            this.tState = FALSE2;
        } else if (this.tState === FALSE2) {
            if (108 !== buffer[i]) return this.charError(buffer, i);
            this.tState = FALSE3;
        } else if (this.tState === FALSE3) {
            if (115 !== buffer[i]) return this.charError(buffer, i);
            this.tState = FALSE4;
        } else if (this.tState === FALSE4) {
            if (101 !== buffer[i]) return this.charError(buffer, i);
            this.tState = START, this.onToken(FALSE, !1), this.offset += 4;
        } else if (this.tState === NULL1) {
            if (117 !== buffer[i]) return this.charError(buffer, i);
            this.tState = NULL2;
        } else if (this.tState === NULL2) {
            if (108 !== buffer[i]) return this.charError(buffer, i);
            this.tState = NULL3;
        } else if (this.tState === NULL3) {
            if (108 !== buffer[i]) return this.charError(buffer, i);
            this.tState = START, this.onToken(NULL, null), this.offset += 3;
        }
    }, proto.onToken = function(token, value) {}, proto.parseError = function(token, value) {
        this.tState = STOP, this.onError(new Error("Unexpected " + Parser.toknam(token) + (value ? "(" + JSON.stringify(value) + ")" : "") + " in state " + Parser.toknam(this.state)));
    }, proto.push = function() {
        this.stack.push({
            value: this.value,
            key: this.key,
            mode: this.mode
        });
    }, proto.pop = function() {
        var value = this.value, parent = this.stack.pop();
        this.value = parent.value, this.key = parent.key, this.mode = parent.mode, this.emit(value), 
        this.mode || (this.state = VALUE);
    }, proto.emit = function(value) {
        this.mode && (this.state = COMMA), this.onValue(value);
    }, proto.onValue = function(value) {}, proto.onToken = function(token, value) {
        if (this.state === VALUE) if (token === STRING || token === NUMBER || token === TRUE || token === FALSE || token === NULL) this.value && (this.value[this.key] = value), 
        this.emit(value); else if (token === LEFT_BRACE) this.push(), this.value ? this.value = this.value[this.key] = {} : this.value = {}, 
        this.key = void 0, this.state = KEY, this.mode = OBJECT; else if (token === LEFT_BRACKET) this.push(), 
        this.value ? this.value = this.value[this.key] = [] : this.value = [], this.key = 0, 
        this.mode = ARRAY, this.state = VALUE; else if (token === RIGHT_BRACE) {
            if (this.mode !== OBJECT) return this.parseError(token, value);
            this.pop();
        } else {
            if (token !== RIGHT_BRACKET) return this.parseError(token, value);
            if (this.mode !== ARRAY) return this.parseError(token, value);
            this.pop();
        } else if (this.state === KEY) if (token === STRING) this.key = value, this.state = COLON; else {
            if (token !== RIGHT_BRACE) return this.parseError(token, value);
            this.pop();
        } else if (this.state === COLON) {
            if (token !== COLON) return this.parseError(token, value);
            this.state = VALUE;
        } else {
            if (this.state !== COMMA) return this.parseError(token, value);
            if (token === COMMA) this.mode === ARRAY ? (this.key++, this.state = VALUE) : this.mode === OBJECT && (this.state = KEY); else {
                if (!(token === RIGHT_BRACKET && this.mode === ARRAY || token === RIGHT_BRACE && this.mode === OBJECT)) return this.parseError(token, value);
                this.pop();
            }
        }
    }, Parser.C = C, module.exports = Parser;
}
