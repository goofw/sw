function(module, exports, __webpack_require__) {
    !(function(moment) {
        "use strict";
        function relativeTimeWithPlural(number, withoutSuffix, key) {
            return "m" === key ? withoutSuffix ? "минута" : "минуту" : number + " " + (num = +number, 
            forms = {
                mm: withoutSuffix ? "минута_минуты_минут" : "минуту_минуты_минут",
                hh: "час_часа_часов",
                dd: "день_дня_дней",
                MM: "месяц_месяца_месяцев",
                yy: "год_года_лет"
            }[key].split("_"), num % 10 == 1 && num % 100 != 11 ? forms[0] : num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2]);
            var num, forms;
        }
        moment.defineLocale("ru", {
            months: function(m, format) {
                return {
                    nominative: "январь_февраль_март_апрель_май_июнь_июль_август_сентябрь_октябрь_ноябрь_декабрь".split("_"),
                    accusative: "января_февраля_марта_апреля_мая_июня_июля_августа_сентября_октября_ноября_декабря".split("_")
                }[/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/.test(format) ? "accusative" : "nominative"][m.month()];
            },
            monthsShort: function(m, format) {
                return {
                    nominative: "янв_фев_март_апр_май_июнь_июль_авг_сен_окт_ноя_дек".split("_"),
                    accusative: "янв_фев_мар_апр_мая_июня_июля_авг_сен_окт_ноя_дек".split("_")
                }[/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/.test(format) ? "accusative" : "nominative"][m.month()];
            },
            weekdays: function(m, format) {
                return {
                    nominative: "воскресенье_понедельник_вторник_среда_четверг_пятница_суббота".split("_"),
                    accusative: "воскресенье_понедельник_вторник_среду_четверг_пятницу_субботу".split("_")
                }[/\[ ?[Вв] ?(?:прошлую|следующую|эту)? ?\] ?dddd/.test(format) ? "accusative" : "nominative"][m.day()];
            },
            weekdaysShort: "вс_пн_вт_ср_чт_пт_сб".split("_"),
            weekdaysMin: "вс_пн_вт_ср_чт_пт_сб".split("_"),
            monthsParse: [ /^янв/i, /^фев/i, /^мар/i, /^апр/i, /^ма[й|я]/i, /^июн/i, /^июл/i, /^авг/i, /^сен/i, /^окт/i, /^ноя/i, /^дек/i ],
            longDateFormat: {
                LT: "HH:mm",
                LTS: "HH:mm:ss",
                L: "DD.MM.YYYY",
                LL: "D MMMM YYYY г.",
                LLL: "D MMMM YYYY г., HH:mm",
                LLLL: "dddd, D MMMM YYYY г., HH:mm"
            },
            calendar: {
                sameDay: "[Сегодня в] LT",
                nextDay: "[Завтра в] LT",
                lastDay: "[Вчера в] LT",
                nextWeek: function() {
                    return 2 === this.day() ? "[Во] dddd [в] LT" : "[В] dddd [в] LT";
                },
                lastWeek: function(now) {
                    if (now.week() === this.week()) return 2 === this.day() ? "[Во] dddd [в] LT" : "[В] dddd [в] LT";
                    switch (this.day()) {
                      case 0:
                        return "[В прошлое] dddd [в] LT";

                      case 1:
                      case 2:
                      case 4:
                        return "[В прошлый] dddd [в] LT";

                      case 3:
                      case 5:
                      case 6:
                        return "[В прошлую] dddd [в] LT";
                    }
                },
                sameElse: "L"
            },
            relativeTime: {
                future: "через %s",
                past: "%s назад",
                s: "несколько секунд",
                m: relativeTimeWithPlural,
                mm: relativeTimeWithPlural,
                h: "час",
                hh: relativeTimeWithPlural,
                d: "день",
                dd: relativeTimeWithPlural,
                M: "месяц",
                MM: relativeTimeWithPlural,
                y: "год",
                yy: relativeTimeWithPlural
            },
            meridiemParse: /ночи|утра|дня|вечера/i,
            isPM: function(input) {
                return /^(дня|вечера)$/.test(input);
            },
            meridiem: function(hour, minute, isLower) {
                return hour < 4 ? "ночи" : hour < 12 ? "утра" : hour < 17 ? "дня" : "вечера";
            },
            ordinalParse: /\d{1,2}-(й|го|я)/,
            ordinal: function(number, period) {
                switch (period) {
                  case "M":
                  case "d":
                  case "DDD":
                    return number + "-й";

                  case "D":
                    return number + "-го";

                  case "w":
                  case "W":
                    return number + "-я";

                  default:
                    return number;
                }
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    })(__webpack_require__(1));
}
