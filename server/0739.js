function(module, exports, __webpack_require__) {
    var buildFn, Buffer = __webpack_require__(10).Buffer, proto = {}, rex = /write.+/;
    for (var key in buildFn = function(key) {
        var code = "return buf." + key + "(" + [ "a", "b", "c" ].join(",") + ")";
        return new Function([ "buf", "a", "b", "c" ], code);
    }, module.exports = proto, Buffer.prototype) rex.test(key) && (proto[key] = buildFn(key));
}
