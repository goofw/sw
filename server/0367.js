function(module, exports, __webpack_require__) {
    !(function(moment) {
        "use strict";
        moment.defineLocale("zh-tw", {
            months: "一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split("_"),
            monthsShort: "1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),
            weekdays: "星期日_星期一_星期二_星期三_星期四_星期五_星期六".split("_"),
            weekdaysShort: "週日_週一_週二_週三_週四_週五_週六".split("_"),
            weekdaysMin: "日_一_二_三_四_五_六".split("_"),
            longDateFormat: {
                LT: "Ah點mm分",
                LTS: "Ah點m分s秒",
                L: "YYYY年MMMD日",
                LL: "YYYY年MMMD日",
                LLL: "YYYY年MMMD日Ah點mm分",
                LLLL: "YYYY年MMMD日ddddAh點mm分",
                l: "YYYY年MMMD日",
                ll: "YYYY年MMMD日",
                lll: "YYYY年MMMD日Ah點mm分",
                llll: "YYYY年MMMD日ddddAh點mm分"
            },
            meridiemParse: /早上|上午|中午|下午|晚上/,
            meridiemHour: function(hour, meridiem) {
                return 12 === hour && (hour = 0), "早上" === meridiem || "上午" === meridiem ? hour : "中午" === meridiem ? hour >= 11 ? hour : hour + 12 : "下午" === meridiem || "晚上" === meridiem ? hour + 12 : void 0;
            },
            meridiem: function(hour, minute, isLower) {
                var hm = 100 * hour + minute;
                return hm < 900 ? "早上" : hm < 1130 ? "上午" : hm < 1230 ? "中午" : hm < 1800 ? "下午" : "晚上";
            },
            calendar: {
                sameDay: "[今天]LT",
                nextDay: "[明天]LT",
                nextWeek: "[下]ddddLT",
                lastDay: "[昨天]LT",
                lastWeek: "[上]ddddLT",
                sameElse: "L"
            },
            ordinalParse: /\d{1,2}(日|月|週)/,
            ordinal: function(number, period) {
                switch (period) {
                  case "d":
                  case "D":
                  case "DDD":
                    return number + "日";

                  case "M":
                    return number + "月";

                  case "w":
                  case "W":
                    return number + "週";

                  default:
                    return number;
                }
            },
            relativeTime: {
                future: "%s內",
                past: "%s前",
                s: "幾秒",
                m: "一分鐘",
                mm: "%d分鐘",
                h: "一小時",
                hh: "%d小時",
                d: "一天",
                dd: "%d天",
                M: "一個月",
                MM: "%d個月",
                y: "一年",
                yy: "%d年"
            }
        });
    })(__webpack_require__(1));
}
