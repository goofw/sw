function(module, exports) {
    var dateFormatter = exports, iso8601 = new RegExp("([0-9]{4})([-]?([0-9]{2})([-]?([0-9]{2})(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(.([0-9]+))?)?(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?");
    function zeroPad(digit, length) {
        for (var padded = "" + digit; padded.length < length; ) padded = "0" + padded;
        return padded;
    }
    dateFormatter.decodeIso8601 = function(time) {
        var dateParts = time.toString().match(iso8601);
        if (!dateParts) throw new Error("Expected a ISO8601 datetime but got '" + time + "'");
        var date = new Date(dateParts[1], 0, 1);
        return dateParts[3] && date.setMonth(dateParts[3] - 1), dateParts[5] && date.setDate(dateParts[5]), 
        dateParts[7] && date.setHours(dateParts[7]), dateParts[8] && date.setMinutes(dateParts[8]), 
        dateParts[10] && date.setSeconds(dateParts[10]), dateParts[12] && date.setMilliseconds(1e3 * Number("0." + dateParts[12])), 
        date;
    }, dateFormatter.encodeIso8601 = function(date) {
        return zeroPad(date.getFullYear(), 4) + zeroPad(date.getMonth() + 1, 2) + zeroPad(date.getDate(), 2) + "T" + zeroPad(date.getHours(), 2) + ":" + zeroPad(date.getMinutes(), 2) + ":" + zeroPad(date.getSeconds(), 2);
    };
}
