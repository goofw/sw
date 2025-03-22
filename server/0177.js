function(module, exports, __webpack_require__) {
    var proto = {};
    function mix(from, into) {
        for (var key in from) into[key] = from[key];
    }
    module.exports = proto, proto.from = __webpack_require__(731), proto.to = __webpack_require__(732), 
    proto.is = __webpack_require__(733), proto.subarray = __webpack_require__(734), 
    proto.join = __webpack_require__(735), proto.copy = __webpack_require__(736), proto.create = __webpack_require__(737), 
    mix(__webpack_require__(738), proto), mix(__webpack_require__(739), proto);
}
