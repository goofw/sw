function(module, exports, __webpack_require__) {
    !(function(moment) {
        "use strict";
        function translate(number, withoutSuffix, key) {
            var result = number + " ";
            switch (key) {
              case "m":
                return withoutSuffix ? "jedna minuta" : "jedne minute";

              case "mm":
                return result + (1 === number ? "minuta" : 2 === number || 3 === number || 4 === number ? "minute" : "minuta");

              case "h":
                return withoutSuffix ? "jedan sat" : "jednog sata";

              case "hh":
                return result + (1 === number ? "sat" : 2 === number || 3 === number || 4 === number ? "sata" : "sati");

              case "dd":
                return result + (1 === number ? "dan" : "dana");

              case "MM":
                return result + (1 === number ? "mjesec" : 2 === number || 3 === number || 4 === number ? "mjeseca" : "mjeseci");

              case "yy":
                return result + (1 === number ? "godina" : 2 === number || 3 === number || 4 === number ? "godine" : "godina");
            }
        }
        moment.defineLocale("bs", {
            months: "januar_februar_mart_april_maj_juni_juli_august_septembar_oktobar_novembar_decembar".split("_"),
            monthsShort: "jan._feb._mar._apr._maj._jun._jul._aug._sep._okt._nov._dec.".split("_"),
            weekdays: "nedjelja_ponedjeljak_utorak_srijeda_četvrtak_petak_subota".split("_"),
            weekdaysShort: "ned._pon._uto._sri._čet._pet._sub.".split("_"),
            weekdaysMin: "ne_po_ut_sr_če_pe_su".split("_"),
            longDateFormat: {
                LT: "H:mm",
                LTS: "H:mm:ss",
                L: "DD. MM. YYYY",
                LL: "D. MMMM YYYY",
                LLL: "D. MMMM YYYY H:mm",
                LLLL: "dddd, D. MMMM YYYY H:mm"
            },
            calendar: {
                sameDay: "[danas u] LT",
                nextDay: "[sutra u] LT",
                nextWeek: function() {
                    switch (this.day()) {
                      case 0:
                        return "[u] [nedjelju] [u] LT";

                      case 3:
                        return "[u] [srijedu] [u] LT";

                      case 6:
                        return "[u] [subotu] [u] LT";

                      case 1:
                      case 2:
                      case 4:
                      case 5:
                        return "[u] dddd [u] LT";
                    }
                },
                lastDay: "[jučer u] LT",
                lastWeek: function() {
                    switch (this.day()) {
                      case 0:
                      case 3:
                        return "[prošlu] dddd [u] LT";

                      case 6:
                        return "[prošle] [subote] [u] LT";

                      case 1:
                      case 2:
                      case 4:
                      case 5:
                        return "[prošli] dddd [u] LT";
                    }
                },
                sameElse: "L"
            },
            relativeTime: {
                future: "za %s",
                past: "prije %s",
                s: "par sekundi",
                m: translate,
                mm: translate,
                h: translate,
                hh: translate,
                d: "dan",
                dd: translate,
                M: "mjesec",
                MM: translate,
                y: "godinu",
                yy: translate
            },
            ordinalParse: /\d{1,2}\./,
            ordinal: "%d.",
            week: {
                dow: 1,
                doy: 7
            }
        });
    })(__webpack_require__(1));
}
