function(module, exports, __webpack_require__) {
    !(function(moment) {
        "use strict";
        function plural(n) {
            return n % 100 == 11 || n % 10 != 1;
        }
        function translate(number, withoutSuffix, key, isFuture) {
            var result = number + " ";
            switch (key) {
              case "s":
                return withoutSuffix || isFuture ? "nokkrar sekúndur" : "nokkrum sekúndum";

              case "m":
                return withoutSuffix ? "mínúta" : "mínútu";

              case "mm":
                return plural(number) ? result + (withoutSuffix || isFuture ? "mínútur" : "mínútum") : withoutSuffix ? result + "mínúta" : result + "mínútu";

              case "hh":
                return plural(number) ? result + (withoutSuffix || isFuture ? "klukkustundir" : "klukkustundum") : result + "klukkustund";

              case "d":
                return withoutSuffix ? "dagur" : isFuture ? "dag" : "degi";

              case "dd":
                return plural(number) ? withoutSuffix ? result + "dagar" : result + (isFuture ? "daga" : "dögum") : withoutSuffix ? result + "dagur" : result + (isFuture ? "dag" : "degi");

              case "M":
                return withoutSuffix ? "mánuður" : isFuture ? "mánuð" : "mánuði";

              case "MM":
                return plural(number) ? withoutSuffix ? result + "mánuðir" : result + (isFuture ? "mánuði" : "mánuðum") : withoutSuffix ? result + "mánuður" : result + (isFuture ? "mánuð" : "mánuði");

              case "y":
                return withoutSuffix || isFuture ? "ár" : "ári";

              case "yy":
                return plural(number) ? result + (withoutSuffix || isFuture ? "ár" : "árum") : result + (withoutSuffix || isFuture ? "ár" : "ári");
            }
        }
        moment.defineLocale("is", {
            months: "janúar_febrúar_mars_apríl_maí_júní_júlí_ágúst_september_október_nóvember_desember".split("_"),
            monthsShort: "jan_feb_mar_apr_maí_jún_júl_ágú_sep_okt_nóv_des".split("_"),
            weekdays: "sunnudagur_mánudagur_þriðjudagur_miðvikudagur_fimmtudagur_föstudagur_laugardagur".split("_"),
            weekdaysShort: "sun_mán_þri_mið_fim_fös_lau".split("_"),
            weekdaysMin: "Su_Má_Þr_Mi_Fi_Fö_La".split("_"),
            longDateFormat: {
                LT: "H:mm",
                LTS: "H:mm:ss",
                L: "DD/MM/YYYY",
                LL: "D. MMMM YYYY",
                LLL: "D. MMMM YYYY [kl.] H:mm",
                LLLL: "dddd, D. MMMM YYYY [kl.] H:mm"
            },
            calendar: {
                sameDay: "[í dag kl.] LT",
                nextDay: "[á morgun kl.] LT",
                nextWeek: "dddd [kl.] LT",
                lastDay: "[í gær kl.] LT",
                lastWeek: "[síðasta] dddd [kl.] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "eftir %s",
                past: "fyrir %s síðan",
                s: translate,
                m: translate,
                mm: translate,
                h: "klukkustund",
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
