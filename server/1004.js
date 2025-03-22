function(module, exports, __webpack_require__) {
    var Buffer = __webpack_require__(90).Buffer;
    function encode(data, buffer, offset) {
        var buffers = [], result = null;
        return encode._encode(buffers, data), result = Buffer.concat(buffers), encode.bytes = result.length, 
        Buffer.isBuffer(buffer) ? (result.copy(buffer, offset), buffer) : result;
    }
    encode.bytes = -1, encode._floatConversionDetected = !1, encode.getType = function(value) {
        return Buffer.isBuffer(value) ? "buffer" : Array.isArray(value) ? "array" : ArrayBuffer.isView(value) ? "arraybufferview" : value instanceof Number ? "number" : value instanceof Boolean ? "boolean" : value instanceof ArrayBuffer ? "arraybuffer" : typeof value;
    }, encode._encode = function(buffers, data) {
        if (null != data) switch (encode.getType(data)) {
          case "buffer":
            encode.buffer(buffers, data);
            break;

          case "object":
            encode.dict(buffers, data);
            break;

          case "array":
            encode.list(buffers, data);
            break;

          case "string":
            encode.string(buffers, data);
            break;

          case "number":
          case "boolean":
            encode.number(buffers, data);
            break;

          case "arraybufferview":
            encode.buffer(buffers, Buffer.from(data.buffer, data.byteOffset, data.byteLength));
            break;

          case "arraybuffer":
            encode.buffer(buffers, Buffer.from(data));
        }
    };
    var buffE = Buffer.from("e"), buffD = Buffer.from("d"), buffL = Buffer.from("l");
    encode.buffer = function(buffers, data) {
        buffers.push(Buffer.from(data.length + ":"), data);
    }, encode.string = function(buffers, data) {
        buffers.push(Buffer.from(Buffer.byteLength(data) + ":" + data));
    }, encode.number = function(buffers, data) {
        var val = 2147483648 * (data / 2147483648 << 0) + (data % 2147483648 << 0);
        buffers.push(Buffer.from("i" + val + "e")), val === data || encode._floatConversionDetected || (encode._floatConversionDetected = !0, 
        console.warn('WARNING: Possible data corruption detected with value "' + data + '":', 'Bencoding only defines support for integers, value was converted to "' + val + '"'), 
        console.trace());
    }, encode.dict = function(buffers, data) {
        buffers.push(buffD);
        for (var k, j = 0, keys = Object.keys(data).sort(), kl = keys.length; j < kl; j++) null != data[k = keys[j]] && (encode.string(buffers, k), 
        encode._encode(buffers, data[k]));
        buffers.push(buffE);
    }, encode.list = function(buffers, data) {
        var i = 0, c = data.length;
        for (buffers.push(buffL); i < c; i++) null != data[i] && encode._encode(buffers, data[i]);
        buffers.push(buffE);
    }, module.exports = encode;
}
