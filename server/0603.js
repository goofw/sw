function(module, exports) {
    exports.BufferUtil = {
        merge: function(mergedBuffer, buffers) {
            for (var offset = 0, i = 0, l = buffers.length; i < l; ++i) {
                var buf = buffers[i];
                buf.copy(mergedBuffer, offset), offset += buf.length;
            }
        },
        mask: function(source, mask, output, offset, length) {
            for (var maskNum = mask.readUInt32LE(0, !0), i = 0; i < length - 3; i += 4) {
                var num = maskNum ^ source.readUInt32LE(i, !0);
                num < 0 && (num = 4294967296 + num), output.writeUInt32LE(num, offset + i, !0);
            }
            switch (length % 4) {
              case 3:
                output[offset + i + 2] = source[i + 2] ^ mask[2];

              case 2:
                output[offset + i + 1] = source[i + 1] ^ mask[1];

              case 1:
                output[offset + i] = source[i] ^ mask[0];
            }
        },
        unmask: function(data, mask) {
            for (var maskNum = mask.readUInt32LE(0, !0), length = data.length, i = 0; i < length - 3; i += 4) {
                var num = maskNum ^ data.readUInt32LE(i, !0);
                num < 0 && (num = 4294967296 + num), data.writeUInt32LE(num, i, !0);
            }
            switch (length % 4) {
              case 3:
                data[i + 2] = data[i + 2] ^ mask[2];

              case 2:
                data[i + 1] = data[i + 1] ^ mask[1];

              case 1:
                data[i] = data[i] ^ mask[0];
            }
        }
    };
}
