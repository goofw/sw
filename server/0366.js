function(module, exports, __webpack_require__) {
    !(function(moment) {
        "use strict";
        moment.defineLocale("zh-cn", {
            months: "一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split("_"),
            monthsShort: "1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),
            weekdays: "星期日_星期一_星期二_星期三_星期四_星期五_星期六".split("_"),
            weekdaysShort: "周日_周一_周二_周三_周四_周五_周六".split("_"),
            weekdaysMin: "日_一_二_三_四_五_六".split("_"),
            longDateFormat: {
                LT: "Ah点mm分",
                LTS: "Ah点m分s秒",
                L: "YYYY-MM-DD",
                LL: "YYYY年MMMD日",
                LLL: "YYYY年MMMD日Ah点mm分",
                LLLL: "YYYY年MMMD日ddddAh点mm分",
                l: "YYYY-MM-DD",
                ll: "YYYY年MMMD日",
                lll: "YYYY年MMMD日Ah点mm分",
                llll: "YYYY年MMMD日ddddAh点mm分"
            },
            meridiemParse: /凌晨|早上|上午|中午|下午|晚上/,
            meridiemHour: function(hour, meridiem) {
                return 12 === hour && (hour = 0), "凌晨" === meridiem || "早上" === meridiem || "上午" === meridiem ? hour : "下午" === meridiem || "晚上" === meridiem ? hour + 12 : hour >= 11 ? hour : hour + 12;
            },
            meridiem: function(hour, minute, isLower) {
                var hm = 100 * hour + minute;
                return hm < 600 ? "凌晨" : hm < 900 ? "早上" : hm < 1130 ? "上午" : hm < 1230 ? "中午" : hm < 1800 ? "下午" : "晚上";
            },
            calendar: {
                sameDay: function() {
                    return 0 === this.minutes() ? "[今天]Ah[点整]" : "[今天]LT";
                },
                nextDay: function() {
                    return 0 === this.minutes() ? "[明天]Ah[点整]" : "[明天]LT";
                },
                lastDay: function() {
                    return 0 === this.minutes() ? "[昨天]Ah[点整]" : "[昨天]LT";
                },
                nextWeek: function() {
                    var startOfWeek, prefix;
                    return startOfWeek = moment().startOf("week"), prefix = this.unix() - startOfWeek.unix() >= 604800 ? "[下]" : "[本]", 
                    0 === this.minutes() ? prefix + "dddAh点整" : prefix + "dddAh点mm";
                },
                lastWeek: function() {
                    var startOfWeek, prefix;
                    return startOfWeek = moment().startOf("week"), prefix = this.unix() < startOfWeek.unix() ? "[上]" : "[本]", 
                    0 === this.minutes() ? prefix + "dddAh点整" : prefix + "dddAh点mm";
                },
                sameElse: "LL"
            },
            ordinalParse: /\d{1,2}(日|月|周)/,
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
                    return number + "周";

                  default:
                    return number;
                }
            },
            relativeTime: {
                future: "%s内",
                past: "%s前",
                s: "几秒",
                m: "1 分钟",
                mm: "%d 分钟",
                h: "1 小时",
                hh: "%d 小时",
                d: "1 天",
                dd: "%d 天",
                M: "1 个月",
                MM: "%d 个月",
                y: "1 年",
                yy: "%d 年"
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    })(__webpack_require__(1));
}
