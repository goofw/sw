function(module, exports, __webpack_require__) {
    !(function(moment) {
        "use strict";
        var months = "január_február_marec_apríl_máj_jún_júl_august_september_október_november_december".split("_"), monthsShort = "jan_feb_mar_apr_máj_jún_júl_aug_sep_okt_nov_dec".split("_");
        function plural(n) {
            return n > 1 && n < 5;
        }
        function translate(number, withoutSuffix, key, isFuture) {
            var result = number + " ";
            switch (key) {
              case "s":
                return withoutSuffix || isFuture ? "pár sekúnd" : "pár sekundami";

              case "m":
                return withoutSuffix ? "minúta" : isFuture ? "minútu" : "minútou";

              case "mm":
                return withoutSuffix || isFuture ? result + (plural(number) ? "minúty" : "minút") : result + "minútami";

              case "h":
                return withoutSuffix ? "hodina" : isFuture ? "hodinu" : "hodinou";

              case "hh":
                return withoutSuffix || isFuture ? result + (plural(number) ? "hodiny" : "hodín") : result + "hodinami";

              case "d":
                return withoutSuffix || isFuture ? "deň" : "dňom";

              case "dd":
                return withoutSuffix || isFuture ? result + (plural(number) ? "dni" : "dní") : result + "dňami";

              case "M":
                return withoutSuffix || isFuture ? "mesiac" : "mesiacom";

              case "MM":
                return withoutSuffix || isFuture ? result + (plural(number) ? "mesiace" : "mesiacov") : result + "mesiacmi";

              case "y":
                return withoutSuffix || isFuture ? "rok" : "rokom";

              case "yy":
                return withoutSuffix || isFuture ? result + (plural(number) ? "roky" : "rokov") : result + "rokmi";
            }
        }
        moment.defineLocale("sk", {
            months: months,
            monthsShort: monthsShort,
            monthsParse: (function(months, monthsShort) {
                var i, _monthsParse = [];
                for (i = 0; i < 12; i++) _monthsParse[i] = new RegExp("^" + months[i] + "$|^" + monthsShort[i] + "$", "i");
                return _monthsParse;
            })(months, monthsShort),
            weekdays: "nedeľa_pondelok_utorok_streda_štvrtok_piatok_sobota".split("_"),
            weekdaysShort: "ne_po_ut_st_št_pi_so".split("_"),
            weekdaysMin: "ne_po_ut_st_št_pi_so".split("_"),
            longDateFormat: {
                LT: "H:mm",
                LTS: "H:mm:ss",
                L: "DD.MM.YYYY",
                LL: "D. MMMM YYYY",
                LLL: "D. MMMM YYYY H:mm",
                LLLL: "dddd D. MMMM YYYY H:mm"
            },
            calendar: {
                sameDay: "[dnes o] LT",
                nextDay: "[zajtra o] LT",
                nextWeek: function() {
                    switch (this.day()) {
                      case 0:
                        return "[v nedeľu o] LT";

                      case 1:
                      case 2:
                        return "[v] dddd [o] LT";

                      case 3:
                        return "[v stredu o] LT";

                      case 4:
                        return "[vo štvrtok o] LT";

                      case 5:
                        return "[v piatok o] LT";

                      case 6:
                        return "[v sobotu o] LT";
                    }
                },
                lastDay: "[včera o] LT",
                lastWeek: function() {
                    switch (this.day()) {
                      case 0:
                        return "[minulú nedeľu o] LT";

                      case 1:
                      case 2:
                      case 4:
                      case 5:
                        return "[minulý] dddd [o] LT";

                      case 3:
                        return "[minulú stredu o] LT";

                      case 6:
                        return "[minulú sobotu o] LT";
                    }
                },
                sameElse: "L"
            },
            relativeTime: {
                future: "za %s",
                past: "pred %s",
                s: translate,
                m: translate,
                mm: translate,
                h: translate,
                hh: translate,
                d: translate,
                dd: translate,
                M: translate,
                MM: translate,
                y: translate,
                yy: translate
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
