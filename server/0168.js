function(module, exports) {
    module.exports = isTypedArray, isTypedArray.strict = isStrictTypedArray, isTypedArray.loose = isLooseTypedArray;
    var toString = Object.prototype.toString, names = {
        "[object Int8Array]": !0,
        "[object Int16Array]": !0,
        "[object Int32Array]": !0,
        "[object Uint8Array]": !0,
        "[object Uint8ClampedArray]": !0,
        "[object Uint16Array]": !0,
        "[object Uint32Array]": !0,
        "[object Float32Array]": !0,
        "[object Float64Array]": !0
    };
    function isTypedArray(arr) {
        return isStrictTypedArray(arr) || isLooseTypedArray(arr);
    }
    function isStrictTypedArray(arr) {
        return arr instanceof Int8Array || arr instanceof Int16Array || arr instanceof Int32Array || arr instanceof Uint8Array || arr instanceof Uint8ClampedArray || arr instanceof Uint16Array || arr instanceof Uint32Array || arr instanceof Float32Array || arr instanceof Float64Array;
    }
    function isLooseTypedArray(arr) {
        return names[toString.call(arr)];
    }
}
