function(module, exports, __webpack_require__) {
    var ip = __webpack_require__(116);
    function IPSet(start, end) {
        this.start = start, this.end = end, this.max = end, this.depth = 1, this.left = null, 
        this.right = null;
    }
    IPSet.prototype.add = function(start, end) {
        var d = start - this.start, update = !1;
        return 0 === d && this.end < end ? (this.end = end, update = !0) : d < 0 ? this.left ? (update = this.left.add(start, end)) && this._balance() : (this.left = new IPSet(start, end), 
        update = !0) : d > 0 && (this.right ? (update = this.right.add(start, end)) && this._balance() : (this.right = new IPSet(start, end), 
        update = !0)), update && this._update(), update;
    }, IPSet.prototype.contains = function(addr) {
        for (var node = this; node && !(addr >= node.start && addr <= node.end); ) node = node.left && node.left.max >= addr ? node.left : node.right;
        return !!node;
    }, IPSet.prototype._balance = function() {
        var ldepth = this.left ? this.left.depth : 0, rdepth = this.right ? this.right.depth : 0;
        if (ldepth > rdepth + 1) (this.left.left ? this.left.left.depth : 0) < (this.left.right ? this.left.right.depth : 0) && this.left._rotateRR(), 
        this._rotateLL(); else if (ldepth + 1 < rdepth) {
            var rrdepth = this.right.right ? this.right.right.depth : 0;
            (this.right.left ? this.right.left.depth : 0) > rrdepth && this.right._rotateLL(), 
            this._rotateRR();
        }
    }, IPSet.prototype._rotateLL = function() {
        var _start = this.start, _end = this.end, _right = this.right;
        this.start = this.left.start, this.end = this.left.end, this.right = this.left, 
        this.left = this.left.left, this.right.left = this.right.right, this.right.right = _right, 
        this.right.start = _start, this.right.end = _end, this.right._update(), this._update();
    }, IPSet.prototype._rotateRR = function() {
        var _start = this.start, _end = this.end, _left = this.left;
        this.start = this.right.start, this.end = this.right.end, this.end = this.right.end, 
        this.left = this.right, this.right = this.right.right, this.left.right = this.left.left, 
        this.left.left = _left, this.left.start = _start, this.left.end = _end, this.left._update(), 
        this._update();
    }, IPSet.prototype._update = function() {
        this.depth = 1, this.left && (this.depth = this.left.depth + 1), this.right && this.depth <= this.right.depth && (this.depth = this.right.depth + 1), 
        this.max = Math.max(this.end, this.left ? this.left.max : 0, this.right ? this.right.max : 0);
    }, module.exports = function(blocklist) {
        var tree = null, self = {
            add: function(start, end) {
                if (start) {
                    if ("object" == typeof start && (end = start.end, start = start.start), "string" == typeof start && /\/\d{1,2}/.test(start)) {
                        var ipSubnet = ip.cidrSubnet(start);
                        start = ipSubnet.networkAddress, end = ipSubnet.broadcastAddress;
                    }
                    if ("number" != typeof start && (start = ip.toLong(start)), end || (end = start), 
                    "number" != typeof end && (end = ip.toLong(end)), start < 0 || end > 4294967295 || end < start) throw new Error("Invalid block range");
                    tree ? tree.add(start, end) : tree = new IPSet(start, end);
                }
            },
            contains: function(addr) {
                return !!tree && ("number" != typeof addr && (addr = ip.toLong(addr)), tree.contains(addr));
            }
        };
        return Array.isArray(blocklist) && blocklist.forEach((function(block) {
            self.add(block);
        })), self;
    };
}
