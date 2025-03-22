function(module, exports, __webpack_require__) {
    var serialOrdered = __webpack_require__(491);
    module.exports = function(list, iterator, callback) {
        return serialOrdered(list, iterator, null, callback);
    };
}
