function(module, exports) {
    module.exports = function(blob, cb) {
        if ("undefined" == typeof Blob || !(blob instanceof Blob)) throw new Error("first argument must be a Blob");
        if ("function" != typeof cb) throw new Error("second argument must be a function");
        var reader = new FileReader;
        reader.addEventListener("loadend", (function onLoadEnd(e) {
            reader.removeEventListener("loadend", onLoadEnd, !1), e.error ? cb(e.error) : cb(null, Buffer.from(reader.result));
        }), !1), reader.readAsArrayBuffer(blob);
    };
}
