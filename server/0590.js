function(module, exports) {
    function encode(data) {
        var buffers = [];
        return encode._encode(buffers, data), Buffer.concat(buffers);
    }
    encode._floatConversionDetected = !1, encode._encode = function(buffers, data) {
        if (Buffer.isBuffer(data)) return buffers.push(new Buffer(data.length + ":")), void buffers.push(data);
        switch (typeof data) {
          case "string":
            encode.bytes(buffers, data);
            break;

          case "number":
            encode.number(buffers, data);
            break;

          case "object":
            data.constructor === Array ? encode.list(buffers, data) : encode.dict(buffers, data);
        }
    };
    var buff_e = new Buffer("e"), buff_d = new Buffer("d"), buff_l = new Buffer("l");
    encode.bytes = function(buffers, data) {
        buffers.push(new Buffer(Buffer.byteLength(data) + ":" + data));
    }, encode.number = function(buffers, data) {
        var val = 2147483648 * (data / 2147483648 << 0) + (data % 2147483648 << 0);
        buffers.push(new Buffer("i" + val + "e")), val === data || encode._floatConversionDetected || (encode._floatConversionDetected = !0, 
        console.warn('WARNING: Possible data corruption detected with value "' + data + '":', 'Bencoding only defines support for integers, value was converted to "' + val + '"'), 
        console.trace());
    }, encode.dict = function(buffers, data) {
        buffers.push(buff_d);
        for (var k, j = 0, keys = Object.keys(data).sort(), kl = keys.length; j < kl; j++) k = keys[j], 
        encode.bytes(buffers, k), encode._encode(buffers, data[k]);
        buffers.push(buff_e);
    }, encode.list = function(buffers, data) {
        var i = 0, c = data.length;
        for (buffers.push(buff_l); i < c; i++) encode._encode(buffers, data[i]);
        buffers.push(buff_e);
    }, module.exports = encode;
}
