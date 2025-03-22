function(module, exports, __webpack_require__) {
    "use strict";
    var matchHtmlRegExp = /["'&<>]/;
    module.exports = function(string) {
        var escape, str = "" + string, match = matchHtmlRegExp.exec(str);
        if (!match) return str;
        var html = "", index = 0, lastIndex = 0;
        for (index = match.index; index < str.length; index++) {
            switch (str.charCodeAt(index)) {
              case 34:
                escape = "&quot;";
                break;

              case 38:
                escape = "&amp;";
                break;

              case 39:
                escape = "&#39;";
                break;

              case 60:
                escape = "&lt;";
                break;

              case 62:
                escape = "&gt;";
                break;

              default:
                continue;
            }
            lastIndex !== index && (html += str.substring(lastIndex, index)), lastIndex = index + 1, 
            html += escape;
        }
        return lastIndex !== index ? html + str.substring(lastIndex, index) : html;
    };
}
