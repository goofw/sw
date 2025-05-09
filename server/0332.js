function(module, exports, __webpack_require__) {
    !(function(moment) {
        "use strict";
        var units = {
            m: "minūtes_minūtēm_minūte_minūtes".split("_"),
            mm: "minūtes_minūtēm_minūte_minūtes".split("_"),
            h: "stundas_stundām_stunda_stundas".split("_"),
            hh: "stundas_stundām_stunda_stundas".split("_"),
            d: "dienas_dienām_diena_dienas".split("_"),
            dd: "dienas_dienām_diena_dienas".split("_"),
            M: "mēneša_mēnešiem_mēnesis_mēneši".split("_"),
            MM: "mēneša_mēnešiem_mēnesis_mēneši".split("_"),
            y: "gada_gadiem_gads_gadi".split("_"),
            yy: "gada_gadiem_gads_gadi".split("_")
        };
        function format(forms, number, withoutSuffix) {
            return withoutSuffix ? number % 10 == 1 && 11 !== number ? forms[2] : forms[3] : number % 10 == 1 && 11 !== number ? forms[0] : forms[1];
        }
        function relativeTimeWithPlural(number, withoutSuffix, key) {
            return number + " " + format(units[key], number, withoutSuffix);
        }
        function relativeTimeWithSingular(number, withoutSuffix, key) {
            return format(units[key], number, withoutSuffix);
        }
        moment.defineLocale("lv", {
            months: "janvāris_februāris_marts_aprīlis_maijs_jūnijs_jūlijs_augusts_septembris_oktobris_novembris_decembris".split("_"),
            monthsShort: "jan_feb_mar_apr_mai_jūn_jūl_aug_sep_okt_nov_dec".split("_"),
            weekdays: "svētdiena_pirmdiena_otrdiena_trešdiena_ceturtdiena_piektdiena_sestdiena".split("_"),
            weekdaysShort: "Sv_P_O_T_C_Pk_S".split("_"),
            weekdaysMin: "Sv_P_O_T_C_Pk_S".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                LTS: "HH:mm:ss",
                L: "DD.MM.YYYY.",
                LL: "YYYY. [gada] D. MMMM",
                LLL: "YYYY. [gada] D. MMMM, HH:mm",
                LLLL: "YYYY. [gada] D. MMMM, dddd, HH:mm"
            },
            calendar: {
                sameDay: "[Šodien pulksten] LT",
                nextDay: "[Rīt pulksten] LT",
                nextWeek: "dddd [pulksten] LT",
                lastDay: "[Vakar pulksten] LT",
                lastWeek: "[Pagājušā] dddd [pulksten] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "pēc %s",
                past: "pirms %s",
                s: function(number, withoutSuffix) {
                    return withoutSuffix ? "dažas sekundes" : "dažām sekundēm";
                },
                m: relativeTimeWithSingular,
                mm: relativeTimeWithPlural,
                h: relativeTimeWithSingular,
                hh: relativeTimeWithPlural,
                d: relativeTimeWithSingular,
                dd: relativeTimeWithPlural,
                M: relativeTimeWithSingular,
                MM: relativeTimeWithPlural,
                y: relativeTimeWithSingular,
                yy: relativeTimeWithPlural
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
