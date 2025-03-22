function(module, exports, __webpack_require__) {
    var CharsetMatch = __webpack_require__(18), match = __webpack_require__(131)([ 33088, 33089, 33090, 33093, 33115, 33129, 33130, 33141, 33142, 33440, 33442, 33444, 33449, 33450, 33451, 33453, 33455, 33457, 33459, 33461, 33463, 33469, 33470, 33473, 33476, 33477, 33478, 33480, 33481, 33484, 33485, 33500, 33504, 33511, 33512, 33513, 33514, 33520, 33521, 33601, 33603, 33614, 33615, 33624, 33630, 33634, 33639, 33653, 33654, 33673, 33674, 33675, 33677, 33683, 36502, 37882, 38314 ], (function(it) {
        it.index = it.nextIndex, it.error = !1;
        var firstByte = it.charValue = it.nextByte();
        if (firstByte < 0) return !1;
        if (firstByte <= 127 || firstByte > 160 && firstByte <= 223) return !0;
        var secondByte = it.nextByte();
        return !(secondByte < 0 || (it.charValue = firstByte << 8 | secondByte, secondByte >= 64 && secondByte <= 127 || secondByte >= 128 && secondByte <= 255 || (it.error = !0), 
        0));
    }));
    module.exports = function(input) {
        var confidence = match(input);
        return 0 == confidence ? null : new CharsetMatch(confidence, "Shift_JIS", "ja");
    };
}
