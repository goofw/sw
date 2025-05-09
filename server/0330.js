function(module, exports, __webpack_require__) {
    !(function(moment) {
        "use strict";
        function processRelativeTime(number, withoutSuffix, key, isFuture) {
            var format = {
                m: [ "eng Minutt", "enger Minutt" ],
                h: [ "eng Stonn", "enger Stonn" ],
                d: [ "een Dag", "engem Dag" ],
                M: [ "ee Mount", "engem Mount" ],
                y: [ "ee Joer", "engem Joer" ]
            };
            return withoutSuffix ? format[key][0] : format[key][1];
        }
        function eifelerRegelAppliesToNumber(number) {
            if (number = parseInt(number, 10), isNaN(number)) return !1;
            if (number < 0) return !0;
            if (number < 10) return 4 <= number && number <= 7;
            if (number < 100) {
                var lastDigit = number % 10;
                return eifelerRegelAppliesToNumber(0 === lastDigit ? number / 10 : lastDigit);
            }
            if (number < 1e4) {
                for (;number >= 10; ) number /= 10;
                return eifelerRegelAppliesToNumber(number);
            }
            return eifelerRegelAppliesToNumber(number /= 1e3);
        }
        moment.defineLocale("lb", {
            months: "Januar_Februar_Mäerz_Abrëll_Mee_Juni_Juli_August_September_Oktober_November_Dezember".split("_"),
            monthsShort: "Jan._Febr._Mrz._Abr._Mee_Jun._Jul._Aug._Sept._Okt._Nov._Dez.".split("_"),
            weekdays: "Sonndeg_Méindeg_Dënschdeg_Mëttwoch_Donneschdeg_Freideg_Samschdeg".split("_"),
            weekdaysShort: "So._Mé._Dë._Më._Do._Fr._Sa.".split("_"),
            weekdaysMin: "So_Mé_Dë_Më_Do_Fr_Sa".split("_"),
            longDateFormat: {
                LT: "H:mm [Auer]",
                LTS: "H:mm:ss [Auer]",
                L: "DD.MM.YYYY",
                LL: "D. MMMM YYYY",
                LLL: "D. MMMM YYYY H:mm [Auer]",
                LLLL: "dddd, D. MMMM YYYY H:mm [Auer]"
            },
            calendar: {
                sameDay: "[Haut um] LT",
                sameElse: "L",
                nextDay: "[Muer um] LT",
                nextWeek: "dddd [um] LT",
                lastDay: "[Gëschter um] LT",
                lastWeek: function() {
                    switch (this.day()) {
                      case 2:
                      case 4:
                        return "[Leschten] dddd [um] LT";

                      default:
                        return "[Leschte] dddd [um] LT";
                    }
                }
            },
            relativeTime: {
                future: function(string) {
                    return eifelerRegelAppliesToNumber(string.substr(0, string.indexOf(" "))) ? "a " + string : "an " + string;
                },
                past: function(string) {
                    return eifelerRegelAppliesToNumber(string.substr(0, string.indexOf(" "))) ? "viru " + string : "virun " + string;
                },
                s: "e puer Sekonnen",
                m: processRelativeTime,
                mm: "%d Minutten",
                h: processRelativeTime,
                hh: "%d Stonnen",
                d: processRelativeTime,
                dd: "%d Deeg",
                M: processRelativeTime,
                MM: "%d Méint",
                y: processRelativeTime,
                yy: "%d Joer"
            },
            ordinalParse: /\d{1,2}\./,
            ordinal: "%d.",
            week: {
                dow: 1,
                doy: 4
            }
        });
    })(__webpack_require__(1));
}
