function(module, exports) {
    (function() {
        "use strict";
        var prefixMatch;
        prefixMatch = new RegExp(/(?!xmlns)^.*:/), exports.normalize = function(str) {
            return str.toLowerCase();
        }, exports.firstCharLowerCase = function(str) {
            return str.charAt(0).toLowerCase() + str.slice(1);
        }, exports.stripPrefix = function(str) {
            return str.replace(prefixMatch, "");
        }, exports.parseNumbers = function(str) {
            return isNaN(str) || (str = str % 1 == 0 ? parseInt(str, 10) : parseFloat(str)), 
            str;
        }, exports.parseBooleans = function(str) {
            return /^(?:true|false)$/i.test(str) && (str = "true" === str.toLowerCase()), str;
        };
    }).call(this);
}
