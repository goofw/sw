function(module, exports, __webpack_require__) {
    __webpack_require__(0);
    var parsers = __webpack_require__(957);
    exports.get_parser = function(name) {
        if ("sax" === name) return parsers.sax;
        throw new Error("Invalid parser: " + name);
    };
}
