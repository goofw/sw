function(module, exports, __webpack_require__) {
    var Buffer = __webpack_require__(10).Buffer;
    module.exports = function(targets, hint) {
        return void 0 !== hint ? Buffer.concat(targets, hint) : Buffer.concat(targets);
    };
}
