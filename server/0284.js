function(module, exports, __webpack_require__) {
    !(function(moment) {
        "use strict";
        var symbolMap = {
            1: "١",
            2: "٢",
            3: "٣",
            4: "٤",
            5: "٥",
            6: "٦",
            7: "٧",
            8: "٨",
            9: "٩",
            0: "٠"
        }, numberMap = {
            "١": "1",
            "٢": "2",
            "٣": "3",
            "٤": "4",
            "٥": "5",
            "٦": "6",
            "٧": "7",
            "٨": "8",
            "٩": "9",
            "٠": "0"
        }, pluralForm = function(n) {
            return 0 === n ? 0 : 1 === n ? 1 : 2 === n ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5;
        }, plurals = {
            s: [ "أقل من ثانية", "ثانية واحدة", [ "ثانيتان", "ثانيتين" ], "%d ثوان", "%d ثانية", "%d ثانية" ],
            m: [ "أقل من دقيقة", "دقيقة واحدة", [ "دقيقتان", "دقيقتين" ], "%d دقائق", "%d دقيقة", "%d دقيقة" ],
            h: [ "أقل من ساعة", "ساعة واحدة", [ "ساعتان", "ساعتين" ], "%d ساعات", "%d ساعة", "%d ساعة" ],
            d: [ "أقل من يوم", "يوم واحد", [ "يومان", "يومين" ], "%d أيام", "%d يومًا", "%d يوم" ],
            M: [ "أقل من شهر", "شهر واحد", [ "شهران", "شهرين" ], "%d أشهر", "%d شهرا", "%d شهر" ],
            y: [ "أقل من عام", "عام واحد", [ "عامان", "عامين" ], "%d أعوام", "%d عامًا", "%d عام" ]
        }, pluralize = function(u) {
            return function(number, withoutSuffix, string, isFuture) {
                var f = pluralForm(number), str = plurals[u][pluralForm(number)];
                return 2 === f && (str = str[withoutSuffix ? 0 : 1]), str.replace(/%d/i, number);
            };
        }, months = [ "كانون الثاني يناير", "شباط فبراير", "آذار مارس", "نيسان أبريل", "أيار مايو", "حزيران يونيو", "تموز يوليو", "آب أغسطس", "أيلول سبتمبر", "تشرين الأول أكتوبر", "تشرين الثاني نوفمبر", "كانون الأول ديسمبر" ];
        moment.defineLocale("ar", {
            months: months,
            monthsShort: months,
            weekdays: "الأحد_الإثنين_الثلاثاء_الأربعاء_الخميس_الجمعة_السبت".split("_"),
            weekdaysShort: "أحد_إثنين_ثلاثاء_أربعاء_خميس_جمعة_سبت".split("_"),
            weekdaysMin: "ح_ن_ث_ر_خ_ج_س".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                LTS: "HH:mm:ss",
                L: "D/‏M/‏YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY HH:mm",
                LLLL: "dddd D MMMM YYYY HH:mm"
            },
            meridiemParse: /ص|م/,
            isPM: function(input) {
                return "م" === input;
            },
            meridiem: function(hour, minute, isLower) {
                return hour < 12 ? "ص" : "م";
            },
            calendar: {
                sameDay: "[اليوم عند الساعة] LT",
                nextDay: "[غدًا عند الساعة] LT",
                nextWeek: "dddd [عند الساعة] LT",
                lastDay: "[أمس عند الساعة] LT",
                lastWeek: "dddd [عند الساعة] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "بعد %s",
                past: "منذ %s",
                s: pluralize("s"),
                m: pluralize("m"),
                mm: pluralize("m"),
                h: pluralize("h"),
                hh: pluralize("h"),
                d: pluralize("d"),
                dd: pluralize("d"),
                M: pluralize("M"),
                MM: pluralize("M"),
                y: pluralize("y"),
                yy: pluralize("y")
            },
            preparse: function(string) {
                return string.replace(/\u200f/g, "").replace(/[١٢٣٤٥٦٧٨٩٠]/g, (function(match) {
                    return numberMap[match];
                })).replace(/،/g, ",");
            },
            postformat: function(string) {
                return string.replace(/\d/g, (function(match) {
                    return symbolMap[match];
                })).replace(/,/g, "،");
            },
            week: {
                dow: 6,
                doy: 12
            }
        });
    })(__webpack_require__(1));
}
