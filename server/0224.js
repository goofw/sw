function(module, exports) {
    var cache = {}, TO_ESCAPE = {
        "'": "\\'",
        "\n": "\\n"
    };
    function populate(formatter) {
        var i, key = formatter, prev = 0, arg = 1, builder = "return '";
        for (i = 0; i < formatter.length; i++) if ("%" === formatter[i]) switch (formatter[i + 1]) {
          case "s":
            builder += formatter.slice(prev, i) + "' + arguments[" + arg + "] + '", prev = i + 2, 
            arg++;
            break;

          case "j":
            builder += formatter.slice(prev, i) + "' + JSON.stringify(arguments[" + arg + "]) + '", 
            prev = i + 2, arg++;
            break;

          case "%":
            builder += formatter.slice(prev, i + 1), prev = i + 2, i++;
        } else TO_ESCAPE[formatter[i]] && (builder += formatter.slice(prev, i) + TO_ESCAPE[formatter[i]], 
        prev = i + 1);
        builder += formatter.slice(prev) + "';", cache[key] = new Function(builder);
    }
    exports.sprintf = function(formatter, var_args) {
        return cache[formatter] || populate(formatter), cache[formatter].apply(null, arguments);
    };
}
