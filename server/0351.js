function(module, exports, __webpack_require__) {
    !(function(moment) {
        "use strict";
        function processRelativeTime(number, withoutSuffix, key, isFuture) {
            var result = number + " ";
            switch (key) {
              case "s":
                return withoutSuffix || isFuture ? "nekaj sekund" : "nekaj sekundami";

              case "m":
                return withoutSuffix ? "ena minuta" : "eno minuto";

              case "mm":
                return result + (1 === number ? withoutSuffix ? "minuta" : "minuto" : 2 === number ? withoutSuffix || isFuture ? "minuti" : "minutama" : number < 5 ? withoutSuffix || isFuture ? "minute" : "minutami" : withoutSuffix || isFuture ? "minut" : "minutami");

              case "h":
                return withoutSuffix ? "ena ura" : "eno uro";

              case "hh":
                return result + (1 === number ? withoutSuffix ? "ura" : "uro" : 2 === number ? withoutSuffix || isFuture ? "uri" : "urama" : number < 5 ? withoutSuffix || isFuture ? "ure" : "urami" : withoutSuffix || isFuture ? "ur" : "urami");

              case "d":
                return withoutSuffix || isFuture ? "en dan" : "enim dnem";

              case "dd":
                return result + (1 === number ? withoutSuffix || isFuture ? "dan" : "dnem" : 2 === number ? withoutSuffix || isFuture ? "dni" : "dnevoma" : withoutSuffix || isFuture ? "dni" : "dnevi");

              case "M":
                return withoutSuffix || isFuture ? "en mesec" : "enim mesecem";

              case "MM":
                return result + (1 === number ? withoutSuffix || isFuture ? "mesec" : "mesecem" : 2 === number ? withoutSuffix || isFuture ? "meseca" : "mesecema" : number < 5 ? withoutSuffix || isFuture ? "mesece" : "meseci" : withoutSuffix || isFuture ? "mesecev" : "meseci");

              case "y":
                return withoutSuffix || isFuture ? "eno leto" : "enim letom";

              case "yy":
                return result + (1 === number ? withoutSuffix || isFuture ? "leto" : "letom" : 2 === number ? withoutSuffix || isFuture ? "leti" : "letoma" : number < 5 ? withoutSuffix || isFuture ? "leta" : "leti" : withoutSuffix || isFuture ? "let" : "leti");
            }
        }
        moment.defineLocale("sl", {
            months: "januar_februar_marec_april_maj_junij_julij_avgust_september_oktober_november_december".split("_"),
            monthsShort: "jan._feb._mar._apr._maj._jun._jul._avg._sep._okt._nov._dec.".split("_"),
            weekdays: "nedelja_ponedeljek_torek_sreda_četrtek_petek_sobota".split("_"),
            weekdaysShort: "ned._pon._tor._sre._čet._pet._sob.".split("_"),
            weekdaysMin: "ne_po_to_sr_če_pe_so".split("_"),
            longDateFormat: {
                LT: "H:mm",
                LTS: "H:mm:ss",
                L: "DD. MM. YYYY",
                LL: "D. MMMM YYYY",
                LLL: "D. MMMM YYYY H:mm",
                LLLL: "dddd, D. MMMM YYYY H:mm"
            },
            calendar: {
                sameDay: "[danes ob] LT",
                nextDay: "[jutri ob] LT",
                nextWeek: function() {
                    switch (this.day()) {
                      case 0:
                        return "[v] [nedeljo] [ob] LT";

                      case 3:
                        return "[v] [sredo] [ob] LT";

                      case 6:
                        return "[v] [soboto] [ob] LT";

                      case 1:
                      case 2:
                      case 4:
                      case 5:
                        return "[v] dddd [ob] LT";
                    }
                },
                lastDay: "[včeraj ob] LT",
                lastWeek: function() {
                    switch (this.day()) {
                      case 0:
                        return "[prejšnjo] [nedeljo] [ob] LT";

                      case 3:
                        return "[prejšnjo] [sredo] [ob] LT";

                      case 6:
                        return "[prejšnjo] [soboto] [ob] LT";

                      case 1:
                      case 2:
                      case 4:
                      case 5:
                        return "[prejšnji] dddd [ob] LT";
                    }
                },
                sameElse: "L"
            },
            relativeTime: {
                future: "čez %s",
                past: "pred %s",
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
                doy: 7
            }
        });
    })(__webpack_require__(1));
}
