function(module, exports, __webpack_require__) {
    function Receiver() {
        if (this instanceof Receiver == 0) throw new TypeError("Classes can't be function-called");
        this.state = 0, this.buffers = [], this.messageEnd = -1, this.spanLength = 0, this.dead = !1, 
        this.onerror = function() {}, this.ontext = function() {}, this.onbinary = function() {}, 
        this.onclose = function() {}, this.onping = function() {}, this.onpong = function() {};
    }
    __webpack_require__(0), module.exports = Receiver, Receiver.prototype.add = function(data) {
        if (!this.dead) for (var self = this; data; ) data = doAdd();
        function doAdd() {
            if (0 === self.state) {
                if (2 == data.length && 255 == data[0] && 0 == data[1]) return self.reset(), void self.onclose();
                if (128 === data[0]) self.messageEnd = 0, self.state = 2, data = data.slice(1); else {
                    if (0 !== data[0]) return void self.error("payload must start with 0x00 byte", !0);
                    data = data.slice(1), self.state = 1;
                }
            }
            if (2 === self.state) {
                for (var i = 0; i < data.length && 128 & data[i]; ) self.messageEnd = 128 * self.messageEnd + (127 & data[i]), 
                ++i;
                i < data.length && (self.messageEnd = 128 * self.messageEnd + (127 & data[i]), self.state = 3, 
                ++i), i > 0 && (data = data.slice(i));
            }
            if (3 === self.state) {
                var dataleft = self.messageEnd - self.spanLength;
                return data.length >= dataleft ? (self.buffers.push(data), self.spanLength += dataleft, 
                self.messageEnd = dataleft, self.parse()) : (self.buffers.push(data), void (self.spanLength += data.length));
            }
            if (self.buffers.push(data), -1 != (self.messageEnd = (function(buffer, byte) {
                for (var i = 0, l = buffer.length; i < l; ++i) if (255 === buffer[i]) return i;
                return -1;
            })(data))) return self.spanLength += self.messageEnd, self.parse();
            self.spanLength += data.length;
        }
    }, Receiver.prototype.cleanup = function() {
        this.dead = !0, this.state = 0, this.buffers = [];
    }, Receiver.prototype.parse = function() {
        for (var output = new Buffer(this.spanLength), outputIndex = 0, bi = 0, bl = this.buffers.length; bi < bl - 1; ++bi) {
            var buffer = this.buffers[bi];
            buffer.copy(output, outputIndex), outputIndex += buffer.length;
        }
        var lastBuffer = this.buffers[this.buffers.length - 1];
        this.messageEnd > 0 && lastBuffer.copy(output, outputIndex, 0, this.messageEnd), 
        1 !== this.state && --this.messageEnd;
        var tail = null;
        return this.messageEnd < lastBuffer.length - 1 && (tail = lastBuffer.slice(this.messageEnd + 1)), 
        this.reset(), this.ontext(output.toString("utf8")), tail;
    }, Receiver.prototype.error = function(reason, terminate) {
        if (!this.dead) return this.reset(), "string" == typeof reason ? this.onerror(new Error(reason), terminate) : reason.constructor == Error ? this.onerror(reason, terminate) : this.onerror(new Error("An error occured"), terminate), 
        this;
    }, Receiver.prototype.reset = function(reason) {
        this.dead || (this.state = 0, this.buffers = [], this.messageEnd = -1, this.spanLength = 0);
    };
}
