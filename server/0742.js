function(module, exports, __webpack_require__) {
    var fs = __webpack_require__(2), ee = __webpack_require__(5).EventEmitter, Api = __webpack_require__(743), os = module.exports = function(user, password, lang, ua) {
        this.api = new Api, this.user = user, this.password = password, this.lang = lang || "en", 
        this.ua = ua || "NodeOpensubtitles v0.0.1";
    };
    os.prototype.__proto__ = ee.prototype, os.prototype.checkMovieHash = function(t_hash, cb) {
        var self = this;
        this.api.LogIn((function(err, res) {
            if (err) return cb(err);
            var token = res.token;
            self.api.CheckMovieHash((function(err, res) {
                if (err) return cb(err);
                cb(null, res);
            }), token, t_hash);
        }), this.user, this.password, this.lang, this.ua);
    }, os.prototype.computeHash = function(path, cb) {
        var buf_start = new Buffer(131072), buf_end = new Buffer(131072), file_size = 0, self = this, t_chksum = [];
        function checksumReady(chksum_part, name) {
            if (self.emit("checksum-ready", chksum_part, name), t_chksum.push(chksum_part), 
            3 == t_chksum.length) {
                var chksum = self.sumHex64bits(t_chksum[0], t_chksum[1]);
                chksum = (chksum = self.sumHex64bits(chksum, t_chksum[2])).substr(-16), cb(null, self.padLeft(chksum, "0", 16));
            }
        }
        fs.stat(path, (function(err, stat) {
            if (err) return cb(err);
            checksumReady((file_size = stat.size).toString(16), "filesize"), fs.open(path, "r", (function(err, fd) {
                if (err) return cb(err);
                var t_buffers = [ {
                    buf: buf_start,
                    offset: 0
                }, {
                    buf: buf_end,
                    offset: file_size - 65536
                } ];
                for (var i in t_buffers) fs.read(fd, t_buffers[i].buf, 0, 131072, t_buffers[i].offset, (function(err, bytesRead, buffer) {
                    if (err) return cb(err);
                    checksumReady(self.checksumBuffer(buffer, 16), "buf?");
                }));
            }));
        }));
    }, os.prototype.read64LE = function(buffer, offset) {
        for (var ret_64_be = buffer.toString("hex", 8 * offset, 8 * (offset + 1)), t = [], i = 0; i < 8; i++) t.push(ret_64_be.substr(2 * i, 2));
        return t.reverse(), t.join("");
    }, os.prototype.checksumBuffer = function(buf, length) {
        for (var checksum = 0, checksum_hex = 0, i = 0; i < buf.length / length; i++) checksum_hex = this.read64LE(buf, i), 
        checksum = this.sumHex64bits(checksum.toString(), checksum_hex).substr(-16);
        return checksum;
    }, os.prototype.sumHex64bits = function(n1, n2) {
        n1.length < 16 && (n1 = this.padLeft(n1, "0", 16)), n2.length < 16 && (n2 = this.padLeft(n2, "0", 16));
        var n1_0 = n1.substr(0, 8), n2_0 = n2.substr(0, 8), i_0 = parseInt(n1_0, 16) + parseInt(n2_0, 16), n1_1 = n1.substr(8, 8), n2_1 = n2.substr(8, 8), h_1 = (parseInt(n1_1, 16) + parseInt(n2_1, 16)).toString(16), i_1_over = 0;
        return h_1.length > 8 ? i_1_over = parseInt(h_1.substr(0, h_1.length - 8), 16) : h_1 = this.padLeft(h_1, "0", 8), 
        (i_1_over + i_0).toString(16) + h_1.substr(-8);
    }, os.prototype.padLeft = function(str, c, length) {
        for (;str.length < length; ) str = c.toString() + str;
        return str;
    };
}
