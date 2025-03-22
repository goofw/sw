function(module, exports) {
    var tagToName = {
        3: "ESDescriptor",
        4: "DecoderConfigDescriptor",
        5: "DecoderSpecificInfo",
        6: "SLConfigDescriptor"
    };
    exports.Descriptor = {}, exports.Descriptor.decode = function(buf, start, end) {
        var lenByte, obj, tag = buf.readUInt8(start), ptr = start + 1, len = 0;
        do {
            len = len << 7 | 127 & (lenByte = buf.readUInt8(ptr++));
        } while (128 & lenByte);
        var tagName = tagToName[tag];
        return (obj = exports[tagName] ? exports[tagName].decode(buf, ptr, end) : {
            buffer: Buffer.from(buf.slice(ptr, ptr + len))
        }).tag = tag, obj.tagName = tagName, obj.length = ptr - start + len, obj.contentsLen = len, 
        obj;
    }, exports.DescriptorArray = {}, exports.DescriptorArray.decode = function(buf, start, end) {
        for (var ptr = start, obj = {}; ptr + 2 <= end; ) {
            var descriptor = exports.Descriptor.decode(buf, ptr, end);
            ptr += descriptor.length, obj[tagToName[descriptor.tag] || "Descriptor" + descriptor.tag] = descriptor;
        }
        return obj;
    }, exports.ESDescriptor = {}, exports.ESDescriptor.decode = function(buf, start, end) {
        var flags = buf.readUInt8(start + 2), ptr = start + 3;
        return 128 & flags && (ptr += 2), 64 & flags && (ptr += buf.readUInt8(ptr) + 1), 
        32 & flags && (ptr += 2), exports.DescriptorArray.decode(buf, ptr, end);
    }, exports.DecoderConfigDescriptor = {}, exports.DecoderConfigDescriptor.decode = function(buf, start, end) {
        var oti = buf.readUInt8(start), obj = exports.DescriptorArray.decode(buf, start + 13, end);
        return obj.oti = oti, obj;
    };
}
