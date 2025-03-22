function(module, exports, __webpack_require__) {
    var async = __webpack_require__(487), abort = __webpack_require__(488);
    module.exports = function(list, iterator, state, callback) {
        var key = state.keyedList ? state.keyedList[state.index] : state.index;
        state.jobs[key] = (function(iterator, key, item, callback) {
            return 2 == iterator.length ? iterator(item, async(callback)) : iterator(item, key, async(callback));
        })(iterator, key, list[key], (function(error, output) {
            key in state.jobs && (delete state.jobs[key], error ? abort(state) : state.results[key] = output, 
            callback(error, state.results));
        }));
    };
}
