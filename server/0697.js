function(module, exports, __webpack_require__) {
    var unicodeMatchers = __webpack_require__(698), multiByteCharsetMatchers = __webpack_require__(703), iso2022 = __webpack_require__(709), singleByteCharsetMatchers = __webpack_require__(713), DEFAULT_CS_RECOGNIZERS = [ __webpack_require__(727), unicodeMatchers["UTF-16BE"], unicodeMatchers["UTF-16LE"], unicodeMatchers["UTF-32BE"], unicodeMatchers["UTF-32LE"], multiByteCharsetMatchers.Shift_JIS, iso2022["ISO-2022-JP"], iso2022["ISO-2022-CN"], iso2022["ISO-2022-KR"], multiByteCharsetMatchers.GB18030, multiByteCharsetMatchers["EUC-JP"], multiByteCharsetMatchers["EUC-KR"], multiByteCharsetMatchers.Big5, singleByteCharsetMatchers["ISO-8859-1"], singleByteCharsetMatchers["ISO-8859-2"], singleByteCharsetMatchers["ISO-8859-5"], singleByteCharsetMatchers["ISO-8859-6"], singleByteCharsetMatchers["ISO-8859-7"], singleByteCharsetMatchers["ISO-8859-8-I"], singleByteCharsetMatchers["ISO-8859-8"], singleByteCharsetMatchers["windows-1251"], singleByteCharsetMatchers["windows-1256"], singleByteCharsetMatchers["KOIR8-R"], singleByteCharsetMatchers["ISO-8859-9"] ], ALL_CS_RECOGNIZERS = DEFAULT_CS_RECOGNIZERS.concat([ singleByteCharsetMatchers.IBM420_ltr, singleByteCharsetMatchers.IBM420_rtl, singleByteCharsetMatchers.IBM424_ltr, singleByteCharsetMatchers.IBM424_rtl ]);
    module.exports = function(input, matchers) {
        for (var matchersLength = (matchers = matchers || DEFAULT_CS_RECOGNIZERS).length, stat = (function(input) {
            for (var inputLength = input.length, byteStats = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], srci = 0; srci < inputLength; srci++) byteStats[255 & input[srci]]++;
            for (var c1Bytes = !1, i = 128; i <= 159; i += 1) if (0 != byteStats[i]) {
                c1Bytes = !0;
                break;
            }
            return {
                c1Bytes: c1Bytes,
                byteStats: byteStats
            };
        })(input), matches = [], i = 0; i < matchersLength; i++) {
            var m = (0, matchers[i])(input, stat);
            null != m && matches.push(m);
        }
        return matches.sort((function(a, b) {
            return b.confidence - a.confidence;
        })), matches;
    }, module.exports.ALL_CS_RECOGNIZERS = ALL_CS_RECOGNIZERS, module.exports.DEFAULT_CS_RECOGNIZERS = DEFAULT_CS_RECOGNIZERS;
}
