function(module, exports, __webpack_require__) {
    var CharsetMatch = __webpack_require__(18), match = __webpack_require__(131)([ 41280, 41281, 41282, 41283, 41287, 41289, 41333, 41334, 42048, 42054, 42055, 42056, 42065, 42068, 42071, 42084, 42090, 42092, 42103, 42147, 42148, 42151, 42177, 42190, 42193, 42207, 42216, 42237, 42304, 42312, 42328, 42345, 42445, 42471, 42583, 42593, 42594, 42600, 42608, 42664, 42675, 42681, 42707, 42715, 42726, 42738, 42816, 42833, 42841, 42970, 43171, 43173, 43181, 43217, 43219, 43236, 43260, 43456, 43474, 43507, 43627, 43706, 43710, 43724, 43772, 44103, 44111, 44208, 44242, 44377, 44745, 45024, 45290, 45423, 45747, 45764, 45935, 46156, 46158, 46412, 46501, 46525, 46544, 46552, 46705, 47085, 47207, 47428, 47832, 47940, 48033, 48593, 49860, 50105, 50240, 50271 ], (function(it) {
        it.index = it.nextIndex, it.error = !1;
        var firstByte = it.charValue = it.nextByte();
        if (firstByte < 0) return !1;
        if (firstByte <= 127 || 255 == firstByte) return !0;
        var secondByte = it.nextByte();
        return !(secondByte < 0 || (it.charValue = it.charValue << 8 | secondByte, (secondByte < 64 || 127 == secondByte || 255 == secondByte) && (it.error = !0), 
        0));
    }));
    module.exports = function(input) {
        var confidence = match(input);
        return 0 == confidence ? null : new CharsetMatch(confidence, "Big5", "zh");
    };
}
