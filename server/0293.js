function(module, exports, __webpack_require__) {
    !(function(moment) {
        "use strict";
        function relativeTimeWithMutation(number, withoutSuffix, key) {
            return number + " " + (function(text, number) {
                return 2 === number ? (function(text) {
                    var mutationTable = {
                        m: "v",
                        b: "v",
                        d: "z"
                    };
                    return void 0 === mutationTable[text.charAt(0)] ? text : mutationTable[text.charAt(0)] + text.substring(1);
                })(text) : text;
            })({
                mm: "munutenn",
                MM: "miz",
                dd: "devezh"
            }[key], number);
        }
        function lastNumber(number) {
            return number > 9 ? lastNumber(number % 10) : number;
        }
        moment.defineLocale("br", {
            months: "Genver_C'hwevrer_Meurzh_Ebrel_Mae_Mezheven_Gouere_Eost_Gwengolo_Here_Du_Kerzu".split("_"),
            monthsShort: "Gen_C'hwe_Meu_Ebr_Mae_Eve_Gou_Eos_Gwe_Her_Du_Ker".split("_"),
            weekdays: "Sul_Lun_Meurzh_Merc'her_Yaou_Gwener_Sadorn".split("_"),
            weekdaysShort: "Sul_Lun_Meu_Mer_Yao_Gwe_Sad".split("_"),
            weekdaysMin: "Su_Lu_Me_Mer_Ya_Gw_Sa".split("_"),
            longDateFormat: {
                LT: "h[e]mm A",
                LTS: "h[e]mm:ss A",
                L: "DD/MM/YYYY",
                LL: "D [a viz] MMMM YYYY",
                LLL: "D [a viz] MMMM YYYY h[e]mm A",
                LLLL: "dddd, D [a viz] MMMM YYYY h[e]mm A"
            },
            calendar: {
                sameDay: "[Hiziv da] LT",
                nextDay: "[Warc'hoazh da] LT",
                nextWeek: "dddd [da] LT",
                lastDay: "[Dec'h da] LT",
                lastWeek: "dddd [paset da] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "a-benn %s",
                past: "%s 'zo",
                s: "un nebeud segondennoù",
                m: "ur vunutenn",
                mm: relativeTimeWithMutation,
                h: "un eur",
                hh: "%d eur",
                d: "un devezh",
                dd: relativeTimeWithMutation,
                M: "ur miz",
                MM: relativeTimeWithMutation,
                y: "ur bloaz",
                yy: function(number) {
                    switch (lastNumber(number)) {
                      case 1:
                      case 3:
                      case 4:
                      case 5:
                      case 9:
                        return number + " bloaz";

                      default:
                        return number + " vloaz";
                    }
                }
            },
            ordinalParse: /\d{1,2}(añ|vet)/,
            ordinal: function(number) {
                return number + (1 === number ? "añ" : "vet");
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    })(__webpack_require__(1));
}
