function(module, exports, __webpack_require__) {
    !(function(moment) {
        "use strict";
        function processRelativeTime(number, withoutSuffix, key, isFuture) {
            var format = {
                s: [ "viensas secunds", "'iensas secunds" ],
                m: [ "'n míut", "'iens míut" ],
                mm: [ number + " míuts", " " + number + " míuts" ],
                h: [ "'n þora", "'iensa þora" ],
                hh: [ number + " þoras", " " + number + " þoras" ],
                d: [ "'n ziua", "'iensa ziua" ],
                dd: [ number + " ziuas", " " + number + " ziuas" ],
                M: [ "'n mes", "'iens mes" ],
                MM: [ number + " mesen", " " + number + " mesen" ],
                y: [ "'n ar", "'iens ar" ],
                yy: [ number + " ars", " " + number + " ars" ]
            };
            return isFuture || withoutSuffix ? format[key][0] : format[key][1].trim();
        }
        moment.defineLocale("tzl", {
            months: "Januar_Fevraglh_Març_Avrïu_Mai_Gün_Julia_Guscht_Setemvar_Listopäts_Noemvar_Zecemvar".split("_"),
            monthsShort: "Jan_Fev_Mar_Avr_Mai_Gün_Jul_Gus_Set_Lis_Noe_Zec".split("_"),
            weekdays: "Súladi_Lúneçi_Maitzi_Márcuri_Xhúadi_Viénerçi_Sáturi".split("_"),
            weekdaysShort: "Súl_Lún_Mai_Már_Xhú_Vié_Sát".split("_"),
            weekdaysMin: "Sú_Lú_Ma_Má_Xh_Vi_Sá".split("_"),
            longDateFormat: {
                LT: "HH.mm",
                LTS: "LT.ss",
                L: "DD.MM.YYYY",
                LL: "D. MMMM [dallas] YYYY",
                LLL: "D. MMMM [dallas] YYYY LT",
                LLLL: "dddd, [li] D. MMMM [dallas] YYYY LT"
            },
            meridiem: function(hours, minutes, isLower) {
                return hours > 11 ? isLower ? "d'o" : "D'O" : isLower ? "d'a" : "D'A";
            },
            calendar: {
                sameDay: "[oxhi à] LT",
                nextDay: "[demà à] LT",
                nextWeek: "dddd [à] LT",
                lastDay: "[ieiri à] LT",
                lastWeek: "[sür el] dddd [lasteu à] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "osprei %s",
                past: "ja%s",
                s: processRelativeTime,
                m: processRelativeTime,
                mm: processRelativeTime,
                h: processRelativeTime,
                hh: processRelativeTime,
                d: processRelativeTime,
                dd: processRelativeTime,
                M: processRelativeTime,
                MM: processRelativeTime,
                y: processRelativeTime,
                yy: processRelativeTime
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
