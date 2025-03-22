function(module, exports, __webpack_require__) {
    var CharsetMatch = __webpack_require__(18), match = __webpack_require__(131)([ 41377, 41378, 41379, 41380, 41392, 41393, 41457, 41459, 41889, 41900, 41914, 45480, 45496, 45502, 45755, 46025, 46070, 46323, 46525, 46532, 46563, 46767, 46804, 46816, 47010, 47016, 47037, 47062, 47069, 47284, 47327, 47350, 47531, 47561, 47576, 47610, 47613, 47821, 48039, 48086, 48097, 48122, 48316, 48347, 48382, 48588, 48845, 48861, 49076, 49094, 49097, 49332, 49389, 49611, 49883, 50119, 50396, 50410, 50636, 50935, 51192, 51371, 51403, 51413, 51431, 51663, 51706, 51889, 51893, 51911, 51920, 51926, 51957, 51965, 52460, 52728, 52906, 52932, 52946, 52965, 53173, 53186, 53206, 53442, 53445, 53456, 53460, 53671, 53930, 53938, 53941, 53947, 53972, 54211, 54224, 54269, 54466, 54490, 54754, 54992 ], (function(it) {
        it.index = it.nextIndex, it.error = !1;
        var firstByte = 0, secondByte = 0, thirdByte = 0, fourthByte = 0;
        buildChar: if ((firstByte = it.charValue = it.nextByte()) < 0) it.done = !0; else if (!(firstByte <= 128) && (secondByte = it.nextByte(), 
        it.charValue = it.charValue << 8 | secondByte, firstByte >= 129 && firstByte <= 254)) {
            if (secondByte >= 64 && secondByte <= 126 || secondByte >= 80 && secondByte <= 254) break buildChar;
            if (secondByte >= 48 && secondByte <= 57 && (thirdByte = it.nextByte()) >= 129 && thirdByte <= 254 && (fourthByte = it.nextByte()) >= 48 && fourthByte <= 57) {
                it.charValue = it.charValue << 16 | thirdByte << 8 | fourthByte;
                break buildChar;
            }
            it.error = !0;
        }
        return 0 == it.done;
    }));
    module.exports = function(input) {
        var confidence = match(input);
        return 0 == confidence ? null : new CharsetMatch(confidence, "GB18030", "zh");
    };
}
