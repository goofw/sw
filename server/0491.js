function(module, exports, __webpack_require__) {
    var iterate = __webpack_require__(486), initState = __webpack_require__(489), terminator = __webpack_require__(490);
    function ascending(a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
    }
    module.exports = function(list, iterator, sortMethod, callback) {
        var state = initState(list, sortMethod);
        return iterate(list, iterator, state, (function iteratorHandler(error, result) {
            error ? callback(error, result) : (state.index++, state.index < (state.keyedList || list).length ? iterate(list, iterator, state, iteratorHandler) : callback(null, state.results));
        })), terminator.bind(state, callback);
    }, module.exports.ascending = ascending, module.exports.descending = function(a, b) {
        return -1 * ascending(a, b);
    };
}
