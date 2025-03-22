function(module, exports) {
    module.exports = function(date, time) {
        const day = 31 & date, month = date >> 5 & 15, year = 1980 + (date >> 9 & 127), seconds = time ? 2 * (31 & time) : 0, minutes = time ? time >> 5 & 63 : 0, hours = time ? time >> 11 : 0;
        return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
    };
}
