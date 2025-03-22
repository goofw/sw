function(module, exports, __webpack_require__) {
    !(function(moment) {
        "use strict";
        var months = "leden_únor_březen_duben_květen_červen_červenec_srpen_září_říjen_listopad_prosinec".split("_"), monthsShort = "led_úno_bře_dub_kvě_čvn_čvc_srp_zář_říj_lis_pro".split("_");
        function plural(n) {
            return n > 1 && n < 5 && 1 != ~~(n / 10);
        }
        function translate(number, withoutSuffix, key, isFuture) {
            var result = number + " ";
            switch (key) {
              case "s":
                return withoutSuffix || isFuture ? "pár sekund" : "pár sekundami";

              case "m":
                return withoutSuffix ? "minuta" : isFuture ? "minutu" : "minutou";

              case "mm":
                return withoutSuffix || isFuture ? result + (plural(number) ? "minuty" : "minut") : result + "minutami";

              case "h":
                return withoutSuffix ? "hodina" : isFuture ? "hodinu" : "hodinou";

              case "hh":
                return withoutSuffix || isFuture ? result + (plural(number) ? "hodiny" : "hodin") : result + "hodinami";

              case "d":
                return withoutSuffix || isFuture ? "den" : "dnem";

              case "dd":
                return withoutSuffix || isFuture ? result + (plural(number) ? "dny" : "dní") : result + "dny";

              case "M":
                return withoutSuffix || isFuture ? "měsíc" : "měsícem";

              case "MM":
                return withoutSuffix || isFuture ? result + (plural(number) ? "měsíce" : "měsíců") : result + "měsíci";

              case "y":
                return withoutSuffix || isFuture ? "rok" : "rokem";

              case "yy":
                return withoutSuffix || isFuture ? result + (plural(number) ? "roky" : "let") : result + "lety";
            }
        }
        moment.defineLocale("cs", {
            months: months,
            monthsShort: monthsShort,
            monthsParse: (function(months, monthsShort) {
                var i, _monthsParse = [];
                for (i = 0; i < 12; i++) _monthsParse[i] = new RegExp("^" + months[i] + "$|^" + monthsShort[i] + "$", "i");
                return _monthsParse;
            })(months, monthsShort),
            weekdays: "neděle_pondělí_úterý_středa_čtvrtek_pátek_sobota".split("_"),
            weekdaysShort: "ne_po_út_st_čt_pá_so".split("_"),
            weekdaysMin: "ne_po_út_st_čt_pá_so".split("_"),
            longDateFormat: {
                LT: "H:mm",
                LTS: "H:mm:ss",
                L: "DD.MM.YYYY",
                LL: "D. MMMM YYYY",
                LLL: "D. MMMM YYYY H:mm",
                LLLL: "dddd D. MMMM YYYY H:mm"
            },
            calendar: {
                sameDay: "[dnes v] LT",
                nextDay: "[zítra v] LT",
                nextWeek: function() {
                    switch (this.day()) {
                      case 0:
                        return "[v neděli v] LT";

                      case 1:
                      case 2:
                        return "[v] dddd [v] LT";

                      case 3:
                        return "[ve středu v] LT";

                      case 4:
                        return "[ve čtvrtek v] LT";

                      case 5:
                        return "[v pátek v] LT";

                      case 6:
                        return "[v sobotu v] LT";
                    }
                },
                lastDay: "[včera v] LT",
                lastWeek: function() {
                    switch (this.day()) {
                      case 0:
                        return "[minulou neděli v] LT";

                      case 1:
                      case 2:
                        return "[minulé] dddd [v] LT";

                      case 3:
                        return "[minulou středu v] LT";

                      case 4:
                      case 5:
                        return "[minulý] dddd [v] LT";

                      case 6:
                        return "[minulou sobotu v] LT";
                    }
                },
                sameElse: "L"
            },
            relativeTime: {
                future: "za %s",
                past: "před %s",
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
