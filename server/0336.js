function(module, exports, __webpack_require__) {
    !(function(moment) {
        "use strict";
        var symbolMap = {
            1: "१",
            2: "२",
            3: "३",
            4: "४",
            5: "५",
            6: "६",
            7: "७",
            8: "८",
            9: "९",
            0: "०"
        }, numberMap = {
            "१": "1",
            "२": "2",
            "३": "3",
            "४": "4",
            "५": "5",
            "६": "6",
            "७": "7",
            "८": "8",
            "९": "9",
            "०": "0"
        };
        moment.defineLocale("mr", {
            months: "जानेवारी_फेब्रुवारी_मार्च_एप्रिल_मे_जून_जुलै_ऑगस्ट_सप्टेंबर_ऑक्टोबर_नोव्हेंबर_डिसेंबर".split("_"),
            monthsShort: "जाने._फेब्रु._मार्च._एप्रि._मे._जून._जुलै._ऑग._सप्टें._ऑक्टो._नोव्हें._डिसें.".split("_"),
            weekdays: "रविवार_सोमवार_मंगळवार_बुधवार_गुरूवार_शुक्रवार_शनिवार".split("_"),
            weekdaysShort: "रवि_सोम_मंगळ_बुध_गुरू_शुक्र_शनि".split("_"),
            weekdaysMin: "र_सो_मं_बु_गु_शु_श".split("_"),
            longDateFormat: {
                LT: "A h:mm वाजता",
                LTS: "A h:mm:ss वाजता",
                L: "DD/MM/YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY, A h:mm वाजता",
                LLLL: "dddd, D MMMM YYYY, A h:mm वाजता"
            },
            calendar: {
                sameDay: "[आज] LT",
                nextDay: "[उद्या] LT",
                nextWeek: "dddd, LT",
                lastDay: "[काल] LT",
                lastWeek: "[मागील] dddd, LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "%s नंतर",
                past: "%s पूर्वी",
                s: "सेकंद",
                m: "एक मिनिट",
                mm: "%d मिनिटे",
                h: "एक तास",
                hh: "%d तास",
                d: "एक दिवस",
                dd: "%d दिवस",
                M: "एक महिना",
                MM: "%d महिने",
                y: "एक वर्ष",
                yy: "%d वर्षे"
            },
            preparse: function(string) {
                return string.replace(/[१२३४५६७८९०]/g, (function(match) {
                    return numberMap[match];
                }));
            },
            postformat: function(string) {
                return string.replace(/\d/g, (function(match) {
                    return symbolMap[match];
                }));
            },
            meridiemParse: /रात्री|सकाळी|दुपारी|सायंकाळी/,
            meridiemHour: function(hour, meridiem) {
                return 12 === hour && (hour = 0), "रात्री" === meridiem ? hour < 4 ? hour : hour + 12 : "सकाळी" === meridiem ? hour : "दुपारी" === meridiem ? hour >= 10 ? hour : hour + 12 : "सायंकाळी" === meridiem ? hour + 12 : void 0;
            },
            meridiem: function(hour, minute, isLower) {
                return hour < 4 ? "रात्री" : hour < 10 ? "सकाळी" : hour < 17 ? "दुपारी" : hour < 20 ? "सायंकाळी" : "रात्री";
            },
            week: {
                dow: 0,
                doy: 6
            }
        });
    })(__webpack_require__(1));
}
