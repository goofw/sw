function(module, exports, __webpack_require__) {
    var iterate = __webpack_require__(486), initState = __webpack_require__(489), terminator = __webpack_require__(490);
    module.exports = function(list, iterator, callback) {
        for (var state = initState(list); state.index < (state.keyedList || list).length; ) iterate(list, iterator, state, (function(error, result) {
            error ? callback(error, result) : 0 !== Object.keys(state.jobs).length || callback(null, state.results);
        })), state.index++;
        return terminator.bind(state, callback);
    };
}
