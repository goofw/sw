function(module, exports, __webpack_require__) {
    function nextChar(it) {
        it.index = it.nextIndex, it.error = !1;
        var firstByte, secondByte = 0, thirdByte = 0;
        return (firstByte = it.charValue = it.nextByte()) < 0 ? it.done = !0 : firstByte <= 141 || (secondByte = it.nextByte(), 
        it.charValue = it.charValue << 8 | secondByte, firstByte >= 161 && firstByte <= 254 ? secondByte < 161 && (it.error = !0) : 142 != firstByte ? 143 == firstByte && (thirdByte = it.nextByte(), 
        it.charValue = it.charValue << 8 | thirdByte, thirdByte < 161 && (it.error = !0)) : secondByte < 161 && (it.error = !0)), 
        0 == it.done;
    }
    __webpack_require__(18);
    var base = __webpack_require__(131);
    module.exports = function(commonChars) {
        return base(commonChars, nextChar);
    };
}
