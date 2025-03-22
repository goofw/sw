function(module, exports, __webpack_require__) {
    var getForMkv = __webpack_require__(638), getForMp4 = __webpack_require__(677);
    module.exports = {
        get: function(url, container, cb) {
            void 0 === container && (container = url.match(/\.mkv/) ? "mkv" : "mp4"), "matroska" === container && (container = "mkv"), 
            ("mkv" === container ? getForMkv : getForMp4)(url, cb);
        },
        getForMkv: getForMkv,
        getForMp4: getForMp4
    };
}
