function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = {
        shiftjis: {
            type: "_dbcs",
            table: function() {
                return __webpack_require__(531);
            },
            encodeAdd: {
                "¥": 92,
                "‾": 126
            },
            encodeSkipVals: [ {
                from: 60736,
                to: 63808
            } ]
        },
        csshiftjis: "shiftjis",
        mskanji: "shiftjis",
        sjis: "shiftjis",
        windows31j: "shiftjis",
        ms31j: "shiftjis",
        xsjis: "shiftjis",
        windows932: "shiftjis",
        ms932: "shiftjis",
        932: "shiftjis",
        cp932: "shiftjis",
        eucjp: {
            type: "_dbcs",
            table: function() {
                return __webpack_require__(532);
            },
            encodeAdd: {
                "¥": 92,
                "‾": 126
            }
        },
        gb2312: "cp936",
        gb231280: "cp936",
        gb23121980: "cp936",
        csgb2312: "cp936",
        csiso58gb231280: "cp936",
        euccn: "cp936",
        windows936: "cp936",
        ms936: "cp936",
        936: "cp936",
        cp936: {
            type: "_dbcs",
            table: function() {
                return __webpack_require__(157);
            }
        },
        gbk: {
            type: "_dbcs",
            table: function() {
                return __webpack_require__(157).concat(__webpack_require__(244));
            }
        },
        xgbk: "gbk",
        isoir58: "gbk",
        gb18030: {
            type: "_dbcs",
            table: function() {
                return __webpack_require__(157).concat(__webpack_require__(244));
            },
            gb18030: function() {
                return __webpack_require__(533);
            },
            encodeSkipVals: [ 128 ],
            encodeAdd: {
                "€": 41699
            }
        },
        chinese: "gb18030",
        windows949: "cp949",
        ms949: "cp949",
        949: "cp949",
        cp949: {
            type: "_dbcs",
            table: function() {
                return __webpack_require__(534);
            }
        },
        cseuckr: "cp949",
        csksc56011987: "cp949",
        euckr: "cp949",
        isoir149: "cp949",
        korean: "cp949",
        ksc56011987: "cp949",
        ksc56011989: "cp949",
        ksc5601: "cp949",
        windows950: "cp950",
        ms950: "cp950",
        950: "cp950",
        cp950: {
            type: "_dbcs",
            table: function() {
                return __webpack_require__(245);
            }
        },
        big5: "big5hkscs",
        big5hkscs: {
            type: "_dbcs",
            table: function() {
                return __webpack_require__(245).concat(__webpack_require__(535));
            },
            encodeSkipVals: [ 41676 ]
        },
        cnbig5: "big5hkscs",
        csbig5: "big5hkscs",
        xxbig5: "big5hkscs"
    };
}
