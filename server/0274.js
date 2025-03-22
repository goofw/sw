function(module, exports, __webpack_require__) {
    var __WEBPACK_AMD_DEFINE_RESULT__;
    !(function(global) {
        "use strict";
        var token, timezone, timezoneClip, dateFormat = (token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZWN]|'[^']*'|'[^']*'/g, 
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g, 
        timezoneClip = /[^-+\dA-Z]/g, function(date, mask, utc, gmt) {
            if (1 !== arguments.length || "string" !== kindOf(date) || /\d/.test(date) || (mask = date, 
            date = void 0), (date = date || new Date) instanceof Date || (date = new Date(date)), 
            isNaN(date)) throw TypeError("Invalid date");
            var maskSlice = (mask = String(dateFormat.masks[mask] || mask || dateFormat.masks.default)).slice(0, 4);
            "UTC:" !== maskSlice && "GMT:" !== maskSlice || (mask = mask.slice(4), utc = !0, 
            "GMT:" === maskSlice && (gmt = !0));
            var _ = utc ? "getUTC" : "get", d = date[_ + "Date"](), D = date[_ + "Day"](), m = date[_ + "Month"](), y = date[_ + "FullYear"](), H = date[_ + "Hours"](), M = date[_ + "Minutes"](), s = date[_ + "Seconds"](), L = date[_ + "Milliseconds"](), o = utc ? 0 : date.getTimezoneOffset(), W = getWeek(date), N = getDayOfWeek(date), flags = {
                d: d,
                dd: pad(d),
                ddd: dateFormat.i18n.dayNames[D],
                dddd: dateFormat.i18n.dayNames[D + 7],
                m: m + 1,
                mm: pad(m + 1),
                mmm: dateFormat.i18n.monthNames[m],
                mmmm: dateFormat.i18n.monthNames[m + 12],
                yy: String(y).slice(2),
                yyyy: y,
                h: H % 12 || 12,
                hh: pad(H % 12 || 12),
                H: H,
                HH: pad(H),
                M: M,
                MM: pad(M),
                s: s,
                ss: pad(s),
                l: pad(L, 3),
                L: pad(Math.round(L / 10)),
                t: H < 12 ? "a" : "p",
                tt: H < 12 ? "am" : "pm",
                T: H < 12 ? "A" : "P",
                TT: H < 12 ? "AM" : "PM",
                Z: gmt ? "GMT" : utc ? "UTC" : (String(date).match(timezone) || [ "" ]).pop().replace(timezoneClip, ""),
                o: (o > 0 ? "-" : "+") + pad(100 * Math.floor(Math.abs(o) / 60) + Math.abs(o) % 60, 4),
                S: [ "th", "st", "nd", "rd" ][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10],
                W: W,
                N: N
            };
            return mask.replace(token, (function(match) {
                return match in flags ? flags[match] : match.slice(1, match.length - 1);
            }));
        });
        function pad(val, len) {
            for (val = String(val), len = len || 2; val.length < len; ) val = "0" + val;
            return val;
        }
        function getWeek(date) {
            var targetThursday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            targetThursday.setDate(targetThursday.getDate() - (targetThursday.getDay() + 6) % 7 + 3);
            var firstThursday = new Date(targetThursday.getFullYear(), 0, 4);
            firstThursday.setDate(firstThursday.getDate() - (firstThursday.getDay() + 6) % 7 + 3);
            var ds = targetThursday.getTimezoneOffset() - firstThursday.getTimezoneOffset();
            targetThursday.setHours(targetThursday.getHours() - ds);
            var weekDiff = (targetThursday - firstThursday) / 6048e5;
            return 1 + Math.floor(weekDiff);
        }
        function getDayOfWeek(date) {
            var dow = date.getDay();
            return 0 === dow && (dow = 7), dow;
        }
        function kindOf(val) {
            return null === val ? "null" : void 0 === val ? "undefined" : "object" != typeof val ? typeof val : Array.isArray(val) ? "array" : {}.toString.call(val).slice(8, -1).toLowerCase();
        }
        dateFormat.masks = {
            default: "ddd mmm dd yyyy HH:MM:ss",
            shortDate: "m/d/yy",
            mediumDate: "mmm d, yyyy",
            longDate: "mmmm d, yyyy",
            fullDate: "dddd, mmmm d, yyyy",
            shortTime: "h:MM TT",
            mediumTime: "h:MM:ss TT",
            longTime: "h:MM:ss TT Z",
            isoDate: "yyyy-mm-dd",
            isoTime: "HH:MM:ss",
            isoDateTime: "yyyy-mm-dd'T'HH:MM:sso",
            isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",
            expiresHeaderFormat: "ddd, dd mmm yyyy HH:MM:ss Z"
        }, dateFormat.i18n = {
            dayNames: [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
            monthNames: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]
        }, void 0 === (__WEBPACK_AMD_DEFINE_RESULT__ = function() {
            return dateFormat;
        }.call(exports, __webpack_require__, exports, module)) || (module.exports = __WEBPACK_AMD_DEFINE_RESULT__);
    })();
}
