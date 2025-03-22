function(module, exports, __webpack_require__) {
    var abort = __webpack_require__(488), async = __webpack_require__(487);
    module.exports = function(callback) {
        Object.keys(this.jobs).length && (this.index = this.size, abort(this), async(callback)(null, this.results));
    };
}
