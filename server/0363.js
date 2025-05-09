function(module, exports, __webpack_require__) {
    !(function(moment) {
        "use strict";
        function relativeTimeWithPlural(number, withoutSuffix, key) {
            return "m" === key ? withoutSuffix ? "хвилина" : "хвилину" : "h" === key ? withoutSuffix ? "година" : "годину" : number + " " + (num = +number, 
            forms = {
                mm: "хвилина_хвилини_хвилин",
                hh: "година_години_годин",
                dd: "день_дні_днів",
                MM: "місяць_місяці_місяців",
                yy: "рік_роки_років"
            }[key].split("_"), num % 10 == 1 && num % 100 != 11 ? forms[0] : num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2]);
            var num, forms;
        }
        function processHoursFunction(str) {
            return function() {
                return str + "о" + (11 === this.hours() ? "б" : "") + "] LT";
            };
        }
        moment.defineLocale("uk", {
            months: function(m, format) {
                return {
                    nominative: "січень_лютий_березень_квітень_травень_червень_липень_серпень_вересень_жовтень_листопад_грудень".split("_"),
                    accusative: "січня_лютого_березня_квітня_травня_червня_липня_серпня_вересня_жовтня_листопада_грудня".split("_")
                }[/D[oD]? *MMMM?/.test(format) ? "accusative" : "nominative"][m.month()];
            },
            monthsShort: "січ_лют_бер_квіт_трав_черв_лип_серп_вер_жовт_лист_груд".split("_"),
            weekdays: function(m, format) {
                return {
                    nominative: "неділя_понеділок_вівторок_середа_четвер_п’ятниця_субота".split("_"),
                    accusative: "неділю_понеділок_вівторок_середу_четвер_п’ятницю_суботу".split("_"),
                    genitive: "неділі_понеділка_вівторка_середи_четверга_п’ятниці_суботи".split("_")
                }[/(\[[ВвУу]\]) ?dddd/.test(format) ? "accusative" : /\[?(?:минулої|наступної)? ?\] ?dddd/.test(format) ? "genitive" : "nominative"][m.day()];
            },
            weekdaysShort: "нд_пн_вт_ср_чт_пт_сб".split("_"),
            weekdaysMin: "нд_пн_вт_ср_чт_пт_сб".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                LTS: "HH:mm:ss",
                L: "DD.MM.YYYY",
                LL: "D MMMM YYYY р.",
                LLL: "D MMMM YYYY р., HH:mm",
                LLLL: "dddd, D MMMM YYYY р., HH:mm"
            },
            calendar: {
                sameDay: processHoursFunction("[Сьогодні "),
                nextDay: processHoursFunction("[Завтра "),
                lastDay: processHoursFunction("[Вчора "),
                nextWeek: processHoursFunction("[У] dddd ["),
                lastWeek: function() {
                    switch (this.day()) {
                      case 0:
                      case 3:
                      case 5:
                      case 6:
                        return processHoursFunction("[Минулої] dddd [").call(this);

                      case 1:
                      case 2:
                      case 4:
                        return processHoursFunction("[Минулого] dddd [").call(this);
                    }
                },
                sameElse: "L"
            },
            relativeTime: {
                future: "за %s",
                past: "%s тому",
                s: "декілька секунд",
                m: relativeTimeWithPlural,
                mm: relativeTimeWithPlural,
                h: "годину",
                hh: relativeTimeWithPlural,
                d: "день",
                dd: relativeTimeWithPlural,
                M: "місяць",
                MM: relativeTimeWithPlural,
                y: "рік",
                yy: relativeTimeWithPlural
            },
            meridiemParse: /ночі|ранку|дня|вечора/,
            isPM: function(input) {
                return /^(дня|вечора)$/.test(input);
            },
            meridiem: function(hour, minute, isLower) {
                return hour < 4 ? "ночі" : hour < 12 ? "ранку" : hour < 17 ? "дня" : "вечора";
            },
            ordinalParse: /\d{1,2}-(й|го)/,
            ordinal: function(number, period) {
                switch (period) {
                  case "M":
                  case "d":
                  case "DDD":
                  case "w":
                  case "W":
                    return number + "-й";

                  case "D":
                    return number + "-го";

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
