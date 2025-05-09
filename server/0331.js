function(module, exports, __webpack_require__) {
    !(function(moment) {
        "use strict";
        var units = {
            m: "minutė_minutės_minutę",
            mm: "minutės_minučių_minutes",
            h: "valanda_valandos_valandą",
            hh: "valandos_valandų_valandas",
            d: "diena_dienos_dieną",
            dd: "dienos_dienų_dienas",
            M: "mėnuo_mėnesio_mėnesį",
            MM: "mėnesiai_mėnesių_mėnesius",
            y: "metai_metų_metus",
            yy: "metai_metų_metus"
        }, weekDays = "sekmadienis_pirmadienis_antradienis_trečiadienis_ketvirtadienis_penktadienis_šeštadienis".split("_");
        function translateSingular(number, withoutSuffix, key, isFuture) {
            return withoutSuffix ? forms(key)[0] : isFuture ? forms(key)[1] : forms(key)[2];
        }
        function special(number) {
            return number % 10 == 0 || number > 10 && number < 20;
        }
        function forms(key) {
            return units[key].split("_");
        }
        function translate(number, withoutSuffix, key, isFuture) {
            var result = number + " ";
            return 1 === number ? result + translateSingular(0, withoutSuffix, key[0], isFuture) : withoutSuffix ? result + (special(number) ? forms(key)[1] : forms(key)[0]) : isFuture ? result + forms(key)[1] : result + (special(number) ? forms(key)[1] : forms(key)[2]);
        }
        moment.defineLocale("lt", {
            months: function(m, format) {
                return {
                    nominative: "sausis_vasaris_kovas_balandis_gegužė_birželis_liepa_rugpjūtis_rugsėjis_spalis_lapkritis_gruodis".split("_"),
                    accusative: "sausio_vasario_kovo_balandžio_gegužės_birželio_liepos_rugpjūčio_rugsėjo_spalio_lapkričio_gruodžio".split("_")
                }[/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/.test(format) ? "accusative" : "nominative"][m.month()];
            },
            monthsShort: "sau_vas_kov_bal_geg_bir_lie_rgp_rgs_spa_lap_grd".split("_"),
            weekdays: function(moment, format) {
                var nominative = -1 === format.indexOf("dddd HH:mm"), weekDay = weekDays[moment.day()];
                return nominative ? weekDay : weekDay.substring(0, weekDay.length - 2) + "į";
            },
            weekdaysShort: "Sek_Pir_Ant_Tre_Ket_Pen_Šeš".split("_"),
            weekdaysMin: "S_P_A_T_K_Pn_Š".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                LTS: "HH:mm:ss",
                L: "YYYY-MM-DD",
                LL: "YYYY [m.] MMMM D [d.]",
                LLL: "YYYY [m.] MMMM D [d.], HH:mm [val.]",
                LLLL: "YYYY [m.] MMMM D [d.], dddd, HH:mm [val.]",
                l: "YYYY-MM-DD",
                ll: "YYYY [m.] MMMM D [d.]",
                lll: "YYYY [m.] MMMM D [d.], HH:mm [val.]",
                llll: "YYYY [m.] MMMM D [d.], ddd, HH:mm [val.]"
            },
            calendar: {
                sameDay: "[Šiandien] LT",
                nextDay: "[Rytoj] LT",
                nextWeek: "dddd LT",
                lastDay: "[Vakar] LT",
                lastWeek: "[Praėjusį] dddd LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "po %s",
                past: "prieš %s",
                s: function(number, withoutSuffix, key, isFuture) {
                    return withoutSuffix ? "kelios sekundės" : isFuture ? "kelių sekundžių" : "kelias sekundes";
                },
                m: translateSingular,
                mm: translate,
                h: translateSingular,
                hh: translate,
                d: translateSingular,
                dd: translate,
                M: translateSingular,
                MM: translate,
                y: translateSingular,
                yy: translate
            },
            ordinalParse: /\d{1,2}-oji/,
            ordinal: function(number) {
                return number + "-oji";
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    })(__webpack_require__(1));
}
