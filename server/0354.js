function(module, exports, __webpack_require__) {
    !(function(moment) {
        "use strict";
        var translator = {
            words: {
                m: [ "један минут", "једне минуте" ],
                mm: [ "минут", "минуте", "минута" ],
                h: [ "један сат", "једног сата" ],
                hh: [ "сат", "сата", "сати" ],
                dd: [ "дан", "дана", "дана" ],
                MM: [ "месец", "месеца", "месеци" ],
                yy: [ "година", "године", "година" ]
            },
            correctGrammaticalCase: function(number, wordKey) {
                return 1 === number ? wordKey[0] : number >= 2 && number <= 4 ? wordKey[1] : wordKey[2];
            },
            translate: function(number, withoutSuffix, key) {
                var wordKey = translator.words[key];
                return 1 === key.length ? withoutSuffix ? wordKey[0] : wordKey[1] : number + " " + translator.correctGrammaticalCase(number, wordKey);
            }
        };
        moment.defineLocale("sr-cyrl", {
            months: [ "јануар", "фебруар", "март", "април", "мај", "јун", "јул", "август", "септембар", "октобар", "новембар", "децембар" ],
            monthsShort: [ "јан.", "феб.", "мар.", "апр.", "мај", "јун", "јул", "авг.", "сеп.", "окт.", "нов.", "дец." ],
            weekdays: [ "недеља", "понедељак", "уторак", "среда", "четвртак", "петак", "субота" ],
            weekdaysShort: [ "нед.", "пон.", "уто.", "сре.", "чет.", "пет.", "суб." ],
            weekdaysMin: [ "не", "по", "ут", "ср", "че", "пе", "су" ],
            longDateFormat: {
                LT: "H:mm",
                LTS: "H:mm:ss",
                L: "DD. MM. YYYY",
                LL: "D. MMMM YYYY",
                LLL: "D. MMMM YYYY H:mm",
                LLLL: "dddd, D. MMMM YYYY H:mm"
            },
            calendar: {
                sameDay: "[данас у] LT",
                nextDay: "[сутра у] LT",
                nextWeek: function() {
                    switch (this.day()) {
                      case 0:
                        return "[у] [недељу] [у] LT";

                      case 3:
                        return "[у] [среду] [у] LT";

                      case 6:
                        return "[у] [суботу] [у] LT";

                      case 1:
                      case 2:
                      case 4:
                      case 5:
                        return "[у] dddd [у] LT";
                    }
                },
                lastDay: "[јуче у] LT",
                lastWeek: function() {
                    return [ "[прошле] [недеље] [у] LT", "[прошлог] [понедељка] [у] LT", "[прошлог] [уторка] [у] LT", "[прошле] [среде] [у] LT", "[прошлог] [четвртка] [у] LT", "[прошлог] [петка] [у] LT", "[прошле] [суботе] [у] LT" ][this.day()];
                },
                sameElse: "L"
            },
            relativeTime: {
                future: "за %s",
                past: "пре %s",
                s: "неколико секунди",
                m: translator.translate,
                mm: translator.translate,
                h: translator.translate,
                hh: translator.translate,
                d: "дан",
                dd: translator.translate,
                M: "месец",
                MM: translator.translate,
                y: "годину",
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
