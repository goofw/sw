function(module, exports, __webpack_require__) {
    !(function(moment) {
        "use strict";
        var translator = {
            words: {
                m: [ "jedan minut", "jednog minuta" ],
                mm: [ "minut", "minuta", "minuta" ],
                h: [ "jedan sat", "jednog sata" ],
                hh: [ "sat", "sata", "sati" ],
                dd: [ "dan", "dana", "dana" ],
                MM: [ "mjesec", "mjeseca", "mjeseci" ],
                yy: [ "godina", "godine", "godina" ]
            },
            correctGrammaticalCase: function(number, wordKey) {
                return 1 === number ? wordKey[0] : number >= 2 && number <= 4 ? wordKey[1] : wordKey[2];
            },
            translate: function(number, withoutSuffix, key) {
                var wordKey = translator.words[key];
                return 1 === key.length ? withoutSuffix ? wordKey[0] : wordKey[1] : number + " " + translator.correctGrammaticalCase(number, wordKey);
            }
        };
        moment.defineLocale("me", {
            months: [ "januar", "februar", "mart", "april", "maj", "jun", "jul", "avgust", "septembar", "oktobar", "novembar", "decembar" ],
            monthsShort: [ "jan.", "feb.", "mar.", "apr.", "maj", "jun", "jul", "avg.", "sep.", "okt.", "nov.", "dec." ],
            weekdays: [ "nedjelja", "ponedjeljak", "utorak", "srijeda", "četvrtak", "petak", "subota" ],
            weekdaysShort: [ "ned.", "pon.", "uto.", "sri.", "čet.", "pet.", "sub." ],
            weekdaysMin: [ "ne", "po", "ut", "sr", "če", "pe", "su" ],
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
                nextDay: "[sjutra u] LT",
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
                lastDay: "[juče u] LT",
                lastWeek: function() {
                    return [ "[prošle] [nedjelje] [u] LT", "[prošlog] [ponedjeljka] [u] LT", "[prošlog] [utorka] [u] LT", "[prošle] [srijede] [u] LT", "[prošlog] [četvrtka] [u] LT", "[prošlog] [petka] [u] LT", "[prošle] [subote] [u] LT" ][this.day()];
                },
                sameElse: "L"
            },
            relativeTime: {
                future: "za %s",
                past: "prije %s",
                s: "nekoliko sekundi",
                m: translator.translate,
                mm: translator.translate,
                h: translator.translate,
                hh: translator.translate,
                d: "dan",
                dd: translator.translate,
                M: "mjesec",
                MM: translator.translate,
                y: "godinu",
                yy: translator.translate
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
